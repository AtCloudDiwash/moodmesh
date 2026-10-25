import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useData } from '@/src/context/DataContext';
import { useLocation } from '@/src/hooks/useLocation';
import PlaceMap from '@/src/components/PlaceMap';
import {
  DemoBanner,
  ErrorNotice,
  Header,
  Icon,
  IconButton,
  Message,
  MoodChip,
  MoodPicker,
  Photo,
  Screen,
} from '@/src/components/ui';
import { colors } from '@/src/theme';
import { openDirections } from '@/src/lib/directions';

export default function Explore() {
  const data = useData(),
    location = useLocation();
  const [search, setSearch] = useState(''),
    [mood, setMood] = useState('All'),
    [selectedId, setSelectedId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const places = useMemo(
    () =>
      data.posts.filter(
        (post) =>
          post.location &&
          (mood === 'All' || post.moods.some((tag) => tag.toLowerCase() === mood.toLowerCase())) &&
          (post.title + ' ' + post.placeName + ' ' + post.moods.join(' '))
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
      ),
    [data.posts, mood, search],
  );
  const selected = places.find((post) => post.id === selectedId) ?? places[0];
  const toggleSave = async () => {
    if (!selected) return;
    setError(null);
    try {
      await data.toggle('save', selected.id);
    } catch {
      setError('Could not save this place. Please retry.');
    }
  };
  return (
    <Screen>
      <DemoBanner />
      <Header
        subtitle="Discover places by how you feel."
        action={
          <IconButton
            icon="refresh-outline"
            label="Refresh places"
            disabled={data.loading}
            onPress={() => void data.refresh()}
          />
        }
      />
      <View style={styles.search}>
        <Icon name="search-outline" size={18} color={colors.muted} />
        <TextInput
          accessibilityLabel="Search places"
          placeholder="Cafés, parks, little escapes…"
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          maxLength={120}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <IconButton icon="close" label="Clear search" onPress={() => setSearch('')} />
        )}
      </View>
      <MoodPicker selected={[mood]} onSelect={setMood} includeAll />
      <ErrorNotice
        message={data.error ?? error ?? location.error ?? data.libraryError}
        retry={() => {
          void data.refresh();
          void data.reload();
          setError(null);
        }}
      />
      <View style={styles.map}>
        <PlaceMap
          posts={places}
          selectedId={selected?.id}
          onSelect={setSelectedId}
          center={location.location}
        />
        <View style={styles.mapTools}>
          <IconButton
            icon="locate-outline"
            label="Find my location"
            disabled={location.busy}
            onPress={() => void location.locate()}
          />
        </View>
        <View style={styles.counter}>
          <View style={styles.liveDot} />
          <Text style={styles.countText}>{places.length} places to feel something</Text>
        </View>
        {data.loading && !data.posts.length && (
          <View style={styles.empty}>
            <Message title="Finding your next favorite…" loading />
          </View>
        )}
        {!data.loading && places.length === 0 && (
          <View style={styles.empty}>
            <Message
              title="A little quiet here"
              detail="Try another mood or search. Your next discovery might be the first one."
              action="Clear filters"
              onAction={() => {
                setSearch('');
                setMood('All');
              }}
            />
          </View>
        )}
      </View>
      {selected && (
        <View style={styles.preview}>
          <View style={styles.previewTop}>
            <Photo uri={selected.images[0]} label={selected.title} style={styles.thumbnail} />
            <View style={styles.previewInfo}>
              <Text numberOfLines={1} style={styles.placeTitle}>
                {selected.title}
              </Text>
              <Text style={styles.placeLocation} numberOfLines={1}>
                {selected.placeName}
              </Text>
              <View style={styles.rating}>
                <Icon name="star" color={colors.yellow} size={13} />
                <Text style={styles.ratingText}>{selected.rating.toFixed(1)}</Text>
                <Text style={styles.author}>by {selected.author}</Text>
              </View>
            </View>
            <IconButton
              icon={data.has('save', selected.id) ? 'bookmark' : 'bookmark-outline'}
              label={data.has('save', selected.id) ? 'Unsave place' : 'Save place'}
              active={data.has('save', selected.id)}
              disabled={
                data.libraryLoading ||
                !!data.libraryError ||
                data.pending.has('save:' + selected.id)
              }
              onPress={() => void toggleSave()}
            />
          </View>
          <View style={styles.previewBottom}>
            <View style={styles.chips}>
              {selected.moods.slice(0, 3).map((name) => (
                <MoodChip key={name} name={name} />
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                void openDirections(selected.location).catch(() =>
                  setError('Could not open directions. Please try again.'),
                )
              }
              style={styles.directions}
            >
              <Icon name="navigate" size={14} color={colors.blue} />
              <Text style={styles.directionText}>Go</Text>
            </Pressable>
          </View>
          {places.length > 1 && (
            <View style={styles.nextRow}>
              <Text style={styles.nextText}>A place for every mood</Text>
              <Pressable
                accessibilityRole="button"
                style={{ padding: 8 }}
                onPress={() =>
                  setSelectedId(
                    places[
                      (places.findIndex((post) => post.id === selected.id) + 1) % places.length
                    ].id,
                  )
                }
              >
                <Text style={styles.directionText}>Next place →</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
      {data.hasMore && (
        <Pressable
          onPress={() => void data.loadMore()}
          accessibilityRole="button"
          disabled={data.loading}
          style={styles.more}
        >
          <Text style={styles.directionText}>
            {data.loading ? 'Loading…' : 'Discover more places'}
          </Text>
        </Pressable>
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  search: {
    marginHorizontal: 20,
    backgroundColor: colors.field,
    borderRadius: 26,
    paddingHorizontal: 15,
    minHeight: 46,
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
  },
  searchInput: { flex: 1, fontSize: 12, color: colors.ink, paddingVertical: 12 },
  map: { flex: 1, minHeight: 210, overflow: 'hidden' },
  mapTools: {
    position: 'absolute',
    right: 16,
    top: 18,
    backgroundColor: colors.white,
    borderRadius: 25,
    elevation: 2,
  },
  counter: {
    position: 'absolute',
    top: 20,
    left: 16,
    backgroundColor: '#FFFFFFED',
    borderRadius: 20,
    padding: 9,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  liveDot: { width: 6, height: 6, backgroundColor: colors.green, borderRadius: 4 },
  countText: { fontSize: 10, color: colors.ink },
  empty: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    backgroundColor: '#FAF9F6ED',
  },
  preview: {
    marginHorizontal: 14,
    marginTop: -3,
    marginBottom: 10,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  previewTop: { flexDirection: 'row', gap: 11, alignItems: 'center' },
  thumbnail: { width: 72, height: 77, borderRadius: 13 },
  previewInfo: { flex: 1, gap: 6 },
  placeTitle: { fontWeight: '700', fontSize: 15, color: colors.ink },
  placeLocation: { fontSize: 10, color: colors.muted },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 11, fontWeight: '600', color: colors.ink },
  author: { fontSize: 9, color: colors.muted, flex: 1 },
  previewBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, flex: 1 },
  directions: {
    backgroundColor: '#EAF0FF',
    borderRadius: 20,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  directionText: { color: colors.blue, fontSize: 11, fontWeight: '700' },
  nextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: 10,
    paddingTop: 5,
  },
  nextText: { color: colors.muted, fontSize: 10 },
  more: { alignItems: 'center', padding: 10 },
});
