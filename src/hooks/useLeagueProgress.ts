import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { demoMode, settings } from '../config';
import { database, Query } from '../lib/backend';

export function useLeagueProgress() {
  const { user } = useAuth(),
    data = useData();
  const [counts, setCounts] = useState<Record<string, number>>({}),
    [error, setError] = useState<string | null>(null),
    [attempt, setAttempt] = useState(0);
  const ids = JSON.stringify(data.leagues.map((league) => league.id));
  useEffect(() => {
    let active = true;
    if (!user) return;
    if (demoMode) {
      setCounts(
        Object.fromEntries(
          data.leagues.map((league) => [
            league.id,
            data.samples.filter((post) => post.userId === user.id && post.leagueId === league.id)
              .length,
          ]),
        ),
      );
      return;
    }
    setError(null);
    Promise.all(
      (JSON.parse(ids) as string[]).map(async (id) => {
        const result = await database.listDocuments(settings.database, settings.posts, [
          Query.equal('user_id', user.id),
          Query.equal('league_id', id),
          Query.limit(1),
        ]);
        return [id, result.total] as const;
      }),
    )
      .then((entries) => {
        if (active) setCounts(Object.fromEntries(entries));
      })
      .catch(() => {
        if (active) setError('Could not load challenge progress. Please retry.');
      });
    return () => {
      active = false;
    };
  }, [ids, user, data.revision, data.samples, data.leagues, attempt]);
  return { counts, error, retry: () => setAttempt((value) => value + 1) };
}
