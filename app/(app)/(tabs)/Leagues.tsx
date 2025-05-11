import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import LeagueCard from "@/app/components/LeagueCard";
import useLeaguesInformation from "../features/fetchLeaguesDetails";
import { COLORS } from "@/app/styles/theme";

const Leagues: React.FC = () => {
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, error, hasMore } = useLeaguesInformation(
    page,
    10,
    refreshKey
  );



  const handleRefresh = useCallback(() => {
    setPage(1);
    setRefreshKey(Date.now());
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  if (loading && page === 1) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Active Leagues</Text>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <LeagueCard
            title={item.title}
            author={item.author}
            banner_url={item.banner_url}
            life_span={item.life_span}
            league_id={item.league_id}
          />
        )}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={styles.list}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={
          loading && hasMore ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 16,
  },
  list: {
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
});

export default Leagues;
