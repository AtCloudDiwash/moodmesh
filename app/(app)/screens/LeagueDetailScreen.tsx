import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '@/src/context/DataContext';
import { useLeagueProgress } from '@/src/hooks/useLeagueProgress';
import { useNow } from '@/src/hooks/useNow';
import { leagueStatus } from '@/src/lib/api';
import { LeagueCard } from '@/src/components/LeagueCard';
import { Button, ErrorNotice, Header, IconButton, Message, MoodChip, Screen } from '@/src/components/ui';
import { colors } from '@/src/theme';

export default function LeagueDetail() {
  const { league_id } = useLocalSearchParams<{ league_id: string }>(), router = useRouter(), data = useData(), progress = useLeagueProgress(), now = useNow();
  const league = data.leagues.find(item => item.id === league_id);
  const [error, setError] = useState<string | null>(null);
  return <Screen><Header title="A reason to explore" action={<IconButton icon="arrow-back" label="Back to leagues" onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/Leagues')} />} /><ScrollView><ErrorNotice message={data.libraryError ?? progress.error ?? error} retry={() => { void data.reload(); progress.retry(); setError(null); }} />
    {league ? <><LeagueCard league={league} featured now={now} progress={progress.counts[league.id]} /><View style={styles.content}><Text style={styles.title}>The little details</Text><Text style={styles.description}>{league.description}</Text><View style={{ alignSelf: 'flex-start' }}><MoodChip name={league.mood} /></View><Text style={styles.note}>Hosted by {league.author}</Text><Text style={styles.note}>{new Date(league.startsAt).toLocaleDateString()} – {new Date(league.endsAt).toLocaleDateString()}</Text><Text style={styles.title}>Make it count</Text><Text style={styles.description}>Join the challenge, then use “Share a discovery” to add an entry. Each published entry counts toward your goal of {league.goal} places. Share a distinct place and your own experience for each entry.</Text><Text style={styles.note}>Progress celebrates your discoveries. There are no cash or token rewards.</Text>{data.has('join', league.id) && leagueStatus(league, now) === 'Active' && <Button title="Leave challenge" secondary busy={data.pending.has('join:' + league.id)} onPress={() => void data.toggle('join', league.id).catch(() => setError('Could not leave this challenge. Please retry.'))} />}</View></> : <Message title={data.libraryLoading ? 'Opening the challenge…' : 'This challenge is unavailable'} loading={data.libraryLoading} detail={data.libraryLoading ? undefined : 'Return to Leagues to find another adventure.'} />}
  </ScrollView></Screen>;
}
const styles = StyleSheet.create({ content: { paddingHorizontal: 24, paddingBottom: 35, gap: 15 }, title: { color: colors.ink, fontSize: 19, fontWeight: '700' }, description: { color: colors.ink, fontSize: 13, lineHeight: 22 }, note: { color: colors.muted, fontSize: 11, lineHeight: 18 } });
