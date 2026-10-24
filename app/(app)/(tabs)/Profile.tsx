import React, { useRef, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { useData } from '@/src/context/DataContext';
import { usePosts } from '@/src/hooks/usePosts';
import { useSavedPosts } from '@/src/hooks/useSavedPosts';
import { Query } from '@/src/lib/api';
import { demoMode } from '@/src/config';
import { Avatar, Button, DemoBanner, ErrorNotice, Field, Header, Icon, IconButton, Message, Photo, Screen, Segments } from '@/src/components/ui';
import { colors } from '@/src/theme';

export default function Profile() {
  const auth = useAuth(), data = useData(), router = useRouter();
  const own = usePosts(data.samples.filter(post => post.userId === auth.user?.id), [Query.equal('user_id', auth.user?.id ?? '')], data.revision);
  const saved = useSavedPosts();
  const [tab, setTab] = useState('Places'), [settingsOpen, setSettingsOpen] = useState(false), [name, setName] = useState(auth.user?.name ?? '');
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  if (!auth.user) return null;
  const posts = tab === 'Saved' ? saved.posts : own.posts;
  const busyPosts = tab === 'Saved' ? saved.loading : own.loading;
  const joined = data.activities.filter(item => item.kind === 'join').length;
  const badges = [{ name: 'First find', icon: 'sunny-outline' as const, threshold: 1, background: '#FFF0B8', color: '#A66A00' }, { name: 'Wanderer', icon: 'compass-outline' as const, threshold: 3, background: '#EFE3FC', color: '#8051BC' }, { name: 'Local guide', icon: 'map-outline' as const, threshold: 5, background: '#DDEFFF', color: '#216EAD' }, { name: 'Trailblazer', icon: 'sparkles-outline' as const, threshold: 10, background: '#FFE1E6', color: '#BD3B59' }];
  const rename = async () => {
    if (lock.current) return;
    if (name.trim().length < 2 || name.trim().length > 60) return setError('Use 2–60 characters for your display name.');
    lock.current = true; setBusy(true); setError(null);
    try { await auth.rename(name); setSettingsOpen(false); }
    catch { setError('Could not update your name. Please retry.'); }
    finally { lock.current = false; setBusy(false); }
  };
  const logout = async () => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(null);
    try { await auth.logout(); }
    catch { setError('Could not sign out. Check your connection and retry.'); }
    finally { lock.current = false; setBusy(false); }
  };
  return <Screen><DemoBanner /><Header action={<IconButton icon="settings-outline" label="Account settings" onPress={() => { setName(auth.user?.name ?? ''); setError(null); setSettingsOpen(true); }} />} />
    <ScrollView contentContainerStyle={{ paddingBottom: 25 }} refreshControl={<RefreshControl refreshing={own.refreshing} onRefresh={() => { void own.refresh(); saved.refresh(); void data.reload(); }} tintColor={colors.blue} />}>
      <View style={styles.identity}><View style={styles.avatarRing}><Avatar name={auth.user.name} large /></View><Text style={styles.name}>{auth.user.name}</Text><Text style={styles.profileLabel}>COLLECT MOMENTS. FIND YOUR PLACES.</Text><Text style={styles.bio}>Your places, moods, and little discoveries.{'
'}A map that feels a little more like you.</Text></View>
      <View style={styles.stats}>{[{ value: own.total, label: 'Places' }, { value: joined, label: 'Leagues' }, { value: data.activities.filter(item => item.kind === 'save').length, label: 'Saved' }, { value: own.total * 10, label: 'Mesh points' }].map(stat => <View key={stat.label} style={styles.stat}><Text style={styles.statValue}>{stat.value}</Text><Text style={styles.statLabel}>{stat.label}</Text></View>)}</View>
      <View style={styles.badgesSection}><View style={styles.badgeHeader}><Text style={styles.sectionTitle}>Little milestones</Text><Text style={styles.badgeHint}>Keep exploring</Text></View><View style={styles.badges}>{badges.map(badge => <View key={badge.name} style={styles.badge} accessibilityLabel={badge.name + (own.total >= badge.threshold ? ', earned' : ', unlock at ' + badge.threshold + ' posts')}><View style={[styles.badgeCircle, { backgroundColor: own.total >= badge.threshold ? badge.background : colors.field }]}><Icon name={own.total >= badge.threshold ? badge.icon : 'lock-closed-outline'} color={own.total >= badge.threshold ? badge.color : '#A4AAB2'} size={25} /></View><Text style={styles.badgeName}>{badge.name}</Text><Text style={styles.badgeThreshold}>{badge.threshold} {badge.threshold === 1 ? 'place' : 'places'}</Text></View>)}</View></View>
      <Segments options={['Places', 'Saved']} selected={tab} onSelect={setTab} /><ErrorNotice message={tab === 'Saved' ? saved.error : own.error} retry={() => tab === 'Saved' ? saved.refresh() : void own.refresh()} /><ErrorNotice message={data.libraryError} retry={() => void data.reload()} />
      {posts.length > 0 ? <View style={styles.grid}>{posts.map(post => <Pressable key={post.id} style={styles.gridCard} accessibilityRole="button" accessibilityLabel={'View ' + post.title} onPress={() => router.push({ pathname: '/(app)/post/[id]', params: { id: post.id } })}><Photo uri={post.images[0]} label={post.title} style={styles.gridPhoto} /><View style={styles.gridCaption}><Text style={styles.gridTitle} numberOfLines={1}>{post.title}</Text><View style={styles.gridRating}><Icon name="star" color={colors.yellow} size={10} /><Text style={styles.gridMeta}>{post.rating.toFixed(1)} · {post.moods[0] ?? 'A good place'}</Text></View></View></Pressable>)}</View> : <Message title={busyPosts ? 'Gathering your places…' : tab === 'Saved' ? 'Keep a little inspiration' : 'Your story starts somewhere'} detail={busyPosts ? undefined : tab === 'Saved' ? 'Tap the bookmark on a place to find it here later. Your saved list is private.' : 'Share your first place to start your collection.'} loading={busyPosts} action={busyPosts ? undefined : tab === 'Saved' ? 'Find a place' : 'Share a place'} onAction={() => router.navigate(tab === 'Saved' ? '/(app)/(tabs)/Explore' : '/(app)/(tabs)/Add')} />}
      {(tab === 'Saved' ? saved.hasMore : own.hasMore) && <View style={{ margin: 22 }}><Button title="More places" secondary busy={busyPosts} onPress={() => tab === 'Saved' ? saved.loadMore() : void own.loadMore()} /></View>}
      <Text style={styles.pointsNote}>10 Mesh points per shared place · a personal activity score</Text>
    </ScrollView>
    <Modal visible={settingsOpen} transparent animationType="slide" onRequestClose={() => { if (!busy) setSettingsOpen(false); }}><View style={styles.backdrop}><View style={styles.settings}><View style={styles.badgeHeader}><Text style={styles.sectionTitle}>Your account</Text><IconButton icon="close" label="Close account settings" disabled={busy} onPress={() => setSettingsOpen(false)} /></View><Field label="Display name" value={name} onChangeText={setName} maxLength={60} editable={!busy} /><Text style={styles.settingsNote}>Your display name appears on new posts. Shared places and their selected locations are public. Saved places are private.</Text><ErrorNotice message={error} /><Button title="Save display name" busy={busy} onPress={() => void rename()} />{!demoMode && <Button title="Sign out" secondary disabled={busy} onPress={() => void logout()} />}{demoMode && <Text style={styles.settingsNote}>You’re exploring a sample profile. Preview changes reset when the app reloads.</Text>}</View></View></Modal>
  </Screen>;
}
const styles = StyleSheet.create({
  identity: { alignItems: 'center', paddingHorizontal: 25, gap: 10 }, avatarRing: { padding: 5, borderWidth: 1, borderColor: '#D7E2FA', borderRadius: 50 },
  name: { fontSize: 22, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 }, profileLabel: { fontSize: 8, letterSpacing: 1.4, color: colors.blue, fontWeight: '600' }, bio: { fontSize: 12, lineHeight: 20, color: colors.muted, textAlign: 'center', marginTop: 3 },
  stats: { flexDirection: 'row', marginHorizontal: 23, paddingVertical: 23, marginTop: 5, borderBottomWidth: 1, borderBottomColor: colors.line }, stat: { flex: 1, alignItems: 'center', gap: 6 }, statValue: { fontSize: 20, fontWeight: '700', color: colors.ink }, statLabel: { fontSize: 10, color: colors.muted },
  badgesSection: { padding: 23, gap: 20 }, badgeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.ink }, badgeHint: { fontSize: 10, color: colors.muted },
  badges: { flexDirection: 'row', justifyContent: 'space-between', gap: 7 }, badge: { flex: 1, alignItems: 'center', gap: 6 }, badgeCircle: { width: 53, height: 53, borderRadius: 28, justifyContent: 'center', alignItems: 'center' }, badgeName: { fontSize: 10, color: colors.ink }, badgeThreshold: { fontSize: 9, color: colors.muted },
  grid: { paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, gridCard: { width: '48%', borderRadius: 15, backgroundColor: colors.white, overflow: 'hidden', borderWidth: 1, borderColor: colors.line }, gridPhoto: { width: '100%', aspectRatio: 1.1 }, gridCaption: { padding: 9, gap: 6 }, gridTitle: { fontSize: 11, fontWeight: '600', color: colors.ink }, gridRating: { flexDirection: 'row', alignItems: 'center', gap: 4 }, gridMeta: { fontSize: 9, color: colors.muted },
  pointsNote: { fontSize: 9, color: colors.muted, textAlign: 'center', marginTop: 23 },
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#14203980', padding: 22 }, settings: { backgroundColor: colors.paper, borderRadius: 25, padding: 23, gap: 17, width: '100%', maxWidth: 430 }, settingsNote: { fontSize: 12, lineHeight: 20, color: colors.muted },
});
