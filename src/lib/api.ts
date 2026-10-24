import { account, database, storage, uploadFile, ID, Permission, Role, Query } from './backend';
import { backendReady, settings } from '../config';
import { Activity, ActivityKind, League, Post, PostDraft, User } from '../types';
import { validCoordinates, validatePost } from './validation';

type Document = Record<string, unknown> & { $id: string; $createdAt: string };
const text = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback;
const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
const number = (value: unknown, fallback = 0) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const requireBackend = () => { if (!backendReady) throw new Error('Backend not configured'); };
const ownPermissions = (id: string) => [Permission.read(Role.user(id)), Permission.update(Role.user(id)), Permission.delete(Role.user(id))];
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
  const location = raw.length === 2 && raw.every(value => String(value).trim() !== '')
    ? { latitude: Number(raw[0]), longitude: Number(raw[1]) } : null;
  return { id: doc.$id, userId: text(doc.user_id), author: text(doc.username, 'Explorer'),
    title: text(doc.title, 'A place to discover'), description: text(doc.description), moods: strings(doc.mood),
    rating: Math.min(5, Math.max(0, number(doc.rating))), images: strings(doc.img_urls).map(fileUrl).filter(Boolean),
    location: validCoordinates(location) ? location : null, placeName: text(doc.place_name, 'Shared location'),
    createdAt: doc.$createdAt, likes: Math.max(0, number(doc.like_counts)), leagueId: text(doc.league_id) || undefined };
}
function toLeague(doc: Document): League {
  const end = text(doc.end_time);
  return { id: doc.$id, title: text(doc.title, 'Community challenge'), description: text(doc.description),
    author: text(doc.author, 'MoodMesh'), image: publicImage(doc.banner_url), mood: text(doc.mood, 'Inspired'),
    goal: Math.max(1, Math.floor(number(doc.goal, 5))), startsAt: text(doc.start_time, doc.$createdAt),
    endsAt: end || new Date(new Date(doc.$createdAt).getTime() + Math.max(0, number(doc.life_span)) * 1000).toISOString() };
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
export async function signOut() { requireBackend(); await account.deleteSession('current'); }

export async function listPosts(cursor?: string, filters: string[] = []): Promise<{ items: Post[]; cursor?: string }> {
  requireBackend();
  const result = await database.listDocuments(settings.database, settings.posts,
    [Query.orderDesc('$createdAt'), Query.limit(20), ...(cursor ? [Query.cursorAfter(cursor)] : []), ...filters]);
  const items = await Promise.all(result.documents.map(async doc => {
    const post = toPost(doc);
    const likes = await database.listDocuments(settings.database, settings.activities,
      [Query.equal('target_id', post.id), Query.equal('kind', 'like'), Query.limit(1)]);
    return { ...post, likes: post.likes + likes.total };
  }));
  return { items, cursor: items.length === 20 ? items[items.length - 1].id : undefined };
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
    const page = await database.listDocuments(settings.database, settings.leagues,
      [Query.orderDesc('$createdAt'), Query.limit(100), ...(cursor ? [Query.cursorAfter(cursor)] : [])]);
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
    const page = await database.listDocuments(settings.database, settings.activities,
      [Query.equal('user_id', userId), Query.limit(100), ...(cursor ? [Query.cursorAfter(cursor)] : [])]);
    rows.push(...page.documents.filter(doc => ['like', 'save', 'join'].includes(doc.kind)).map(doc => ({ id: doc.$id, targetId: doc.target_id, kind: doc.kind })));
    cursor = page.documents.length === 100 ? page.documents[99].$id : undefined;
  } while (cursor);
  return rows;
}
export async function addActivity(userId: string, targetId: string, kind: ActivityKind): Promise<Activity> {
  requireBackend();
  const permissions = ownPermissions(userId);
  if (kind === 'like') permissions.push(Permission.read(Role.any()));
  const doc = await database.createDocument(settings.database, settings.activities, ID.unique(),
    { user_id: userId, target_id: targetId, kind }, permissions);
  return { id: doc.$id, targetId, kind };
}
export async function removeActivity(id: string) {
  requireBackend();
  await database.deleteDocument(settings.database, settings.activities, id);
}
export function leagueStatus(league: League, now = Date.now()): 'Active' | 'Upcoming' | 'Past' {
  const start = Date.parse(league.startsAt), end = Date.parse(league.endsAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= now) return 'Past';
  return start > now ? 'Upcoming' : 'Active';
}
export async function publishPost(draft: PostDraft, user: User): Promise<Post> {
  requireBackend();
  if (validatePost(draft)) throw new Error('Invalid post');
  if (draft.leagueId) {
    const league = toLeague(await database.getDocument(settings.database, settings.leagues, draft.leagueId));
    const joined = await database.listDocuments(settings.database, settings.activities,
      [Query.equal('user_id', user.id), Query.equal('target_id', league.id), Query.equal('kind', 'join'), Query.limit(1)]);
    if (leagueStatus(league) !== 'Active' || !joined.total) throw new Error('Challenge unavailable');
  }
  const permissions = [...ownPermissions(user.id), Permission.read(Role.any())];
  const files: string[] = [];
  // Preallocate IDs so a timed-out document write can be reconciled before cleanup.
  const postId = ID.unique();
  let documentAttempted = false;
  try {
    for (const image of draft.images) {
      const file = await uploadFile(image, ID.unique(), permissions);
      files.push(file.$id);
    }
    documentAttempted = true;
    const document = await database.createDocument(settings.database, settings.posts, postId, {
      user_id: user.id, username: user.name, postId, title: draft.title.trim(), description: draft.description.trim(),
      mood: draft.moods, rating: draft.rating, img_urls: files, place_name: draft.placeName.trim(),
      location: [String(draft.location!.latitude), String(draft.location!.longitude)], like_counts: 0,
      ...(draft.leagueId ? { league_id: draft.leagueId } : {}),
    }, permissions);
    return toPost(document);
  } catch (error) {
    if (documentAttempted) {
      try { return toPost(await database.getDocument(settings.database, settings.posts, postId)); }
      catch (lookupError) {
        // A network failure leaves the result unknown. Do not delete potentially referenced images.
        if (!(typeof lookupError === 'object' && lookupError && 'code' in lookupError && lookupError.code === 404)) throw error;
      }
    }
    await Promise.allSettled(files.map(id => storage.deleteFile(settings.bucket, id)));
    throw error;
  }
}
export { Query };
