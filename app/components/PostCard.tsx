import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "@/app/styles/theme";
import { useState } from "react";
import CustomCarousel from "./CustomCarousel";
import useUserPost from "../(app)/features/fetchUserPost";

const PostCard = ({ postData}) => {

  const {post, imageUrls} = useUserPost(postData)

  const [isCaptionVisible, setIsCaptionVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorites, setIsFavorites] = useState(false);

  const handleLike = () => {
    setIsLiked((prev) => !prev);
  };

  const handlSetFavorites = () => {
    setIsFavorites((prev) => !prev);
  };

    const openGoogleMaps = (latitude, longitude) => {

      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open map", err)
      );
    };

  if (!post) {
    return <ActivityIndicator size="large" color={COLORS.primary} />;
  }

  return (
    <View style={styles.card}>
      {/* User Info */}
      <View style={styles.userInfo}>
        <Image
          source={{ uri: "https://picsum.photos/id/237/200/300" }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.userName}>
            {post.username ? post.username : "Fetching..."}
          </Text>
          <Text style={styles.userFeeling}>I was Here</Text>
        </View>
      </View>

      {/* Image Section */}
      <View style={styles.imageContainer}>
        {imageUrls?.length > 0 && (
          <View style={styles.postImage}>
            <CustomCarousel images={imageUrls} />
          </View>
        )}
        {isCaptionVisible && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              {post.description}
            </Text>
          </View>
        )}
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.locationRow} onPress={()=>openGoogleMaps(post.location[0], post.location[1])}>
            <Ionicons name="location-sharp" size={16} color="#fff" />
            <Text style={styles.locationText}>Let's Go Explore 🚀</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewMore}
            onPress={() => setIsCaptionVisible((prev) => !prev)}
          >
            <Text style={styles.viewMoreText}>
              {!isCaptionVisible ? "View More" : "Show Less"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Caption */}

      <Text style={styles.caption}>This is title</Text>

      {/* Tags */}
      <View style={styles.tags}>
        {post.mood.map((tag, index) => (
          <Text key={index} style={styles.tag}>
           # {tag}
          </Text>
        ))}
      </View>

      {/* Engagement Row */}
      <View style={styles.engagementRow}>
        <View style={styles.engagementItem}>
          <TouchableOpacity
            onPress={handleLike}
            style={{ flexDirection: "row" }}
          >
            <FontAwesome
              name="thumbs-up"
              size={18}
              color={!isLiked ? COLORS.iconColor : COLORS.primary}
            />
            <Text style={styles.engagementText}>{post.like_counts}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.engagementItem}>
          <Ionicons name="star" size={18} color="#f1c40f" />
          <Text style={styles.engagementText}>{post.rating}</Text>
        </View>
        <TouchableOpacity onPress={handlSetFavorites}>
          <MaterialIcons
            name="favorite"
            size={22}
            color={isFavorites ? COLORS.specialColor : COLORS.iconColor}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(PostCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    margin: 15,
    paddingHorizontal: 15,
    paddingVertical: 25,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    width: "90%",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    marginRight: 10,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  userFeeling: {
    color: "#777",
    fontSize: 13,
  },
  imageContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  descriptionContainer: {
    position: "absolute",
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
    height: 290,
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },

  description: {
    fontSize: 12,
    color: COLORS.cardBackground,
    fontWeight: 500,
    lineHeight: 12*1.2
  },
  postImage: {
    width: "100%",
    height: 290,
  },
  overlay: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    justifyContent: "space-between",
    height: "100%",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    opacity: .7,
    width: "60%",
  },
  locationText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 13,
  },
  viewMore: {
    alignSelf: "flex-end",
    backgroundColor: "#00000080",
    padding: 6,
    borderRadius: 10,
    marginBottom: 15,
  },
  viewMoreText: {
    color: "#fff",
    fontSize: 12,
  },
  caption: {
    fontWeight: "bold",
    fontSize: 16,
    marginVertical: 10,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  tag: {
    color: "#777",
    fontSize: 13,
    marginRight: 10,
  },
  engagementRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  engagementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  engagementText: {
    marginLeft: 4,
    color: "#555",
  },
});
