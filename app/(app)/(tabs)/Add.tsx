import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Keyboard,
  Dimensions,
  Alert,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/app/styles/theme";
import { debounce } from "lodash";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/authContext";
import MapView, { Marker } from "react-native-maps";
import { uploadImages } from "../features/uploadImages";
import { ID } from "appwrite";
import { databases } from "@/lib/appwriteConfig";
import NoticeModal from "@/app/components/NoticeModal";
import SubmittingModal from "@/app/components/SubmittingModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@react-navigation/elements";

const { width } = Dimensions.get("window");

const Add = () => {
  const [moodText, setMoodText] = useState("");
  const [moods, setMoods] = useState([]);
  const [locationText, setLocationText] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [inputLayout, setInputLayout] = useState({ y: 0, height: 0 });
  const [images, setImages] = useState([]);
  const [maxUploaded, setMaxUploaded] = useState(false);
  const [rating, setRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingInput, setRatingInput] = useState("");
  const router = useRouter();
  const [username, setUsername] = useState("fetching...");
  const { user } = useAuth();
  const [maxMoodSet, setMaxMoodSet] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(true);
  const [region, setRegion] = useState(null);
  const [marker, setMarker] = useState(null);
  const [postingLoader, setPostingLoader] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const resetStates = () => {
      setTitle("");
      setDescription("");
      setRating(null);
      setImages([]);
      setMarker(null);
      setMoods([]);
    };

  useEffect(() => {
    if (user?.name) {
      setUsername(user.name);
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  // Fetch location suggestions with debounce
  useEffect(() => {
    if (locationText.trim()) {
      const debouncedFetch = debounce(async (text) => {
        const suggestions = await fetchSuggestions(text);
        setLocationSuggestions(suggestions || []);
      }, 300);
      debouncedFetch(locationText);
      return () => debouncedFetch.cancel();
    } else {
      setLocationSuggestions([]);
    }
  }, [locationText]);

  // Handle map press to set marker
  const handleMapPress = useCallback((e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker((prev) => {
      if (prev?.latitude === latitude && prev?.longitude === longitude) {
        return prev;
      }
      return { latitude, longitude };
    });
  }, []);

  // Handle post review
  const handlePostReview = useCallback(
    debounce(async () => {
      if (!title || !description || !moods.length || !rating || !marker) {
        Alert.alert(
          "Error",
          "Please fill all required fields (title, description, mood, rating, location)."
        );
        return;
      }

      setPostingLoader(true);
      try {
        const imgUrls = await uploadImages(images);
        if (imgUrls.length === 0) {
          Alert.alert("Error", "No images uploaded.");
          return;
        }

        const data = {
          username,
          title,
          description,
          mood: moods,
          like_counts: 0,
          saved_details: [],
          postId: ID.unique(),
          rating: parseFloat(rating),
          img_urls: imgUrls,
          location: marker
            ? [String(marker.latitude), String(marker.longitude)]
            : [],
        };

        const uploadedData = await databases.createDocument(
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_DATABSE_ID,
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_POSTS_COLLECTION_ID,
          ID.unique(),
          data
        );
        setIsSuccessModalVisible(true);
        resetStates()
      } catch (error) {
        console.error("Error posting data:", error);
        Alert.alert("Error", "Failed to post review. Please try again.");
      } finally {
        setPostingLoader(false);
      }
    }, 300),
    [username, title, description, moods, rating, images, marker]
  );

  // Close success modal
  const closeSuccessModal = useCallback(() => {
    setIsSuccessModalVisible(false);
  }, []);

  // Image picking functions
  const clickPicture = useCallback(async () => {
    if (images.length >= 3) {
      setMaxUploaded(true);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Camera access is required.");
      return;
    }

    const clickedPicture = await ImagePicker.launchCameraAsync({
      mediaTypes:'images',
      aspect: [4, 3],
      quality: 1,
      allowsEditing: true
    });

    if (!clickedPicture.canceled) {
      const imageUri = clickedPicture.assets[0].uri;
      setImages((prev) => [...prev, { uri: imageUri }]);
      setMaxUploaded(false);
    }
  }, [images]);

  const pickImages = useCallback(async () => {
    if (images.length >= 3) {
      setMaxUploaded(true);
      return;
    }

    const pickedImages = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.7,
      aspect: [4, 3],
    });

    if (!pickedImages.canceled) {
      const newImages = pickedImages.assets;
      const remainingSlots = 3 - images.length;
      if (remainingSlots > 0) {
        setImages((prev) => [...prev, ...newImages.slice(0, remainingSlots)]);
        setMaxUploaded(newImages.length > remainingSlots);
      }
    }
  }, [images]);

  const removeSelectedImage = useCallback((index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setMaxUploaded(false);
  }, []);

  const renderImageItem = ({ item, index }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.uri }} style={styles.image} />
      <Ionicons
        name="close-circle-outline"
        style={styles.deleteButton}
        size={25}
        color={COLORS.danger}
        onPress={() => removeSelectedImage(index)}
      />
    </View>
  );

  const removeSelectedMood = useCallback((index) => {
    setMoods((prev) => prev.filter((_, i) => i !== index));
    setMaxMoodSet(false);
  }, []);

  const handleAddMood = useCallback(() => {
    if (moods.length >= 3) {
      setMaxMoodSet(true);
      return;
    }

    if (moodText.trim()) {
      setMoods((prev) => [...prev, moodText.trim()]);
      setMoodText("");
      setMaxMoodSet(false);
    }
  }, [moodText, moods]);

  const handleLocationSelect = useCallback((location) => {
    setLocationText(location.label);
    setSelectedLocation(location);
    setLocationSuggestions([]);
  }, []);

  const dismissKeyboardAndSuggestions = useCallback(() => {
    Keyboard.dismiss();
    setLocationSuggestions([]);
  }, []);

  const handleRatePress = useCallback(() => {
    setShowRatingModal(true);
    setRatingInput("");
  }, []);

  const handleRatingSubmit = useCallback(() => {
    const num = parseFloat(ratingInput);
    if (!isNaN(num) && num >= 1 && num <= 5 && Number(num.toFixed(1)) === num) {
      setRating(num);
      setShowRatingModal(false);
    } else {
      Alert.alert(
        "Invalid Rating",
        "Please enter a number between 1 and 5 with one decimal place (e.g., 4.5)."
      );
    }
  }, [ratingInput]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 50}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Wrap inputs in TouchableWithoutFeedback for keyboard dismissal */}
          <TouchableWithoutFeedback onPress={dismissKeyboardAndSuggestions}>
            <View>
              <Text style={styles.header}>Create Post</Text>
              <View style={styles.userInfo}>
                <Image
                  source={{ uri: "https://picsum.photos/200" }}
                  style={styles.avatar}
                />
                <Text style={styles.username}>{username}</Text>
              </View>
              <Text style={styles.subtext}>Share your feelings</Text>
              <TextInput
                style={styles.input}
                placeholder="Add a catchy title to your post"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your feelings...."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </TouchableWithoutFeedback>
          <TouchableOpacity style={styles.rateButton} onPress={handleRatePress}>
            <Text style={styles.rateText}>
              {rating ? `⭐ ${rating.toFixed(1)} rated` : "⭐ Rate it"}
            </Text>
          </TouchableOpacity>
          <View style={styles.iconRow}>
            <TouchableOpacity style={styles.iconButton} onPress={clickPicture}>
              <Ionicons name="camera" size={24} color="#000" />
              <Text>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={pickImages}>
              <Ionicons name="images" size={24} color="#000" />
              <Text>Gallery</Text>
            </TouchableOpacity>
          </View>
          {maxUploaded && (
            <Text style={styles.warningText}>
              You can only select up to 3 images. Please remove one to add a new
              image.
            </Text>
          )}
          {images.length > 0 && (
            <FlatList
              data={images}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 10, width: "100%" }}
              contentContainerStyle={{
                paddingVertical: 5,
                paddingHorizontal: 10,
              }}
              nestedScrollEnabled={true} // Enable nested scrolling
            />
          )}
          <TouchableWithoutFeedback onPress={dismissKeyboardAndSuggestions}>
            <View style={styles.locationInput}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <TouchableOpacity
                style={styles.locationTextInput}
                onPress={() => setShowLocationPicker(true)}
              >
                <Text>
                  {marker
                    ? `${marker.latitude}, ${marker.longitude}`
                    : "Tag Location"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={dismissKeyboardAndSuggestions}>
            <View>
              <TextInput
                style={styles.input}
                placeholder="Add your mood here"
                placeholderTextColor="#999"
                value={moodText}
                onChangeText={setMoodText}
                onSubmitEditing={handleAddMood}
                returnKeyType="done"
              />
              <View style={styles.moodRow}>
                {moods.map((mood, index) => (
                  <TouchableOpacity key={index} style={styles.moodTag}>
                    <Text style={styles.moodText}>{mood}</Text>
                    <Ionicons
                      name="close-circle-outline"
                      style={styles.deleteMoodButton}
                      size={15}
                      color={COLORS.danger}
                      onPress={() => removeSelectedMood(index)}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {maxMoodSet && (
                <Text style={{ color: "red", marginBottom: 5 }}>
                  Mood limit up to 3
                </Text>
              )}
            </View>
          </TouchableWithoutFeedback>
          <TouchableOpacity
            style={styles.postButton}
            onPress={handlePostReview}
          >
            <Text style={styles.postButtonText}>Post Review</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <MapView
          style={{ flex: 1 }}
          region={region}
          onPress={handleMapPress}
          showsUserLocation={true}
        >
          {marker && (
            <Marker
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={`${marker.latitude.toFixed(4)} ${marker.longitude.toFixed(
                4
              )}`}
            />
          )}
        </MapView>
        <View style={[styles.modalButtonRow, styles.buttonBottom]}>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setShowLocationPicker(false)}
          >
            <Text
              style={[styles.modalButtonText, styles.modalButtonTextCancel]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.submitButton]}
            onPress={() => {
              setShowLocationPicker(false);
            }}
          >
            <Text style={styles.modalButtonText}>Use This Location</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Rating Input Modal */}
      <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Rating (1.0 - 5.0)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., 4.5"
              placeholderTextColor="#999"
              value={ratingInput}
              onChangeText={setRatingInput}
              keyboardType="decimal-pad"
              autoFocus
            />
            <View style={[styles.modalButtonRow, styles.buttonBottom]}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowRatingModal(false)}
              >
                <Text
                  style={[styles.modalButtonText, styles.modalButtonTextCancel]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleRatingSubmit}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay Modal */}
      {postingLoader && <SubmittingModal visible={postingLoader} />}

      {/* Success Modal */}
      <NoticeModal
        visible={isSuccessModalVisible}
        onClose={closeSuccessModal}
      />
    </SafeAreaView>
  );
};

export default Add;

// Styles (unchanged except for minor tweaks)
const styles = StyleSheet.create({
  container: {

    padding: 20,
    backgroundColor: "#fff",
    paddingBottom: 100, // Extra padding to ensure content is scrollable
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: "500",
  },
  subtext: {
    color: "#666",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#F3F3F3",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  rateButton: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 4,
  },
  rateText: {
    color: "#333",
    fontWeight: "500",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  iconButton: {
    alignItems: "center",
    width: "48%",
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    borderRadius: 10,
  },
  locationInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  locationTextInput: {
    flex: 1,
    marginLeft: 8,
    height: 40,
    color: "#000",
    justifyContent:"center"
  },
  moodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  moodTag: {
    flexDirection: "row",
    backgroundColor: COLORS.inputField,
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 6,
    marginRight: 8,
    marginTop: 8,
  },
  moodText: {
    color: "#000",
    fontWeight: "500",
  },
  postButton: {
    backgroundColor: "#1E88E5",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  imageContainer: {
    marginRight: 10,
    position: "relative",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    borderRadius: 50,
    backgroundColor: COLORS.iconColor,
    elevation: 2,
  },
  deleteMoodButton: {
    position: "absolute",
    top: 7,
    right: 5,
    borderRadius: 50,
  },
  warningText: {
    color: "red",
    fontSize: 14,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: width * 0.8,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  modalInput: {
    backgroundColor: "#F3F3F3",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: "100%",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButtonTextCancel: {
    color: "#000",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: "#F5F5F5",
  },
  submitButton: {
    backgroundColor: "#1E88E5",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  buttonBottom:{
    backgroundColor:"white",
    marginBottom:10,
  }
});
