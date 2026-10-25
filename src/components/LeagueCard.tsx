import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { League } from '../types';
import { useData } from '../context/DataContext';
import { leagueStatus } from '../lib/api';
import { colors, moodStyle } from '../theme';
import { Button, ErrorNotice, Icon, Photo } from './ui';

export function LeagueCard({
  league,
  progress,
  featured = false,
  now,
}: {
  league: League;
  progress?: number;
  featured?: boolean;
  now: number;
}) {
  const data = useData(),
    router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const joined = data.has('join', league.id),
    status = leagueStatus(league, now),
    mood = moodStyle(league.mood);
  const open = () =>
    router.push({
      pathname: '/(app)/screens/LeagueDetailScreen',
      params: { league_id: league.id },
    });
  const join = async () => {
    setError(null);
    if (joined) {
      router.navigate({ pathname: '/(app)/(tabs)/Add', params: { league: league.id } });
      return;
    }
    try {
      await data.toggle('join', league.id);
    } catch {
      setError('Could not join this challenge. Please retry.');
    }
  };
  if (!featured)
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={'View ' + league.title}
        onPress={open}
        style={styles.row}
      >
        <View style={[styles.symbol, { backgroundColor: mood.background }]}>
          <Icon name={mood.icon} color={mood.color} size={25} />
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={styles.rowTitle}>{league.title}</Text>
          <Text style={styles.rowDescription} numberOfLines={1}>
            {league.description}
          </Text>
          <Text style={styles.rowStatus}>
            {joined ? 'Joined · ' : ''}
            {status} · {league.goal} places
          </Text>
        </View>
        <Icon name="chevron-forward" size={17} color={colors.muted} />
      </Pressable>
    );
  return (
    <View style={styles.card}>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={'Read about ' + league.title}
      >
        <Photo uri={league.image} label={league.title} style={styles.heroPhoto} />
        <View style={styles.shade} />
        <View style={styles.heroText}>
          <View style={styles.timePill}>
            <Text style={styles.timeText}>
              {status === 'Active'
                ? Math.max(1, Math.ceil((Date.parse(league.endsAt) - now) / 86400000)) +
                  ' days left'
                : status}
            </Text>
          </View>
          <Text style={styles.eyebrow}>A LITTLE CHALLENGE. A BIG DISCOVERY.</Text>
          <Text style={styles.heroTitle}>{league.title}</Text>
          <Text style={styles.heroSubtitle}>Find {league.goal} places. Make a few memories.</Text>
        </View>
      </Pressable>
      <View style={styles.cardBody}>
        {joined && (
          <>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>
                {progress === undefined
                  ? 'Loading progress…'
                  : Math.min(progress, league.goal) + ' / ' + league.goal + ' places'}
              </Text>
              <Text style={styles.progressNote}>
                {progress !== undefined && progress >= league.goal
                  ? 'Challenge complete'
                  : 'Your discoveries'}
              </Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: (Math.min(100, ((progress ?? 0) / league.goal) * 100) +
                      '%') as `${number}%`,
                  },
                ]}
              />
            </View>
          </>
        )}
        {status === 'Active' ? (
          <Button
            title={joined ? 'Share a discovery' : 'Join challenge'}
            icon={joined ? 'add' : 'trophy-outline'}
            busy={data.pending.has('join:' + league.id)}
            disabled={data.libraryLoading || !!data.libraryError}
            onPress={() => void join()}
          />
        ) : (
          <Button title="See challenge details" secondary onPress={open} />
        )}
        <ErrorNotice message={error} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: colors.white,
    borderRadius: 23,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  heroPhoto: { width: '100%', height: 240 },
  shade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#30201F65',
  },
  heroText: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    padding: 22,
    justifyContent: 'flex-end',
    gap: 8,
  },
  timePill: {
    position: 'absolute',
    right: 16,
    top: 16,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 20,
    backgroundColor: '#FFFFFFE8',
  },
  timeText: { color: '#75432C', fontSize: 10, fontWeight: '600' },
  eyebrow: { color: '#FFE8D5', fontSize: 8, fontWeight: '700', letterSpacing: 1.2 },
  heroTitle: {
    color: colors.white,
    fontSize: 29,
    fontWeight: '700',
    letterSpacing: -0.8,
    maxWidth: '85%',
  },
  heroSubtitle: { color: colors.white, fontSize: 11 },
  cardBody: { padding: 15, gap: 12 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { fontSize: 11, fontWeight: '600', color: colors.ink },
  progressNote: { fontSize: 10, color: colors.muted },
  track: {
    height: 7,
    borderRadius: 5,
    backgroundColor: colors.field,
    overflow: 'hidden',
    marginBottom: 3,
  },
  fill: { height: '100%', borderRadius: 5, backgroundColor: colors.blue },
  row: {
    flexDirection: 'row',
    gap: 13,
    alignItems: 'center',
    marginHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  symbol: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 14, fontWeight: '700', color: colors.ink },
  rowDescription: { fontSize: 11, color: colors.muted },
  rowStatus: { fontSize: 10, color: colors.blue },
});
