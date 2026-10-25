export const colors = {
  blue: '#1464FF',
  ink: '#142039',
  muted: '#697386',
  paper: '#FAF9F6',
  white: '#FFFFFF',
  line: '#EAE9E4',
  field: '#F1F0ED',
  red: '#D94361',
  yellow: '#ECA827',
  green: '#34745A',
  lavender: '#EFE5FF',
};

export const moods = [
  { name: 'Happy', icon: 'sunny-outline', color: '#A66A00', background: '#FFF0B8' },
  { name: 'Chill', icon: 'flower-outline', color: '#8051BC', background: '#EFE3FC' },
  { name: 'Productive', icon: 'laptop-outline', color: '#216EAD', background: '#DDEFFF' },
  { name: 'Romantic', icon: 'heart-outline', color: '#BD3B59', background: '#FFE1E6' },
  { name: 'Inspired', icon: 'leaf-outline', color: '#447744', background: '#E3F2DD' },
  { name: 'Cozy', icon: 'cafe-outline', color: '#9B6537', background: '#F6E7D8' },
] as const;

export function moodStyle(name: string) {
  return moods.find((mood) => mood.name.toLowerCase() === name.toLowerCase()) ?? moods[1];
}
