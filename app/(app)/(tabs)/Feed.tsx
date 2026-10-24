import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '@/src/context/DataContext';
import { PostCard } from '@/src/components/PostCard';
import { Button, DemoBanner, ErrorNotice, Header, IconButton, Message, Screen, Segments } from '@/src/components/ui';
import { colors } from '@/src/theme';

export default function Feed() {
  const data = useData(), router = useRouter();
  const [tab, setTab] = useState('Discover');
  const posts = useMemo(() => tab === 'Top rated' ? [...data.posts].sort((a, b) => b.rating - a.rating) : data.posts, [data.posts, tab]);
  return <Screen><DemoBanner /><Header subtitle="Real places. Real moods." action={<IconButton icon="map-outline" label="Explore the map" onPress={() => router.navigate('/(app)/(tabs)/Explore')} />} />
    <FlatList data={posts} keyExtractor={post => post.id} renderItem={({ item }) => <PostCard post={item} />}
      ListHeaderComponent={<><Segments options={['Discover', 'Top rated']} selected={tab} onSelect={setTab} /><View style={styles.section}><Text style={styles.eyebrow}>YOUR NEXT LITTLE ESCAPE</Text><Text style={styles.note}>{tab === 'Top rated' ? 'Highest rated among loaded places' : 'Fresh finds from the community'}</Text></View><ErrorNotice message={data.error} retry={() => void data.refresh()} /><ErrorNotice message={data.libraryError} retry={() => void data.reload()} /></>}
      refreshControl={<RefreshControl refreshing={data.refreshing} onRefresh={() => { void data.refresh(); void data.reload(); }} tintColor={colors.blue} />}
      onEndReached={() => { if (data.hasMore && !data.error) void data.loadMore(); }} onEndReachedThreshold={0.4}
      ListEmptyComponent={<Message title={data.loading ? 'Gathering good places…' : 'Be the first to share a feeling'} detail={data.loading ? undefined : 'Add a place, a photo, and a mood. Your next favorite starts here.'} loading={data.loading} action={data.loading ? undefined : 'Share a place'} onAction={() => router.navigate('/(app)/(tabs)/Add')} />}
      ListFooterComponent={data.hasMore ? <View style={styles.footer}><Button title="Load more places" busy={data.loading} secondary onPress={() => void data.loadMore()} /></View> : posts.length > 0 ? <Text style={styles.end}>You’re all caught up. Go make a new memory.</Text> : null}
      contentContainerStyle={{ paddingBottom: 20 }} />
  </Screen>;
}
const styles = StyleSheet.create({
  section: { paddingHorizontal: 22, paddingBottom: 20, gap: 5 }, eyebrow: { fontSize: 10, letterSpacing: 1.8, fontWeight: '700', color: colors.muted },
  note: { fontSize: 12, color: colors.muted }, footer: { padding: 22 }, end: { fontSize: 11, color: colors.muted, textAlign: 'center', padding: 20 },
});
