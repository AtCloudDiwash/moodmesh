import { createHash } from 'node:crypto';

class ApiError extends Error {
  constructor(status) {
    super('Request failed');
    this.status = status;
  }
}
const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,35}$/;
const validId = (value) => typeof value === 'string' && idPattern.test(value);
const read = (role) => `read("${role}")`;
const remove = (role) => `delete("${role}")`;
const stableId = (...parts) =>
  createHash('sha256').update(JSON.stringify(parts)).digest('hex').slice(0, 36);
const requireValue = (condition, status = 400) => {
  if (!condition) throw new ApiError(status);
};
const string = (value, min, max) =>
  typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;
const moods = new Set(['Happy', 'Chill', 'Productive', 'Romantic', 'Inspired', 'Cozy']);

export function validateDraft(draft) {
  requireValue(draft && typeof draft === 'object');
  requireValue(
    string(draft.title, 1, 80) &&
      string(draft.placeName, 1, 120) &&
      string(draft.description, 0, 500),
  );
  requireValue(
    Array.isArray(draft.moods) &&
      draft.moods.length >= 1 &&
      draft.moods.length <= 3 &&
      new Set(draft.moods).size === draft.moods.length &&
      draft.moods.every((mood) => moods.has(mood)),
  );
  requireValue(Number.isInteger(draft.rating) && draft.rating >= 1 && draft.rating <= 5);
  requireValue(
    draft.location &&
      Number.isFinite(draft.location.latitude) &&
      Math.abs(draft.location.latitude) <= 90 &&
      Number.isFinite(draft.location.longitude) &&
      Math.abs(draft.location.longitude) <= 180,
  );
  requireValue(
    Array.isArray(draft.fileIds) &&
      draft.fileIds.length >= 1 &&
      draft.fileIds.length <= 3 &&
      draft.fileIds.every(validId) &&
      new Set(draft.fileIds).size === draft.fileIds.length,
  );
  requireValue(!draft.leagueId || validId(draft.leagueId));
}

// No environment values, request headers, bodies, or SDK errors are logged or returned.
export async function handle({ req, res }, { env = process.env, fetchImpl = fetch } = {}) {
  try {
    requireValue(req.headers?.['x-appwrite-user-jwt'] && req.headers?.['x-appwrite-user-id'], 401);
    const config = {
      endpoint: env.APPWRITE_FUNCTION_API_ENDPOINT,
      project: env.APPWRITE_FUNCTION_PROJECT_ID,
      database: env.MOODMESH_DATABASE_ID,
      posts: env.MOODMESH_POSTS_COLLECTION_ID,
      leagues: env.MOODMESH_LEAGUES_COLLECTION_ID,
      activities: env.MOODMESH_ACTIVITIES_COLLECTION_ID,
      bucket: env.MOODMESH_IMAGES_BUCKET_ID,
    };
    requireValue(
      Object.values(config).every(Boolean) &&
        /^https:\/\//.test(config.endpoint) &&
        req.headers['x-appwrite-key'],
      503,
    );
    const request = async (path, method = 'GET', body, asUser = false) => {
      const headers = { 'Content-Type': 'application/json', 'X-Appwrite-Project': config.project };
      if (asUser) headers['X-Appwrite-JWT'] = req.headers['x-appwrite-user-jwt'];
      else headers['X-Appwrite-Key'] = req.headers['x-appwrite-key'];
      const response = await fetchImpl(config.endpoint.replace(/\/$/, '') + path, {
        method,
        headers,
        signal: AbortSignal.timeout(15000),
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (!response.ok) throw new ApiError(response.status);
      return response.status === 204 ? null : response.json();
    };
    const user = await request('/account', 'GET', undefined, true);
    requireValue(validId(user.$id) && user.$id === req.headers['x-appwrite-user-id'], 401);
    const bodyText = req.bodyText ?? '';
    requireValue(typeof bodyText === 'string' && bodyText.length <= 32768);
    let body;
    try {
      body = bodyText ? JSON.parse(bodyText) : req.bodyJson;
    } catch {
      throw new ApiError(400);
    }
    requireValue(body && typeof body === 'object');
    const documentPath = (collection, id) =>
      `/databases/${encodeURIComponent(config.database)}/collections/${encodeURIComponent(collection)}/documents${id ? '/' + encodeURIComponent(id) : ''}`;
    const filePath = (id) =>
      `/storage/buckets/${encodeURIComponent(config.bucket)}/files/${encodeURIComponent(id)}`;
    const maybeDocument = async (collection, id) => {
      try {
        return await request(documentPath(collection, id));
      } catch (error) {
        if (error.status === 404) return null;
        throw error;
      }
    };
    const requireActiveLeague = async (id) => {
      const league = await request(documentPath(config.leagues, id));
      const starts = Date.parse(league.start_time ?? league.$createdAt);
      const ends = league.end_time
        ? Date.parse(league.end_time)
        : Date.parse(league.$createdAt) + Number(league.life_span ?? 0) * 1000;
      requireValue(
        Number.isFinite(starts) &&
          Number.isFinite(ends) &&
          starts <= Date.now() &&
          ends > Date.now(),
        409,
      );
    };

    if (body.action === 'activity') {
      const { kind, targetId, enabled } = body;
      requireValue(
        ['like', 'save', 'join'].includes(kind) &&
          validId(targetId) &&
          typeof enabled === 'boolean',
      );
      const id = stableId(user.$id, kind, targetId);
      const existing = await maybeDocument(config.activities, id);
      if (!enabled) {
        if (existing) await request(documentPath(config.activities, id), 'DELETE');
        return res.json({ ok: true, activity: null });
      }
      if (kind === 'join') await requireActiveLeague(targetId);
      else await request(documentPath(config.posts, targetId));
      if (!existing) {
        try {
          await request(documentPath(config.activities), 'POST', {
            documentId: id,
            data: { user_id: user.$id, target_id: targetId, kind },
            permissions: [read('user:' + user.$id), ...(kind === 'like' ? [read('any')] : [])],
          });
        } catch (error) {
          if (error.status !== 409) throw error;
        }
      }
      return res.json({ ok: true, activity: { id, targetId, kind } });
    }

    if (body.action === 'publish') {
      requireValue(validId(body.requestId));
      const id = stableId(user.$id, 'post', body.requestId);
      let document = await maybeDocument(config.posts, id);
      if (!document) {
        validateDraft(body.draft);
        const draft = body.draft;
        if (draft.leagueId) {
          await requireActiveLeague(draft.leagueId);
          requireValue(
            await maybeDocument(config.activities, stableId(user.$id, 'join', draft.leagueId)),
            403,
          );
        }
        for (const fileId of draft.fileIds) {
          const file = await request(filePath(fileId));
          requireValue(file.$permissions?.includes(remove('user:' + user.$id)), 403);
          requireValue(
            ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimeType) &&
              file.sizeOriginal > 0 &&
              file.sizeOriginal <= 8 * 1024 * 1024,
          );
          requireValue(file.chunksTotal === file.chunksUploaded);
        }
        try {
          document = await request(documentPath(config.posts), 'POST', {
            documentId: id,
            data: {
              user_id: user.$id,
              username: user.name || 'Explorer',
              postId: id,
              title: draft.title.trim(),
              description: draft.description.trim(),
              place_name: draft.placeName.trim(),
              mood: draft.moods,
              rating: draft.rating,
              img_urls: draft.fileIds,
              location: [String(draft.location.latitude), String(draft.location.longitude)],
              like_counts: 0,
              ...(draft.leagueId ? { league_id: draft.leagueId } : {}),
            },
            permissions: [read('any')],
          });
        } catch (error) {
          if (error.status !== 409) throw error;
          document = await request(documentPath(config.posts, id));
        }
      }
      requireValue(document.user_id === user.$id, 403);
      // Repeating the same request also finishes any interrupted permission updates.
      for (const fileId of document.img_urls)
        await request(filePath(fileId), 'PUT', { permissions: [read('any')] });
      return res.json({ ok: true, post: document });
    }
    throw new ApiError(400);
  } catch (error) {
    const status = [400, 401, 403, 404, 409, 429, 503].includes(error?.status) ? error.status : 503;
    return res.json(
      {
        ok: false,
        error:
          status === 401
            ? 'Please sign in again.'
            : status === 400
              ? 'Check the submitted details.'
              : status === 409
                ? 'This action is no longer available.'
                : 'The request could not be completed. Please retry.',
      },
      status,
    );
  }
}

export default (context) => handle(context);
