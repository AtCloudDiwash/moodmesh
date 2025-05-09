import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Dimensions,
} from "react-native";

interface League {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
}

const DATA: League[] = [
  {
    id: "1",
    title: "Top 10 Peaceful Places To Code in Kathmandu",
    subtitle: "Ends in 12:10:12",
    imageUrl: "https://picsum.photos/200/300",
  },
  {
    id: "2",
    title: "Top 10 Peaceful Places To Code in Kathmandu",
    subtitle: "Ends in 12:10:12",
    imageUrl: "https://picsum.photos/200/300",
  },
  {
    id: "3",
    title: "Top 10 Peaceful Places To Code in Kathmandu",
    subtitle: "Ends in 12:10:12",
    imageUrl: "https://picsum.photos/200/300",
  },
];

// Get the screen height
const windowHeight = Dimensions.get("window").height;

const Leagues: React.FC = () => {
  const renderItem = ({ item }: { item: League }) => (
    <ImageBackground
      source={{ uri: item.imageUrl }}
      style={styles.itemContainer}
      imageStyle={styles.imageBackground}
    >
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Complete 🏁</Text>
      </TouchableOpacity>
    </ImageBackground>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Active Leagues</Text>
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 16,
  },
  list: {
    paddingHorizontal: 16,
  },
  itemContainer: {
    height: windowHeight * 0.35, // 15% of screen height
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },
  imageBackground: {
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#ffd700", // Gold color to match the screenshot
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    right: 0
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default Leagues;
