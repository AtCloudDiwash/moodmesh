import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import useLeagueDetails from "../features/fetchLeagueDetail";
import { COLORS } from "@/app/styles/theme";

const LeagueDetailScreen: React.FC = () => {
  const { league_id } = useLocalSearchParams();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const { data, loading, error } = useLeagueDetails(
    league_id as string,
    refreshKey
  );

  useEffect(() => {
    if (!league_id) {
      router.replace("/(app)/(tabs)/Leagues");
    }
  }, [league_id]);

  if (loading) {
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
        <TouchableOpacity
          onPress={() => setRefreshKey(Date.now())}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>No league data found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.replace("/(app)/(tabs)/Leagues")}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{data.title}</Text>
      </View>

      <ImageBackground
        source={{
          uri: data.banner_url || "https://picsum.photos/300/200",
        }}
        style={styles.banner}
        imageStyle={{ borderRadius: 10 }}
      >
        <View style={styles.overlay}>
          <Text style={styles.description}>{data.description}</Text>
          <Text style={styles.endTime}>Ends: {data.end_time}</Text>
          <Text style={styles.author}>By {data.author}</Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  banner: {
    width: "100%",
    height: 250,
    justifyContent: "flex-end",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  description: {
    color: "#fff",
    fontSize: 16,
  },
  endTime: {
    color: "#fff",
    fontSize: 14,
    marginTop: 8,
  },
  author: {
    color: "#fff",
    fontWeight: "bold",
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default LeagueDetailScreen;
