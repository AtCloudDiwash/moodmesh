import test from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../src/main.mjs';

const env = {
  APPWRITE_FUNCTION_API_ENDPOINT: 'https://example.invalid/v1',
  APPWRITE_FUNCTION_PROJECT_ID: 'test-project',
  MOODMESH_DATABASE_ID: 'db',
  MOODMESH_POSTS_COLLECTION_ID: 'posts',
  MOODMESH_LEAGUES_COLLECTION_ID: 'leagues',
  MOODMESH_ACTIVITIES_COLLECTION_ID: 'activities',
  MOODMESH_IMAGES_BUCKET_ID: 'images',
};
const valid = () => ({
  title: 'A place',
  description: '',
  placeName: 'Somewhere',
  moods: ['Happy'],
  rating: 5,
  location: { latitude: 0, longitude: 0 },
  fileIds: ['file-1'],
});
function fixture() {
  const documents = new Map(),
    writes = [];
  const files = new Map([
    [
      'file-1',
      {
        $id: 'file-1',
        $permissions: ['read("user:alice")', 'delete("user:alice")'],
        mimeType: 'image/jpeg',
        sizeOriginal: 100,
        chunksTotal: 1,
        chunksUploaded: 1,
      },
    ],
  ]);
  const fetchImpl = async (url, options) => {
    const path = new URL(url).pathname;
    const reply = (value, status = 200) =>
      new Response(JSON.stringify(value), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    if (path.endsWith('/account')) {
      assert.equal(
        options.headers['X-Appwrite-Key'],
        undefined,
        'User verification must not use an admin key',
      );
      return reply({ $id: 'alice', name: 'Alice' });
    }
    const fileId = path.match(/\/files\/(.+)$/)?.[1];
    if (fileId) {
      if (!files.has(fileId)) return reply({}, 404);
      if (options.method === 'PUT')
        Object.assign(files.get(fileId), { $permissions: JSON.parse(options.body).permissions });
      return reply(files.get(fileId));
    }
    const collection = path.match(/\/collections\/(.+?)\//)?.[1];
    const documentId = path.match(/\/documents\/(.+)$/)?.[1];
    if (options.method === 'GET')
      return documents.has(collection + ':' + documentId)
        ? reply(documents.get(collection + ':' + documentId))
        : reply({}, 404);
    if (options.method === 'POST') {
      const body = JSON.parse(options.body),
        key = collection + ':' + body.documentId;
      if (documents.has(key)) return reply({}, 409);
      const document = {
        $id: body.documentId,
        $createdAt: new Date().toISOString(),
        $permissions: body.permissions,
        ...body.data,
      };
      documents.set(key, document);
      writes.push(document);
      return reply(document);
    }
    if (options.method === 'DELETE') {
      documents.delete(collection + ':' + documentId);
      return new Response(null, { status: 204 });
    }
    throw new Error('Unexpected test request');
  };
  const invoke = (body, headers = {}) =>
    handle(
      {
        req: {
          headers: {
            'x-appwrite-user-jwt': 'test-jwt',
            'x-appwrite-user-id': 'alice',
            'x-appwrite-key': 'test-key',
            ...headers,
          },
          bodyText: JSON.stringify(body),
        },
        res: { json: (body, status = 200) => ({ body, status }) },
      },
      { env, fetchImpl },
    );
  return { invoke, documents, files, writes };
}

test('rejects unauthenticated execution before any backend access', async () => {
  const result = await handle(
    { req: { headers: {} }, res: { json: (body, status) => ({ body, status }) } },
    {
      env,
      fetchImpl: () => {
        throw new Error('Must not fetch');
      },
    },
  );
  assert.equal(result.status, 401);
});
test('rejects a mismatch between session identity and the supplied header', async () => {
  const result = await fixture().invoke(
    { action: 'publish', requestId: 'draft-1', draft: valid() },
    { 'x-appwrite-user-id': 'bob' },
  );
  assert.equal(result.status, 401);
});
test('derives authorship from the verified account and deduplicates publish retries', async () => {
  const f = fixture(),
    body = {
      action: 'publish',
      requestId: 'draft-1',
      user_id: 'bob',
      draft: { ...valid(), user_id: 'bob', username: 'Bob' },
    };
  const first = await f.invoke(body),
    again = await f.invoke(body);
  assert.equal(first.status, 200);
  assert.equal(first.body.post.user_id, 'alice');
  assert.equal(first.body.post.username, 'Alice');
  assert.equal(first.body.post.$id, again.body.post.$id);
  assert.equal(f.writes.length, 1);
  assert.deepEqual(first.body.post.$permissions, ['read("any")']);
  assert.deepEqual(f.files.get('file-1').$permissions, ['read("any")']);
});
test('rejects out-of-range coordinates and malformed mood data', async () => {
  for (const patch of [
    { location: { latitude: 91, longitude: 0 } },
    { moods: ['Happy', 'Happy'] },
    { moods: ['unknown'] },
    { rating: 6 },
    { fileIds: ['https://outside.invalid/image.jpg'] },
  ]) {
    const f = fixture();
    assert.equal(
      (await f.invoke({ action: 'publish', requestId: 'draft-1', draft: { ...valid(), ...patch } }))
        .status,
      400,
    );
    assert.equal(f.writes.length, 0);
  }
});
test('rejects publishing photos owned by another account', async () => {
  const f = fixture();
  f.files.get('file-1').$permissions = ['read("user:bob")', 'delete("user:bob")'];
  assert.equal(
    (await f.invoke({ action: 'publish', requestId: 'draft-1', draft: valid() })).status,
    403,
  );
  assert.equal(f.writes.length, 0);
});
test('save writes are private and repeated requests create one activity', async () => {
  const f = fixture();
  f.documents.set('posts:place-1', { $id: 'place-1' });
  const body = {
    action: 'activity',
    targetId: 'place-1',
    kind: 'save',
    enabled: true,
    user_id: 'bob',
  };
  const first = await f.invoke(body),
    again = await f.invoke(body);
  assert.equal(first.status, 200);
  assert.equal(first.body.activity.id, again.body.activity.id);
  assert.equal(f.writes.length, 1);
  assert.deepEqual(f.writes[0].$permissions, ['read("user:alice")']);
  assert.equal(f.writes[0].user_id, 'alice');
  await f.invoke({ ...body, enabled: false });
  await f.invoke({ ...body, enabled: false });
  assert.equal(f.documents.has('activities:' + first.body.activity.id), false);
});
test('joining an expired challenge is rejected by the server clock', async () => {
  const f = fixture();
  f.documents.set('leagues:league-1', {
    $id: 'league-1',
    start_time: '2020-01-01',
    end_time: '2020-02-01',
  });
  assert.equal(
    (await f.invoke({ action: 'activity', targetId: 'league-1', kind: 'join', enabled: true }))
      .status,
    409,
  );
  assert.equal(f.writes.length, 0);
});
test('challenge submissions require a verified membership', async () => {
  const f = fixture();
  f.documents.set('leagues:league-1', {
    $id: 'league-1',
    start_time: '2020-01-01',
    end_time: '2099-01-01',
  });
  assert.equal(
    (
      await f.invoke({
        action: 'publish',
        requestId: 'draft-1',
        draft: { ...valid(), leagueId: 'league-1' },
      })
    ).status,
    403,
  );
});
test('backend errors never echo secrets or raw exception text', async () => {
  const result = await handle(
    {
      req: {
        headers: {
          'x-appwrite-user-id': 'alice',
          'x-appwrite-user-jwt': 'test',
          'x-appwrite-key': 'secret-marker',
        },
        bodyText: '{}',
      },
      res: { json: (body, status) => ({ body, status }) },
    },
    {
      env,
      fetchImpl: async () => {
        throw new Error('secret-marker backend url');
      },
    },
  );
  assert.equal(result.status, 503);
  assert.equal(JSON.stringify(result).includes('secret-marker'), false);
});
