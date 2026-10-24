import { useCallback, useEffect, useRef, useState } from 'react';
import { demoMode } from '../config';
import { Post } from '../types';
import { listPosts } from '../lib/api';
import { safeError } from '../lib/validation';

export function usePosts(demoPosts: Post[], filters: string[] = [], revision = 0) {
  const [posts, setPosts] = useState<Post[]>(demoMode ? demoPosts : []);
  const [loading, setLoading] = useState(!demoMode);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const cursor = useRef<string | undefined>(undefined);
  const generation = useRef(0), busy = useRef(false);
  const filterKey = JSON.stringify(filters);
  const load = useCallback(async (reset: boolean) => {
    if (demoMode) return;
    if (!reset && (busy.current || !cursor.current)) return;
    const request = ++generation.current;
    busy.current = true;
    setLoading(true); setRefreshing(reset); setError(null);
    try {
      const result = await listPosts(reset ? undefined : cursor.current, JSON.parse(filterKey));
      if (generation.current !== request) return;
      setPosts(previous => reset ? result.items : [...previous, ...result.items.filter(post => !previous.some(existing => existing.id === post.id))]);
      cursor.current = result.cursor; setHasMore(Boolean(result.cursor)); setTotal(result.total);
    } catch (error) { if (generation.current === request) setError(safeError(error, 'Could not load places. Check your connection and retry.')); }
    finally { if (generation.current === request) { busy.current = false; setLoading(false); setRefreshing(false); } }
  }, [filterKey]);
  useEffect(() => { if (!demoMode) void load(true); return () => { generation.current++; busy.current = false; }; }, [load, revision]);
  return { posts: demoMode ? demoPosts : posts, total: demoMode ? demoPosts.length : total, loading, refreshing, error, hasMore, refresh: () => load(true), loadMore: () => load(false) };
}
