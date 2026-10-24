import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { useData } from '@/src/context/DataContext';
import { useLeagueProgress } from '@/src/hooks/useLeagueProgress';
import { useNow } from '@/src/hooks/useNow';
import { leagueStatus } from '@/src/lib/api';
import { LeagueCard } from '@/src/components/LeagueCard';
import { DemoBanner, ErrorNotice, Header, Message, Screen, Segments } from '@/src/components/ui';
import { colors } from '@/src/theme';

export default function Leagues() {
  const data = useData(), progress = useLeagueProgress(), now = useNow();
  const [tab, setTab] = useState<'Active' | 'Upcoming' | 'Past'>('Active');
  const leagues = data.leagues.filter(league => leagueStatus(league, now) === tab);
  return <Screen><DemoBanner /><Header subtitle="Join a challenge. Explore a little more." /><Segments options={['Active', 'Upcoming', 'Past'] as const} selected={tab} onSelect={setTab} />
    <ScrollView contentContainerStyle={{ paddingBottom: 25 }} refreshControl={<RefreshControl refreshing={data.libraryLoading} onRefresh={() => { void data.reload(); progress.retry(); }} tintColor={colors.blue} />}>
      <ErrorNotice message={data.libraryError} retry={() => void data.reload()} /><ErrorNotice message={progress.error} retry={progress.retry} />
      {leagues.length ? <><Text style={styles.eyebrow}>YOUR NEXT ADVENTURE STARTS HERE</Text><LeagueCard league={leagues[0]} featured now={now} progress={progress.counts[leagues[0].id]} />{leagues.length > 1 && <Text style={styles.sectionTitle}>More to explore</Text>}{leagues.slice(1).map(league => <LeagueCard key={league.id} league={league} now={now} progress={progress.counts[league.id]} />)}</> : <Message title={data.libraryLoading ? 'Finding your next challenge…' : 'Room for a new adventure'} detail={data.libraryLoading ? undefined : 'No ' + tab.toLowerCase() + ' challenges right now. Check the other tabs or come back soon.'} loading={data.libraryLoading} />}
    </ScrollView>
  </Screen>;
}
const styles = StyleSheet.create({ eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: colors.muted, marginHorizontal: 23, marginBottom: 16 }, sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.ink, marginHorizontal: 23, marginBottom: 3 } });
