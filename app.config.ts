import type { ExpoConfig, ConfigContext } from 'expo/config';
export default ({ config }: ConfigContext): ExpoConfig => {
  const mapsKey = process.env.GOOGLE_MAPS_ANDROID_KEY;
  const hasMapsKey = Boolean(mapsKey && !mapsKey.startsWith('replace_'));
  return {
    ...config,
    name: config.name ?? 'MoodMesh', slug: config.slug ?? 'MoodMesh',
    android: { ...config.android, config: hasMapsKey ? { googleMaps: { apiKey: mapsKey } } : {} },
    extra: { ...config.extra, androidMapsConfigured: hasMapsKey },
  };
};
