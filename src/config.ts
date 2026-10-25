// Expo inlines public settings into the app. Never add a server API key here.
export const settings = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? '',
  project: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ?? '',
  database: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ?? '',
  posts: process.env.EXPO_PUBLIC_APPWRITE_POSTS_COLLECTION_ID ?? '',
  leagues: process.env.EXPO_PUBLIC_APPWRITE_LEAGUES_COLLECTION_ID ?? '',
  activities: process.env.EXPO_PUBLIC_APPWRITE_ACTIVITIES_COLLECTION_ID ?? '',
  bucket: process.env.EXPO_PUBLIC_APPWRITE_IMAGES_BUCKET_ID ?? '',
  functionId: process.env.EXPO_PUBLIC_APPWRITE_FUNCTION_ID ?? '',
};
export const demoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
const filled = (value: string) =>
  Boolean(value.trim()) && !/^(replace_|your_|placeholder)/i.test(value);
export const backendReady =
  Object.values(settings).every(filled) && /^https:\/\/[^\s]+\/v1\/?$/.test(settings.endpoint);
