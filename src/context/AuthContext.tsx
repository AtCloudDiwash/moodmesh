import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { backendReady, demoMode } from '../config';
import { demoUser } from '../data/demo';
import { User } from '../types';
import * as api from '../lib/api';
import { safeError } from '../lib/validation';

type Auth = { user: User | null; loading: boolean; error: string | null; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; retry: () => void };
const Context = createContext<Auth | undefined>(undefined);
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(demoMode ? demoUser : null);
  const [loading, setLoading] = useState(!demoMode && backendReady);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    if (demoMode || !backendReady) return;
    setLoading(true);
    api.currentUser().then(result => { if (active) { setUser(result); setError(null); } }).catch(error => {
      if (active && !(typeof error === 'object' && error?.code === 401)) setError('Could not restore your session. Check your connection and retry.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  const login = async (email: string, password: string) => {
    try { setUser(await api.signIn(email, password)); setError(null); }
    catch { throw new Error('Could not sign in. Check your email, password, and connection.'); }
  };
  const logout = async () => {
    if (demoMode) return;
    try { await api.signOut(); setUser(null); }
    catch (error) { throw new Error(safeError(error, 'Could not sign out. Please try again.')); }
  };
  return <Context.Provider value={{ user, loading, error, login, logout, retry: () => setAttempt(value => value + 1) }}>{children}</Context.Provider>;
}
export function useAuth() {
  const context = useContext(Context);
  if (!context) throw new Error('AuthProvider is required');
  return context;
}
