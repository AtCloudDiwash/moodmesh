import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '@/src/context/DataContext';
import { useLocation } from '@/src/hooks/useLocation';
import { demoMode } from '@/src/config';
import { photos } from '@/src/data/demo';
import { PostDraft, Coordinates } from '@/src/types';
import { MAX_PHOTOS, validatePost } from '@/src/lib/validation';
import { preparePhoto } from '@/src/lib/photos';
import { leagueStatus } from '@/src/lib/api';
import { ID } from '@/src/lib/backend';
import PlaceMap from '@/src/components/PlaceMap';
import {
  Button,
  DemoBanner,
  ErrorNotice,
  Field,
  Header,
  Icon,
  IconButton,
  MoodPicker,
  Photo,
  Screen,
} from '@/src/components/ui';
import { colors } from '@/src/theme';

const emptyDraft = (): PostDraft => ({
  title: '',
  description: '',
  placeName: '',
  moods: [],
  rating: 0,
  images: [],
  location: null,
});
export default function Add() {
  const data = useData(),
    location = useLocation(),
    router = useRouter();
  const params = useLocalSearchParams<{ league?: string }>();
  const [draft, setDraft] = useState<PostDraft>(emptyDraft),
    [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false),
    [picking, setPicking] = useState(false),
    [success, setSuccess] = useState<string | null>(null),
    [discard, setDiscard] = useState(false);
  const [latitude, setLatitude] = useState(''),
    [longitude, setLongitude] = useState('');
  const submitting = useRef(false),
    pickingRef = useRef(false),
    requestId = useRef(ID.unique());
  const [retryPending, setRetryPending] = useState(false);
  const editingLocked = busy || retryPending;
  useEffect(() => {
    if (params.league) setDraft((previous) => ({ ...previous, leagueId: params.league }));
  }, [params.league]);
  const update = <K extends keyof PostDraft>(key: K, value: PostDraft[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setError(null);
  };
  const chooseLocation = (point: Coordinates) => {
    update('location', point);
    setLatitude(point.latitude.toFixed(6));
    setLongitude(point.longitude.toFixed(6));
  };
  const manualLocation = (lat: string, lng: string) => {
    setLatitude(lat);
    setLongitude(lng);
    update(
      'location',
      lat.trim() && lng.trim() ? { latitude: Number(lat), longitude: Number(lng) } : null,
    );
  };
  const reset = () => {
    requestId.current = ID.unique();
    setRetryPending(false);
    setDraft(emptyDraft());
    setLatitude('');
    setLongitude('');
    setError(null);
    setDiscard(false);
    router.setParams({ league: undefined });
  };
  const choosePhotos = async (camera: boolean) => {
    if (pickingRef.current || submitting.current || draft.images.length >= MAX_PHOTOS) return;
    pickingRef.current = true;
    setPicking(true);
    setError(null);
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError('Camera access is off. You can choose a photo from your library instead.');
          return;
        }
      }
      const result = camera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9, exif: false })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: MAX_PHOTOS - draft.images.length,
            quality: 0.9,
            exif: false,
          });
      if (result.canceled) return;
      const images = await Promise.all(
        result.assets.slice(0, MAX_PHOTOS - draft.images.length).map(preparePhoto),
      );
      setDraft((previous) => ({
        ...previous,
        images: [...previous.images, ...images].slice(0, MAX_PHOTOS),
      }));
    } catch {
      setError('Could not prepare the photo. Choose a smaller image and try again.');
    } finally {
      pickingRef.current = false;
      setPicking(false);
    }
  };
  const publish = async () => {
    if (submitting.current || pickingRef.current) return;
    const message = validatePost(draft);
    if (message) {
      setError(message);
      return;
    }
    if (draft.leagueId) {
      const league = data.leagues.find((item) => item.id === draft.leagueId);
      if (!league || leagueStatus(league) !== 'Active' || !data.has('join', league.id)) {
        setError('Join an active challenge first, or remove the challenge from this post.');
        return;
      }
    }
    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      const post = await data.publish(draft, requestId.current);
      reset();
      setSuccess(post.id);
    } catch {
      setRetryPending(true);
      setError(
        'Your post could not be confirmed. Check your connection and retry this same post. Your photos are kept for the retry.',
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  const selectedLeague = data.leagues.find((item) => item.id === draft.leagueId);
  if (success)
    return (
      <Screen>
        <Header title="A new little discovery" />
        <View style={styles.success}>
          <View style={styles.successIcon}>
            <Icon name="checkmark" size={40} color={colors.blue} />
          </View>
          <Text style={styles.successTitle}>
            {demoMode ? 'Your preview is ready.' : 'Your place is on the map.'}
          </Text>
          <Text style={styles.successText}>
            {demoMode
              ? 'This sample post is available until the app reloads.'
              : 'Thanks for sharing a place that means something to you.'}
          </Text>
          <Button
            title="See your post"
            onPress={() => {
              const id = success;
              setSuccess(null);
              router.push({ pathname: '/(app)/post/[id]', params: { id } });
            }}
          />
          <Button title="Share another place" secondary onPress={() => setSuccess(null)} />
        </View>
      </Screen>
    );
  return (
    <Screen>
      <DemoBanner />
      <Header
        title="Add a place"
        subtitle="A photo. A feeling. A little discovery."
        action={
          <IconButton
            icon="close"
            label="Clear draft"
            disabled={editingLocked || picking}
            onPress={() => setDiscard(true)}
          />
        }
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Start with a moment</Text>
            <Text style={styles.hint}>{draft.images.length} / 3 photos</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoRow}
          >
            {draft.images.map((photo, index) => (
              <View key={photo.uri + index}>
                <Photo
                  uri={photo.uri}
                  label={'Selected photo ' + (index + 1)}
                  style={styles.photo}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={'Remove photo ' + (index + 1)}
                  disabled={editingLocked || picking}
                  onPress={() =>
                    update(
                      'images',
                      draft.images.filter((_, i) => i !== index),
                    )
                  }
                  style={styles.remove}
                >
                  <Icon name="close" size={15} color={colors.white} />
                </Pressable>
              </View>
            ))}
            {draft.images.length < 3 && (
              <Pressable
                accessibilityRole="button"
                disabled={editingLocked || picking}
                accessibilityLabel="Add photo from library"
                onPress={() => void choosePhotos(false)}
                style={styles.addPhoto}
              >
                <Icon name="add" size={27} color={colors.muted} />
                <Text style={styles.hint}>{picking ? 'Preparing…' : 'Add photo'}</Text>
              </Pressable>
            )}
          </ScrollView>
          <View style={styles.photoActions}>
            <Pressable
              accessibilityRole="button"
              disabled={editingLocked || picking || draft.images.length >= 3}
              onPress={() => void choosePhotos(true)}
              style={styles.textAction}
            >
              <Icon name="camera-outline" size={17} color={colors.blue} />
              <Text style={styles.link}>Take a photo</Text>
            </Pressable>
            {demoMode && (
              <Pressable
                accessibilityRole="button"
                disabled={editingLocked || picking || draft.images.length >= 3}
                onPress={() =>
                  update('images', [
                    ...draft.images,
                    { uri: photos.cafe, name: 'sample.jpg', type: 'image/jpeg', size: 200000 },
                  ])
                }
                style={styles.textAction}
              >
                <Text style={styles.link}>Use sample photo</Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.label}>How did this place make you feel?</Text>
          <Text style={styles.hint}>Choose up to three moods.</Text>
          <View style={styles.moods} pointerEvents={editingLocked ? 'none' : 'auto'}>
            <MoodPicker
              selected={draft.moods}
              onSelect={(name) => {
                if (draft.moods.includes(name))
                  update(
                    'moods',
                    draft.moods.filter((mood) => mood !== name),
                  );
                else if (draft.moods.length < 3) update('moods', [...draft.moods, name]);
                else setError('Choose up to three moods.');
              }}
            />
          </View>
          <Text style={styles.label}>Rate your experience</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={value + ' stars'}
                accessibilityState={{ selected: draft.rating === value }}
                disabled={editingLocked}
                onPress={() => update('rating', value)}
                style={styles.star}
              >
                <Icon
                  name={draft.rating >= value ? 'star' : 'star-outline'}
                  color={draft.rating >= value ? colors.blue : '#B8BCC4'}
                  size={31}
                />
              </Pressable>
            ))}
          </View>
          <Field
            label="Place name"
            placeholder="The Daily Bloom"
            value={draft.title}
            onChangeText={(value) => update('title', value)}
            maxLength={80}
            editable={!editingLocked}
          />
          <Field
            label="Neighborhood or address"
            placeholder="Mission District, San Francisco"
            value={draft.placeName}
            onChangeText={(value) => update('placeName', value)}
            maxLength={120}
            editable={!editingLocked}
          />
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Pin your place</Text>
            <Pressable
              accessibilityRole="button"
              disabled={editingLocked || location.busy}
              onPress={async () => {
                const point = await location.locate();
                if (point) chooseLocation(point);
              }}
              style={styles.textAction}
            >
              <Icon name="locate" color={colors.blue} size={15} />
              <Text style={styles.link}>{location.busy ? 'Finding…' : 'Use my location'}</Text>
            </Pressable>
          </View>
          <View style={styles.map} pointerEvents={editingLocked ? 'none' : 'auto'}>
            <PlaceMap
              posts={[]}
              picked={
                draft.location &&
                Number.isFinite(draft.location.latitude) &&
                Number.isFinite(draft.location.longitude) &&
                Math.abs(draft.location.latitude) <= 90 &&
                Math.abs(draft.location.longitude) <= 180
                  ? draft.location
                  : null
              }
              center={location.location}
              onPick={chooseLocation}
            />
          </View>
          <Text style={styles.hint}>
            Tap the native map, use your location, or enter coordinates. This location will be
            public.
          </Text>
          <View style={styles.coordinates}>
            <View style={{ flex: 1 }}>
              <Field
                label="Latitude"
                value={latitude}
                onChangeText={(value) => manualLocation(value, longitude)}
                placeholder="37.7598"
                keyboardType="numbers-and-punctuation"
                maxLength={16}
                editable={!editingLocked}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Longitude"
                value={longitude}
                onChangeText={(value) => manualLocation(latitude, value)}
                placeholder="-122.4210"
                keyboardType="numbers-and-punctuation"
                maxLength={16}
                editable={!editingLocked}
              />
            </View>
          </View>
          {demoMode && (
            <Button
              title="Use sample location"
              secondary
              disabled={editingLocked}
              onPress={() => {
                chooseLocation({ latitude: 37.7598, longitude: -122.421 });
                if (!draft.placeName) update('placeName', 'Mission District, San Francisco');
              }}
            />
          )}
          <ErrorNotice message={location.error} />
          <Field
            label="Add a note (optional)"
            placeholder="What made this place special?"
            multiline
            value={draft.description}
            onChangeText={(value) => update('description', value)}
            maxLength={500}
            editable={!editingLocked}
          />
          <Text style={styles.characterCount}>{draft.description.length} / 500</Text>
          {draft.leagueId && (
            <View style={styles.challenge}>
              <Icon name="trophy-outline" color={colors.blue} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{selectedLeague?.title ?? 'Challenge unavailable'}</Text>
                <Text style={styles.hint}>Sharing as a challenge entry</Text>
              </View>
              <IconButton
                icon="close"
                label="Remove challenge"
                disabled={editingLocked}
                onPress={() => {
                  update('leagueId', undefined);
                  router.setParams({ league: undefined });
                }}
              />
            </View>
          )}
          <ErrorNotice message={error} />
          <Button
            title={
              retryPending ? 'Retry this post' : demoMode ? 'Preview post' : 'Share this place'
            }
            icon="arrow-up"
            busy={busy}
            disabled={picking}
            onPress={() => void publish()}
          />
          <Text style={styles.footer}>
            {demoMode
              ? 'Preview posts stay in this session.'
              : 'Your photos, selected location, and display name will be visible to others.'}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={discard}
        transparent
        animationType="fade"
        onRequestClose={() => setDiscard(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.successTitle}>Clear this draft?</Text>
            <Text style={styles.successText}>
              The photos and details you added will be removed from this draft.
            </Text>
            <Button title="Keep editing" onPress={() => setDiscard(false)} />
            <Button title="Clear draft" secondary onPress={reset} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingBottom: 30, gap: 14 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  hint: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  photoRow: { gap: 9 },
  photo: { width: 104, height: 128, borderRadius: 15 },
  addPhoto: {
    width: 104,
    height: 128,
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C4C8D0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.field,
  },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 7,
    borderRadius: 20,
    backgroundColor: '#142039BB',
  },
  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -7,
  },
  textAction: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6 },
  link: { color: colors.blue, fontSize: 11, fontWeight: '600' },
  moods: { marginHorizontal: -22, marginTop: -12 },
  stars: { flexDirection: 'row', gap: 10, marginTop: -8 },
  star: { paddingVertical: 8, paddingRight: 6 },
  map: { height: 190, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.field },
  coordinates: { flexDirection: 'row', gap: 10 },
  characterCount: { textAlign: 'right', color: colors.muted, fontSize: 10, marginTop: -8 },
  challenge: {
    backgroundColor: '#EDF2FF',
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  footer: { textAlign: 'center', fontSize: 10, color: colors.muted, lineHeight: 16 },
  success: { flex: 1, justifyContent: 'center', padding: 35, gap: 18 },
  successIcon: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  successText: { fontSize: 13, lineHeight: 21, color: colors.muted, textAlign: 'center' },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#14203980',
    padding: 25,
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    gap: 18,
    backgroundColor: colors.white,
    borderRadius: 24,
  },
});
