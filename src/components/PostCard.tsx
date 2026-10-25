import React, { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '../context/DataContext';
import { Post } from '../types';
import { colors } from '../theme';
import { Avatar, ErrorNotice, Icon, IconButton, MoodChip, Photo } from './ui';
import { openDirections } from '../lib/directions';

function age(date: string) {
  const hours = Math.max(0, Math.floor((Date.now() - Date.parse(date)) / 3600000));
  if (!Number.isFinite(hours)) return 'Recently';
  return hours < 1 ? 'Just now' : hours < 24 ? hours + 'h ago' : Math.floor(hours / 24) + 'd ago';
}
export function PostCard({ post, detail = false }: { post: Post; detail?: boolean }) {
  const data = useData(),
    router = useRouter();
  const [error, setError] = useState<string | null>(null),
    [width, setWidth] = useState(320),
    [page, setPage] = useState(0);
  const action = async (kind: 'like' | 'save') => {
    setError(null);
    try {
      await data.toggle(kind, post.id);
    } catch {
      setError('Could not save that change. Please try again.');
    }
  };
  const share = async () => {
    try {
      await Share.share({
        message:
          post.title +
          ' — ' +
          post.placeName +
          '\n' +
          post.moods.join(' · ') +
          (post.location
            ? '\nhttps://www.google.com/maps/search/?api=1&query=' +
              encodeURIComponent(post.location.latitude + ',' + post.location.longitude)
            : ''),
      });
    } catch {
      setError('Sharing is unavailable right now. Please try again.');
    }
  };
  return (
    <View style={styles.card}>
      <View style={styles.authorRow}>
        <Avatar name={post.author} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.author}>{post.author}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {post.placeName} · {age(post.createdAt)}
          </Text>
        </View>
        <IconButton icon="share-outline" label="Share place" onPress={() => void share()} />
      </View>
      <View style={styles.photos} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) =>
            setPage(Math.round(event.nativeEvent.contentOffset.x / width))
          }
        >
          {(post.images.length ? post.images : ['']).map((uri, index) => (
            <Photo
              key={uri + index}
              uri={uri}
              label={post.title + ', photo ' + (index + 1)}
              style={{ width, height: width * 0.86 }}
            />
          ))}
        </ScrollView>
        <View style={styles.photoBadge}>
          <Icon name="location-outline" color={colors.white} size={12} />
          <Text style={styles.photoBadgeText}>Worth finding</Text>
        </View>
        {post.images.length > 1 && (
          <View style={styles.imageCount}>
            <Text style={styles.photoBadgeText}>
              {page + 1} / {post.images.length}
            </Text>
          </View>
        )}
      </View>
      <Pressable
        disabled={detail}
        accessibilityRole={detail ? undefined : 'button'}
        accessibilityLabel={'Read about ' + post.title}
        onPress={() => router.push({ pathname: '/(app)/post/[id]', params: { id: post.id } })}
        style={styles.body}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>{post.title}</Text>
          <View style={styles.rating}>
            <Icon name="star" color={colors.yellow} size={15} />
            <Text style={styles.ratingText}>{post.rating.toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.tags}>
          {post.moods.map((mood) => (
            <MoodChip key={mood} name={mood} />
          ))}
        </View>
        <Text style={styles.description} numberOfLines={detail ? undefined : 3}>
          {post.description || 'A little discovery worth sharing.'}
        </Text>
      </Pressable>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={data.has('like', post.id) ? 'Unlike place' : 'Like place'}
          accessibilityState={{
            selected: data.has('like', post.id),
            disabled:
              data.libraryLoading || !!data.libraryError || data.pending.has('like:' + post.id),
          }}
          disabled={
            data.libraryLoading || !!data.libraryError || data.pending.has('like:' + post.id)
          }
          onPress={() => void action('like')}
          style={styles.action}
        >
          <Icon
            name={data.has('like', post.id) ? 'heart' : 'heart-outline'}
            color={data.has('like', post.id) ? colors.red : colors.ink}
            size={23}
          />
          <Text style={styles.actionText}>{post.likes}</Text>
        </Pressable>
        {post.location && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open directions"
            onPress={() =>
              void openDirections(post.location).catch(() => setError('Could not open directions.'))
            }
            style={styles.action}
          >
            <Icon name="navigate-outline" size={21} />
            <Text style={styles.actionText}>Go there</Text>
          </Pressable>
        )}
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: data.has('save', post.id) }}
          disabled={
            data.libraryLoading || !!data.libraryError || data.pending.has('save:' + post.id)
          }
          onPress={() => void action('save')}
          style={styles.action}
        >
          <Icon
            name={data.has('save', post.id) ? 'bookmark' : 'bookmark-outline'}
            color={data.has('save', post.id) ? colors.blue : colors.ink}
            size={21}
          />
          <Text style={[styles.actionText, data.has('save', post.id) && { color: colors.blue }]}>
            {data.has('save', post.id) ? 'Saved' : 'Save'}
          </Text>
        </Pressable>
      </View>
      <ErrorNotice message={error} />
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 23,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  authorRow: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingBottom: 13 },
  author: { fontWeight: '700', fontSize: 12, color: colors.ink },
  meta: { fontSize: 10, color: colors.muted },
  photos: { borderRadius: 19, overflow: 'hidden', backgroundColor: colors.field },
  photoBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#182C3280',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  photoBadgeText: { color: colors.white, fontSize: 10, fontWeight: '600' },
  imageCount: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#182C3280',
  },
  body: { gap: 10, paddingTop: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 19, fontWeight: '700', color: colors.ink, letterSpacing: -0.5, flex: 1 },
  rating: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  ratingText: { fontSize: 12, fontWeight: '600', color: colors.ink },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  description: { fontSize: 12, lineHeight: 20, color: colors.ink },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 7 },
  action: { minHeight: 44, flexDirection: 'row', gap: 6, alignItems: 'center' },
  actionText: { fontSize: 11, color: colors.ink },
});
