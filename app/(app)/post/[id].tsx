import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '@/src/context/DataContext';
import { demoMode } from '@/src/config';
import { getPost } from '@/src/lib/api';
import { Post } from '@/src/types';
import { PostCard } from '@/src/components/PostCard';
import { ErrorNotice, Header, IconButton, Message, Screen } from '@/src/components/ui';

export default function PlaceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(), data = useData(), router = useRouter();
  const existing = data.posts.find(post => post.id === id);
  const [fetched, setFetched] = useState<Post | null>(null), [error, setError] = useState<string | null>(null), [loading, setLoading] = useState(!existing), [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setFetched(null); setError(null);
    if (existing) { setLoading(false); return; }
    if (demoMode || !id) { setError('This place is no longer available.'); setLoading(false); return; }
    setLoading(true);
    getPost(id).then(post => { if (active) setFetched(post); }).catch(() => { if (active) setError('This place could not be loaded. It may have been removed.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, existing, attempt]);
  return <Screen><Header title="A place to remember" action={<IconButton icon="close" label="Back to places" onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/Feed')} />} /><ScrollView><ErrorNotice message={error} retry={() => setAttempt(value => value + 1)} />{existing || fetched ? <PostCard post={existing ?? fetched!} detail /> : loading ? <Message title="Finding this place…" loading /> : null}<ErrorNotice message={data.libraryError} retry={() => void data.reload()} /></ScrollView></Screen>;
}
