import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "@/app/styles/theme";

interface LeagueCardProps {
  title: string;
  author: string;
  banner_url: string;
  life_span: number;
  league_id: string;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    s
  ).padStart(2, "0")}`;
};

const LeagueCard: React.FC<LeagueCardProps> = ({
  title,
  author,
  banner_url,
  life_span,
  league_id,
}) => {
  const router = useRouter();
  const [remainingTime, setRemainingTime] = useState(life_span);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ImageBackground
      source={{ uri: banner_url }}
      style={styles.itemContainer}
      imageStyle={{ borderRadius: 10 }}
    >
      <View style={styles.overlay}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {/* Ends in {formatTime(remainingTime)} */}
            Coming soon...
          </Text>
          <Text style={styles.author}>By {author}</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>null
            // router.push({
            //   pathname: "/(app)/screens/LeagueDetailScreen",
            //   params: { league_id },
            // })
          }
        >
          <Text style={styles.buttonText}>Compete 🏁</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    height: 240,
    borderRadius: 22,
    marginBottom: 16,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 16,
    height: "100%",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.endsIn,
    marginTop: 4,
  },
  author: {
    fontSize: 12,
    color: "#ccc",
    marginTop: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
    alignSelf: "flex-end",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default LeagueCard;
