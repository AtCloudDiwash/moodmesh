import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MapProps } from './mapTypes';
import { Icon } from './ui';
import { colors, moodStyle } from '../theme';

export function MapPreview({ posts, selectedId, onSelect, picked }: MapProps) {
  const points = posts.filter(post => post.location);
  const latitudes = points.map(post => post.location!.latitude), longitudes = points.map(post => post.location!.longitude);
  const minLat = Math.min(...latitudes), maxLat = Math.max(...latitudes), minLng = Math.min(...longitudes), maxLng = Math.max(...longitudes);
  return <View style={styles.map} accessibilityLabel="Approximate location preview">
    <View style={styles.park} /><View style={styles.water} />
    {Array.from({ length: 9 }, (_, i) => <View key={'v' + i} style={[styles.road, { left: i * 58 - 30, height: '150%', width: 11, top: -30, transform: [{ rotate: '24deg' }] }]} />)}
    {Array.from({ length: 8 }, (_, i) => <View key={'h' + i} style={[styles.road, { top: i * 62 + 5, height: 10, width: '150%', left: -30, transform: [{ rotate: '-15deg' }] }]} />)}
    <Text style={styles.label}>A LITTLE EXPLORING{'
'}GOES A LONG WAY.</Text>
    {points.map(post => {
      const mood = moodStyle(post.moods[0] ?? 'Chill');
      const left = 14 + ((post.location!.longitude - minLng) / (maxLng - minLng || 1)) * 64;
      const top = 17 + (1 - (post.location!.latitude - minLat) / (maxLat - minLat || 1)) * 47;
      return <Pressable key={post.id} accessibilityRole="button" accessibilityLabel={post.title} accessibilityState={{ selected: selectedId === post.id }} onPress={() => onSelect?.(post.id)} style={[styles.pin, { left: left + '%' as `${number}%`, top: top + '%' as `${number}%`, backgroundColor: mood.background, borderColor: selectedId === post.id ? colors.blue : colors.white }]}><Icon name={mood.icon} color={mood.color} size={23} /></Pressable>;
    })}
    {picked && <View style={styles.picked}><Icon name="location" color={colors.blue} size={36} /></View>}
    <View style={styles.caption}><Icon name="map-outline" size={13} color={colors.muted} /><Text style={styles.captionText}>Location preview · open directions for a full map</Text></View>
  </View>;
}
const styles = StyleSheet.create({
  map: { flex: 1, backgroundColor: '#EBE8DE', overflow: 'hidden', minHeight: 210 },
  road: { position: 'absolute', backgroundColor: '#FFFDF5', borderWidth: 1, borderColor: '#E2DED0' },
  park: { position: 'absolute', top: '26%', left: '-12%', width: 150, height: 180, borderRadius: 50, backgroundColor: '#CEE2C2', transform: [{ rotate: '24deg' }] },
  water: { position: 'absolute', right: -85, top: -110, width: 210, height: '140%', backgroundColor: '#C6E0EA', transform: [{ rotate: '21deg' }] },
  pin: { position: 'absolute', width: 47, height: 47, borderRadius: 24, borderBottomLeftRadius: 8, borderWidth: 3, alignItems: 'center', justifyContent: 'center', shadowColor: '#234', shadowOpacity: 0.15, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  label: { position: 'absolute', top: 16, left: 20, color: '#727C76', fontSize: 10, fontWeight: '600', lineHeight: 16, letterSpacing: 2 },
  caption: { position: 'absolute', bottom: 9, alignSelf: 'center', backgroundColor: '#FFFFFFE8', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 5 },
  captionText: { fontSize: 9, color: colors.muted }, picked: { position: 'absolute', top: '42%', left: '46%' },
});
