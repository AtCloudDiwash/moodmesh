import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePost, validCoordinates, safeError } from '../src/lib/validation.ts';

const draft = () => ({
  title: 'Coffee',
  placeName: 'A corner café',
  description: '',
  moods: ['Cozy'],
  rating: 4,
  location: { latitude: 0, longitude: 0 },
  images: [{ uri: 'file:///photo.jpg', name: 'photo.jpg', type: 'image/jpeg', size: 1000 }],
});
test('accepts zero coordinates, rejects NaN and coordinates outside Earth', () => {
  assert.equal(validCoordinates({ latitude: 0, longitude: 0 }), true);
  for (const value of [
    null,
    { latitude: NaN, longitude: 0 },
    { latitude: 91, longitude: 0 },
    { latitude: 0, longitude: -181 },
  ])
    assert.equal(validCoordinates(value), false);
});
test('requires a photo, mood, valid rating, and bounded text before upload', () => {
  assert.equal(validatePost(draft()), null);
  for (const patch of [
    { images: [] },
    { moods: [] },
    { rating: 0 },
    { rating: 1.5 },
    { description: 'x'.repeat(501) },
    { title: '  ' },
    { location: null },
    { images: [{ uri: 'file:///x', name: 'x', type: 'image/jpeg', size: 9 * 1024 * 1024 }] },
  ])
    assert.notEqual(validatePost({ ...draft(), ...patch }), null);
});
test('never exposes backend exception text to users', () => {
  assert.equal(safeError({ code: 500, message: 'secret-marker' }).includes('secret-marker'), false);
  assert.equal(safeError({ code: 401 }), 'Please sign in again to continue.');
});
