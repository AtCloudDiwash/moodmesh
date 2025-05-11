import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  ScrollView,
  StyleSheet,
  Button,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/authContext";
import { databases } from "@/lib/appwriteConfig";
import { Query } from "appwrite";

const Profile = () => {
  const { user, signout } = useAuth();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const postsResponse = await databases.listDocuments(
            process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_DATABSE_ID,
            process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_POSTS_COLLECTION_ID,
            [Query.equal("username", user.name), Query.orderDesc("$createdAt")]
          );
          setUserPosts(postsResponse.documents || []); // Safeguard in case documents is undefined
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user posts:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!user) {
    return <Text>No user profile found</Text>;
  }

  // Safeguard for userPosts length
  const likesTotal =
    userPosts && userPosts.length > 0
      ? userPosts.reduce((total, post) => total + (post.likes || 0), 0)
      : 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Your Profile</Text>

      <View style={styles.userInfo}>
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.username}>{user.name || "Guest"}</Text>
          <Text style={styles.likes}>
            Total Likes: {likesTotal}{" "}
            <Text style={styles.meshPoints}>
              Mesh points: {userPosts.length * 10 || 0}
            </Text>
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your Posts</Text>
      <View style={styles.postGrid}>
        {userPosts.map((post, idx) => {
          const postImageUrl =
            post.img_urls && post.img_urls.length > 0
              ? `https://fra.cloud.appwrite.io/v1/storage/buckets/${process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_USERPOST_IMAGES_BUCKET_ID}/files/${post.img_urls[0]}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`
              : null; // Handle missing or empty imageUrls
          
          return (
            <View key={idx} style={styles.postCard}>
              {postImageUrl ? (
                <Image
                  source={{ uri: postImageUrl }}
                  style={styles.postImage}
                />
              ) : (
                <Text>No Image Available</Text> // Fallback if imageUrl is missing
              )}
              <Text style={styles.postTitle}>
                {post.title || "Untitled Post"}
              </Text>
              <Text style={styles.postDetails}>
                {post.like_counts || 0} Likes | {post.rating} Rating
              </Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.favoriteButton}>
        <Text style={styles.favoriteText}>Go to favorites</Text>
      </TouchableOpacity>

      <View style={styles.walletSection}>
        <Ionicons name="wallet" size={24} color="#0066FF" />
        <Text style={styles.connectText}>Connect to Phantom</Text>
      </View>

      <TouchableOpacity onPress={signout} style={{ marginBottom: 100 }}>
        <Button title={`Wanna log out ${user?.name || ""}`} onPress={signout} />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", paddingTop: 40 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  userInfo: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  username: { fontSize: 18, fontWeight: "600" },
  likes: { fontSize: 14, color: "#888" },
  meshPoints: { color: "#FF6C00" },

  sectionTitle: { fontSize: 18, fontWeight: "600", marginVertical: 10 },
  postGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  postCard: { width: "48%", marginBottom: 16 },
  postImage: { width: "100%", height: 100, borderRadius: 10 },
  postTitle: { fontWeight: "600", marginTop: 6 },
  postDetails: { fontSize: 12, color: "#888" },

  favoriteButton: {
    backgroundColor: "#4460F1",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  favoriteText: { color: "#fff", fontWeight: "600" },

  walletSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 30,
  },
  connectText: { fontSize: 16, color: "#0066FF" },
});

export default Profile;
