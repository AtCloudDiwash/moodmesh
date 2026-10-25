import { League, Post, User } from '../types';

export const demoUser: User = {
  id: 'demo-jordan',
  name: 'Jordan Lee',
  email: 'jordan@example.com',
};
export const photos = {
  cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80',
  coffee:
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80',
  coast:
    'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=900&q=80',
  nature:
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
};
const now = Date.now();
export const demoPosts: Post[] = [
  {
    id: 'demo-bloom',
    userId: 'demo-sophia',
    author: 'Sophia Chen',
    title: 'The Daily Bloom',
    description:
      'A slow morning, a great flat white, and a little corner of calm. Come for the coffee; stay for the sunlight.',
    moods: ['Cozy', 'Productive', 'Happy'],
    rating: 4.8,
    images: [photos.cafe, photos.coffee],
    location: { latitude: 37.7598, longitude: -122.421 },
    placeName: 'Mission District, San Francisco',
    createdAt: new Date(now - 7200000).toISOString(),
    likes: 342,
  },
  {
    id: 'demo-coast',
    userId: demoUser.id,
    author: demoUser.name,
    title: 'An ocean kind of afternoon',
    description: 'Salt in the air and absolutely nowhere to rush. My favorite place to reset.',
    moods: ['Chill', 'Inspired'],
    rating: 4.9,
    images: [photos.coast],
    location: { latitude: 37.7694, longitude: -122.5107 },
    placeName: 'Ocean Beach, San Francisco',
    createdAt: new Date(now - 86400000).toISOString(),
    likes: 128,
  },
  {
    id: 'demo-coffee',
    userId: demoUser.id,
    author: demoUser.name,
    title: 'One more chapter',
    description: 'A warm cup and a good book. Found my new Sunday ritual.',
    moods: ['Cozy', 'Chill'],
    rating: 4.6,
    images: [photos.coffee],
    location: { latitude: 37.776, longitude: -122.424 },
    placeName: 'Hayes Valley, San Francisco',
    createdAt: new Date(now - 172800000).toISOString(),
    likes: 76,
    leagueId: 'demo-cozy',
  },
  {
    id: 'demo-green',
    userId: 'demo-marco',
    author: 'Marco Rivera',
    title: 'Take the scenic route',
    description: 'A quiet trail and a different shade of green around every corner.',
    moods: ['Inspired', 'Happy'],
    rating: 4.7,
    images: [photos.nature],
    location: { latitude: 37.7694, longitude: -122.4862 },
    placeName: 'Golden Gate Park, San Francisco',
    createdAt: new Date(now - 259200000).toISOString(),
    likes: 204,
  },
];
export const demoLeagues: League[] = [
  {
    id: 'demo-cozy',
    title: 'Cozy Season Challenge',
    description:
      'Find five places that feel like a warm hug. Share a photo, a mood, and what made each spot special.',
    author: 'MoodMesh',
    image: photos.coffee,
    startsAt: new Date(now - 86400000 * 7).toISOString(),
    endsAt: new Date(now + 86400000 * 13).toISOString(),
    mood: 'Cozy',
    goal: 5,
  },
  {
    id: 'demo-gems',
    title: 'Hidden Gems',
    description:
      'Discover three overlooked corners of your city. The smaller the spot, the bigger the story.',
    author: 'MoodMesh',
    image: photos.cafe,
    startsAt: new Date(now - 86400000).toISOString(),
    endsAt: new Date(now + 86400000 * 20).toISOString(),
    mood: 'Inspired',
    goal: 3,
  },
  {
    id: 'demo-nature',
    title: 'A Little More Outside',
    description: 'Trade screen time for green time. Share three places that help you slow down.',
    author: 'MoodMesh',
    image: photos.nature,
    startsAt: new Date(now + 86400000 * 5).toISOString(),
    endsAt: new Date(now + 86400000 * 30).toISOString(),
    mood: 'Chill',
    goal: 3,
  },
];
