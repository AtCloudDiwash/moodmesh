import { Coordinates, PostDraft } from '../types';

export const MAX_PHOTOS = 3;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export function validCoordinates(value: Coordinates | null): value is Coordinates {
  return !!value && Number.isFinite(value.latitude) && Number.isFinite(value.longitude)
    && Math.abs(value.latitude) <= 90 && Math.abs(value.longitude) <= 180;
}
export function validatePost(draft: PostDraft): string | null {
  if (!draft.title.trim() || draft.title.trim().length > 80) return 'Give your place a title of 1–80 characters.';
  if (!draft.placeName.trim() || draft.placeName.trim().length > 120) return 'Add a location name of 1–120 characters.';
  if (draft.description.trim().length > 500) return 'Keep your note under 500 characters.';
  if (!draft.moods.length || draft.moods.length > 3) return 'Choose between one and three moods.';
  if (!Number.isInteger(draft.rating) || draft.rating < 1 || draft.rating > 5) return 'Choose a rating from one to five stars.';
  if (!validCoordinates(draft.location)) return 'Choose a valid location on the map.';
  if (!draft.images.length || draft.images.length > MAX_PHOTOS) return 'Add one to three photos.';
  if (draft.images.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size <= 0 || file.size > MAX_IMAGE_BYTES)) return 'Use JPG, PNG, or WebP photos smaller than 8 MB.';
  return null;
}
export function safeError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  // Never display raw SDK responses, URLs, credentials, or backend exception text.
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
  if (code === 401) return 'Please sign in again to continue.';
  if (code === 403) return 'You do not have permission to do that.';
  if (code === 429) return 'Too many requests. Wait a moment and try again.';
  return fallback;
}
