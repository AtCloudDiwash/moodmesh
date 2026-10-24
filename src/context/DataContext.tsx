import React, { createContext, useCallback, useContext, useEffect, useRef, useState, PropsWithChildren } from 'react';
import { demoMode } from '../config';
import { demoLeagues, demoPosts } from '../data/demo';
import { Activity, ActivityKind, League, Post, PostDraft } from '../types';
import * as api from '../lib/api';
import { safeError } from '../lib/validation';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from './AuthContext';

function useDataValue() {
  const { user } = useAuth();
  const [samples, setSamples] = useState(demoPosts);
  const [revision, setRevision] = useState(0);
  const feed = usePosts(samples, [], revision);
  const [leagues, setLeagues] = useState<League[]>(demoMode ? demoLeagues : []);
  const [activities, setActivities] = useState<Activity[]>(demoMode ? [{ id: 'demo-join', kind: 'join', targetId: 'demo-cozy' }] : []);
  const [loading, setLoading] = useState(!demoMode);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const locks = useRef(new Set<string>());
  const mounted = useRef(true), request = useRef(0);
  const reload = useCallback(async () => {
    if (demoMode || !user) return;
    const current = ++request.current;
    setLoading(true); setError(null);
    try {
      const [nextLeagues, nextActivities] = await Promise.all([api.listLeagues(), api.listActivities(user.id)]);
      if (mounted.current && current === request.current) { setLeagues(nextLeagues); setActivities(nextActivities); }
    } catch (error) { if (mounted.current && current === request.current) setError(safeError(error, 'Could not sync your library and challenges. Please retry.')); }
    finally { if (mounted.current && current === request.current) setLoading(false); }
  }, [user]);
  useEffect(() => { mounted.current = true; void reload(); return () => { mounted.current = false; request.current++; }; }, [reload]);
  const has = (kind: ActivityKind, id: string) => activities.some(item => item.kind === kind && item.targetId === id);
  const toggle = async (kind: ActivityKind, targetId: string) => {
    const key = `${kind}:${targetId}`;
    if (!user || locks.current.has(key) || loading || error) return;
    if (kind === 'join') {
      const league = leagues.find(item => item.id === targetId);
      if (!league || api.leagueStatus(league) !== 'Active') throw new Error('This challenge is not open for joining.');
    }
    locks.current.add(key); setPending(new Set(locks.current));
    const existing = activities.find(item => item.kind === kind && item.targetId === targetId);
    try {
      let next: Activity | null = null;
      if (existing) { if (!demoMode) await api.removeActivity(existing.id); }
      else next = demoMode ? { id: `demo-${key}`, kind, targetId } : await api.addActivity(user.id, targetId, kind);
      if (!mounted.current) return;
      setActivities(previous => existing ? previous.filter(item => item.id !== existing.id) : [...previous, next!]);
      if (kind === 'like') {
        if (demoMode) setSamples(previous => previous.map(post => post.id === targetId ? { ...post, likes: Math.max(0, post.likes + (existing ? -1 : 1)) } : post));
        else setRevision(value => value + 1);
      }
    } catch (error) {
      // Reconcile after a failed/ambiguous write before allowing another attempt.
      await reload();
      throw new Error(safeError(error, 'Could not save that change. Please try again.'));
    } finally { locks.current.delete(key); if (mounted.current) setPending(new Set(locks.current)); }
  };
  const publish = async (draft: PostDraft): Promise<Post> => {
    if (!user) throw new Error('Please sign in first.');
    const post = demoMode ? { id: `demo-${Date.now()}`, userId: user.id, author: user.name, title: draft.title.trim(), description: draft.description.trim(), moods: draft.moods, rating: draft.rating, images: draft.images.map(image => image.uri), location: draft.location, placeName: draft.placeName.trim(), likes: 0, createdAt: new Date().toISOString(), leagueId: draft.leagueId } : await api.publishPost(draft, user);
    if (mounted.current) { if (demoMode) setSamples(previous => [post, ...previous]); setRevision(value => value + 1); }
    return post;
  };
  return { ...feed, samples, revision, leagues, activities, libraryLoading: loading, libraryError: error, reload, has, toggle, pending, publish };
}
const Context = createContext<ReturnType<typeof useDataValue> | undefined>(undefined);
export function DataProvider({ children }: PropsWithChildren) { const data = useDataValue(); return <Context.Provider value={data}>{children}</Context.Provider>; }
export function useData() { const data = useContext(Context); if (!data) throw new Error('DataProvider is required'); return data; }
