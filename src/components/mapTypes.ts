import { Coordinates, Post } from '../types';
export type MapProps = { posts: Post[]; selectedId?: string; onSelect?: (id: string) => void; center?: Coordinates | null; picked?: Coordinates | null; onPick?: (location: Coordinates) => void };
