import React from "react";
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
import useUserPostIds from "../features/getUserPostId";
import { useCallback } from "react";

export default function FeedScreen() {
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const limit = 10;
  const { postIds, loadingUserPost, errorLoadingPost, hasMore } = useUserPostIds(page, limit, refreshKey);
  const [refreshing, setRefreshing] = useState(false);


  const loadMorePosts = useCallback(() => {
    if (!loadingUserPost && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loadingUserPost, hasMore]);

const onRefresh = useCallback(() => {
  setPage(1); 
  setRefreshKey(Date.now()); 
}, []);

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
          renderItem={({ item }) => <PostCard postData={item} refreshKey = {refreshKey}/>}
          style={styles.flatList}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            loadingUserPost && hasMore ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={styles.loader}
              />
            ) : null
          }
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
  loader: { marginVertical: 20 },
});
