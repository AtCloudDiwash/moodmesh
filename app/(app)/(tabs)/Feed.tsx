import { Text, View, FlatList, SafeAreaView, StyleSheet, StatusBar } from "react-native";
import { Stack } from "expo-router";
import PostCard from "@/app/components//PostCard";
import { COLORS } from "../../styles/theme";

export default function FeedScreen() {
  const posts = [
    {
      id: "1",
      user: {
        name: "User 1",
        avatarUrl: "https://picsum.photos/200/300",
        feeling: "Feeling happy, excited",
      },
      image: {
        url: "https://picsum.photos/200/300",
        location: "Himalayan Java, Jawalakhel",
      },
      caption: "Every bite was a mood",
      tags: ["#Hungry 😋", "#Delicious 😋", "#Heaven ☁️"],
      engagement: {
        likes: 1200,
        comments: 600,
        rating: 4.6,
      },
    },
    {
      id: "2",
      user: {
        name: "User 2",
        avatarUrl: "https://picsum.photos/200/301",
        feeling: "Feeling relaxed",
      },
      image: {
        url: "https://picsum.photos/200/301",
        location: "Cafe XYZ, Kathmandu",
      },
      caption: "Chasing good vibes",
      tags: ["#Chill 🧊", "#Coffee ☕"],
      engagement: {
        likes: 800,
        comments: 200,
        rating: 4.2,
      },
    },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content"></StatusBar>
      <SafeAreaView style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>MoodMesh</Text>
        </View>

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard postData={item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          style={styles.flatList} // Ensures FlatList fills the screen
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  titleContainer:{
    marginTop: 10,
    width: "100%",
    alignItems: "flex-start",
    paddingLeft: 15,
    paddingTop: 15, 
  },
  title:{
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  flatList: {
    width: "100%",
    marginTop: 1
  },
  
});