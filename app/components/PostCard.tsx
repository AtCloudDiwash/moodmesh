import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "@/app/styles/theme";

const PostCard = ({ postData }) => {
  return (
    <View style={styles.card}>
      {/* User Info */}
      <View style={styles.userInfo}>
        <Image
          source={{ uri: postData.user.avatarUrl }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.userName}>{postData.user.name}</Text>
          <Text style={styles.userFeeling}>{postData.user.feeling}</Text>
        </View>
      </View>

      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: postData.image.url }} style={styles.postImage} />
        <View style={styles.overlay}>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={16} color="#fff" />
            <Text style={styles.locationText}>{postData.image.location}</Text>
          </View>
          <TouchableOpacity style={styles.viewMore}>
            <Text style={styles.viewMoreText}>View More →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Caption */}
      <Text style={styles.caption}>{postData.caption}</Text>

      {/* Tags */}
      <View style={styles.tags}>
        {postData.tags.map((tag, index) => (
          <Text key={index} style={styles.tag}>
            {tag}
          </Text>
        ))}
      </View>

      {/* Engagement Row */}
      <View style={styles.engagementRow}>
        <View style={styles.engagementItem}>
          <FontAwesome name="thumbs-up" size={18} color="#3366ff" />
          <Text style={styles.engagementText}>{postData.engagement.likes}</Text>
        </View>
        <View style={styles.engagementItem}>
          <Ionicons name="chatbubble-ellipses" size={18} color="#888" />
          <Text style={styles.engagementText}>
            {postData.engagement.comments}
          </Text>
        </View>
        <View style={styles.engagementItem}>
          <Ionicons name="star" size={18} color="#f1c40f" />
          <Text style={styles.engagementText}>
            {postData.engagement.rating}
          </Text>
        </View>
        <MaterialIcons name="favorite" size={22} color="#ff8000" />
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
  postImage: {
    width: "100%",
    height: 250,
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
    backgroundColor: "#00000080",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    marginBottom: 10,
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
