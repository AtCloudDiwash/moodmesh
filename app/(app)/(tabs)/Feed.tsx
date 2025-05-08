import React from 'react';
import {
  Text,
  View,
  FlatList,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
import PostCard from "@/app/components/PostCard";
import { COLORS } from "../../styles/theme";
import { useState, useEffect } from "react";
import useUserPostIds from '../features/getUserPostId';

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const limit = 10;
  const { postIds, loadingUserPost, errorLoadingPost } = useUserPostIds();

  //for development only

  // const fetchPosts = async (pageToFetch = 1, refreshing = false) => {
  //   try {
  //     const res = await fetch(
  //       `https://picsum.photos/v2/list?page=${pageToFetch}&limit=${limit}`
  //     );
  //     const data = await res.json();
  //     const user = await account.get();
  //     console.log(user.name)

  //     const formattedPosts = data.map((img, i) => ({
  //       id: `${img.id}-${Date.now()}`,
  //       user: {
  //         name: `User ${img.author}`,
  //         avatarUrl: `https://i.pravatar.cc/150?img=${(i + pageToFetch) % 70}`,
  //         feeling: "Feeling great!",
  //       },
  //       image: {
  //         url: img.download_url,
  //         location: "Random Location 🌍",
  //       },
  //       caption: "Random vibes with random images",
  //       tags: ["#vibe", "#random", "#image"],
  //       engagement: {
  //         likes: Math.floor(Math.random() * 2000),
  //         comments: Math.floor(Math.random() * 300),
  //         rating: (Math.random() * 5).toFixed(1),
  //       },
  //     }));

  //     if (refreshing) {
  //       setPosts(formattedPosts);
  //     } else {
  //       setPosts((prev) => [...prev, ...formattedPosts]);
  //     }

  //     setHasMore(data.length === limit);
  //   } catch (err) {
  //     console.error("Fetch error:", err);
  //   }
  // };

  // const loadMorePosts = async () => {
  //   if (loading || !hasMore) return;
  //   setLoading(true);
  //   const nextPage = page + 1;
  //   await fetchPosts(nextPage);
  //   setPage(nextPage);
  //   setLoading(false);
  // };

  // const onRefresh = async () => {
  //   setRefreshing(true);
  //   await fetchPosts(Math.floor(Math.random() * 40), true);
  //   setPage(1);
  //   setRefreshing(false);
  // };

  // useEffect(() => {
  //   fetchPosts();
  // }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content"></StatusBar>
      <SafeAreaView style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>moodmesh</Text>
        </View>

        <FlatList
          data={postIds}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <PostCard postData={item}/>}
          style={styles.flatList}
          // onEndReached={loadMorePosts}
          // onEndReachedThreshold={0.5}
          // refreshControl={
          //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          // }
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
  titleContainer: {
    marginTop: 10,
    width: "100%",
    alignItems: "flex-start",
    paddingLeft: 15,
    paddingTop: 5,
    paddingBottom: 15,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  flatList: {
    width: "100%",
    marginTop: 1,
  },
});
