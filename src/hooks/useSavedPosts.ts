import { useEffect, useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { demoMode } from '../config';
import { getPost } from '../lib/api';
import { Post } from '../types';

export function useSavedPosts() {
  const data = useData();
  const ids = data.activities.filter(item => item.kind === 'save').map(item => item.targetId);
  const key = JSON.stringify(ids);
  const [posts, setPosts] = useState<Post[]>([]), [loading, setLoading] = useState(false), [error, setError] = useState<string | null>(null), [limit, setLimit] = useState(20), [attempt, setAttempt] = useState(0);
  const generation = useRef(0);
  useEffect(() => { setLimit(20); }, [key]);
  useEffect(() => {
    if (demoMode) return;
    const request = ++generation.current;
    setLoading(true); setError(null);
    Promise.all((JSON.parse(key) as string[]).slice(0, limit).map(async id => {
      try { return await getPost(id); }
      catch (error) { if (typeof error === 'object' && error && 'code' in error && error.code === 404) return null; throw error; }
    })).then(result => { if (generation.current === request) setPosts(result.filter((post): post is Post => post !== null)); })
      .catch(() => { if (generation.current === request) setError('Could not load your saved places. Please retry.'); })
      .finally(() => { if (generation.current === request) setLoading(false); });
    return () => { generation.current++; };
  }, [key, limit, attempt]);
  return { posts: demoMode ? data.samples.filter(post => ids.includes(post.id)) : posts, loading, error, hasMore: !demoMode && ids.length > limit, loadMore: () => setLimit(value => value + 20), refresh: () => setAttempt(value => value + 1) };
}
