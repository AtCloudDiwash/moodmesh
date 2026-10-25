import {
  account,
  database,
  storage,
  functions,
  uploadFile,
  ID,
  Permission,
  Role,
  Query,
} from './backend';
import { backendReady, settings } from '../config';
import { Activity, ActivityKind, League, Post, PostDraft, User } from '../types';
import { validCoordinates, validatePost } from './validation';

type Document = Record<string, unknown> & { $id: string; $createdAt: string };
const text = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);
const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
const number = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const requireBackend = () => {
  if (!backendReady) throw new Error('Backend not configured');
};
export const publicImage = (value: unknown): string => {
  const url = text(value);
  return /^https:\/\//i.test(url) ? url : '';
};
function fileUrl(id: string) {
  if (/^https:\/\//i.test(id)) return id;
  if (!/^[a-zA-Z0-9._-]{1,36}$/.test(id)) return '';
  return String(storage.getFileView(settings.bucket, id));
}
function toPost(doc: Document): Post {
  const raw = Array.isArray(doc.location) ? doc.location : [];
  const location =
    raw.length === 2 && raw.every((value) => String(value).trim() !== '')
      ? { latitude: Number(raw[0]), longitude: Number(raw[1]) }
      : null;
  return {
    id: doc.$id,
    userId: text(doc.user_id),
    author: text(doc.username, 'Explorer'),
    title: text(doc.title, 'A place to discover'),
    description: text(doc.description),
    moods: strings(doc.mood),
    rating: Math.min(5, Math.max(0, number(doc.rating))),
    images: strings(doc.img_urls).map(fileUrl).filter(Boolean),
    location: validCoordinates(location) ? location : null,
    placeName: text(doc.place_name, 'Shared location'),
    createdAt: doc.$createdAt,
    likes: Math.max(0, number(doc.like_counts)),
    leagueId: text(doc.league_id) || undefined,
  };
}
function toLeague(doc: Document): League {
  const end = text(doc.end_time);
  return {
    id: doc.$id,
    title: text(doc.title, 'Community challenge'),
    description: text(doc.description),
    author: text(doc.author, 'MoodMesh'),
    image: publicImage(doc.banner_url),
    mood: text(doc.mood, 'Inspired'),
    goal: Math.max(1, Math.floor(number(doc.goal, 5))),
    startsAt: text(doc.start_time, doc.$createdAt),
    endsAt:
      end ||
      new Date(
        new Date(doc.$createdAt).getTime() + Math.max(0, number(doc.life_span)) * 1000,
      ).toISOString(),
  };
}
export async function currentUser(): Promise<User> {
  requireBackend();
  const user = await account.get();
  return { id: user.$id, name: user.name, email: user.email };
}
export async function signIn(email: string, password: string) {
  requireBackend();
  await account.createEmailPasswordSession(email.trim().toLowerCase(), password);
  return currentUser();
}
export async function signUp(name: string, email: string, password: string) {
  requireBackend();
  await account.create(ID.unique(), email.trim().toLowerCase(), password, name.trim());
}
export async function signOut() {
  requireBackend();
  await account.deleteSession('current');
}

export async function listPosts(
  cursor?: string,
  filters: string[] = [],
): Promise<{ items: Post[]; cursor?: string; total: number }> {
  requireBackend();
  const result = await database.listDocuments(settings.database, settings.posts, [
    Query.orderDesc('$createdAt'),
    Query.limit(20),
    ...(cursor ? [Query.cursorAfter(cursor)] : []),
    ...filters,
  ]);
  const items = await Promise.all(
    result.documents.map(async (doc) => {
      const post = toPost(doc);
      const likes = await database.listDocuments(settings.database, settings.activities, [
        Query.equal('target_id', post.id),
        Query.equal('kind', 'like'),
        Query.limit(1),
      ]);
      return { ...post, likes: post.likes + likes.total };
    }),
  );
  return {
    items,
    cursor: items.length === 20 ? items[items.length - 1].id : undefined,
    total: result.total,
  };
}
export async function getPost(id: string) {
  requireBackend();
  return toPost(await database.getDocument(settings.database, settings.posts, id));
}
export async function listLeagues(): Promise<League[]> {
  requireBackend();
  const rows: League[] = [];
  let cursor: string | undefined;
  do {
    const page = await database.listDocuments(settings.database, settings.leagues, [
      Query.orderDesc('$createdAt'),
      Query.limit(100),
      ...(cursor ? [Query.cursorAfter(cursor)] : []),
    ]);
    rows.push(...page.documents.map(toLeague));
    cursor = page.documents.length === 100 ? page.documents[99].$id : undefined;
  } while (cursor);
  return rows;
}
export async function listActivities(userId: string): Promise<Activity[]> {
  requireBackend();
  const rows: Activity[] = [];
  let cursor: string | undefined;
  do {
    const page = await database.listDocuments(settings.database, settings.activities, [
      Query.equal('user_id', userId),
      Query.limit(100),
      ...(cursor ? [Query.cursorAfter(cursor)] : []),
    ]);
    rows.push(
      ...page.documents
        .filter((doc) => ['like', 'save', 'join'].includes(doc.kind))
        .map((doc) => ({ id: doc.$id, targetId: doc.target_id, kind: doc.kind })),
    );
    cursor = page.documents.length === 100 ? page.documents[99].$id : undefined;
  } while (cursor);
  return rows;
}
async function write<T>(payload: object): Promise<T> {
  requireBackend();
  const execution = await functions.createExecution(
    settings.functionId,
    JSON.stringify(payload),
    false,
  );
  let result: { ok?: boolean } & T;
  try {
    result = JSON.parse(execution.responseBody);
  } catch {
    throw new Error('Could not confirm the request');
  }
  if (execution.responseStatusCode !== 200 || !result.ok) {
    const error = new Error('Request could not be completed');
    Object.assign(error, { code: execution.responseStatusCode });
    throw error;
  }
  return result;
}
export async function setActivity(targetId: string, kind: ActivityKind, enabled: boolean) {
  const result = await write<{ activity: Activity | null }>({
    action: 'activity',
    targetId,
    kind,
    enabled,
  });
  return result.activity;
}
export function leagueStatus(league: League, now = Date.now()): 'Active' | 'Upcoming' | 'Past' {
  const start = Date.parse(league.startsAt),
    end = Date.parse(league.endsAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= now) return 'Past';
  return start > now ? 'Upcoming' : 'Active';
}
type Publication = { draft: PostDraft; files: string[] };
const publications = new Map<string, Publication>();
export async function publishPost(draft: PostDraft, user: User, requestId: string): Promise<Post> {
  requireBackend();
  if (validatePost(draft)) throw new Error('Invalid post');
  const key = user.id + ':' + requestId;
  let attempt = publications.get(key);
  if (!attempt) {
    attempt = { draft: JSON.parse(JSON.stringify(draft)) as PostDraft, files: [] };
    publications.set(key, attempt);
  }
  // Keep uploaded file IDs across retries. Each request ID creates at most one post.
  // Files stay private until the function verifies ownership and accepts the post.
  const permissions = [Permission.read(Role.user(user.id)), Permission.delete(Role.user(user.id))];
  for (let index = attempt.files.length; index < attempt.draft.images.length; index++) {
    const file = await uploadFile(attempt.draft.images[index], ID.unique(), permissions);
    attempt.files.push(file.$id);
  }
  const { images: _images, ...details } = attempt.draft;
  const result = await write<{ post: Document }>({
    action: 'publish',
    requestId,
    draft: { ...details, fileIds: attempt.files },
  });
  publications.delete(key);
  return toPost(result.post);
}
export { Query };
