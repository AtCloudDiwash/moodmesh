import React, { useState, useEffect, use } from "react";
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
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/app/styles/theme";
import { debounce } from "lodash";
import * as ImagePicker from "expo-image-picker";
import fetchSuggestions from "../features/fetchSuggestions";
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/authContext";
import MapView, { Marker } from "react-native-maps";
import { uploadImages } from "../features/uploadImages";
import { ID } from "appwrite";
import { account, databases } from "@/lib/appwriteConfig";

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
  const [pinnedCoordinate, setPinnedCoordinate] = useState([]);
  const [rating, setRating] = useState(null); // Track rating value
  const [showRatingModal, setShowRatingModal] = useState(false); // Control rating input modal
  const [ratingInput, setRatingInput] = useState(""); // Temporary input for rating
  const router = useRouter();
  const [username, setUsername] = useState("fetching..");
  const { user } = useAuth();
  const [maxMoodSet, setMaxMoodSet] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [region, setRegion] = useState(null);
  const [marker, setMarker] = useState(null);



  useEffect(() => {
    setUsername(user.name);
  }, []);

  const handleMapPress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    console.log(marker.latitude, marker.longitude)
  };

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

  useEffect(()=>{
    console.log(images)
  }, [images])

  const handlePostReview = async () => {
    
    try{
      const imgUrls = await uploadImages(images);
      console.log("Image urls array", imgUrls)

      if (imgUrls.length === 0){
        return;
      }

      const data = {
        username,
        title,
        description,
        mood:moods,
        like_counts: 0,
        saved_details: [],
        postId: ID.unique(),
        rating: parseFloat(rating),
        img_urls: imgUrls,
        location: [toString(marker.latitude),toString(marker.longitude)],
      };

      console.log(data)

      const uploadedData = await databases.createDocument(
        process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_DATABSE_ID,
        process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_POSTS_COLLECTION_ID,
        ID.unique(),
        data
      );

      console.log("This is uploaded", uploadedData);
      return

    } catch(error){
      console.error("Error happened while posting data")
      console.error(error)
    }
    
  };

  const clickPicture = async () => {
    if (images.length >= 3) {
      setMaxUploaded(true);
      console.log("Max uploaded");
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Camera access is required.");
      return;
    }

    const clickedPicture = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      aspect: [4, 3],
      quality: 1,
    });

    if (!clickedPicture.canceled) {
      const imageUri = clickedPicture.assets[0].uri;
      if (images.length < 3) {
        setImages((prev) => [...prev, { uri: imageUri }]);
        setMaxUploaded(false);
      }
    }
  };

  const pickImages = async () => {
    if (images.length >= 3) {
      setMaxUploaded(true);
      return;
    }
    let pickedImages = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!pickedImages.canceled) {
      const newImages = pickedImages.assets;
      const remainingSlots = 3 - images.length;
      if (remainingSlots > 0) {
        const imagesToAdd = newImages.slice(0, remainingSlots);
        setImages([...images, ...imagesToAdd]);
        setMaxUploaded(false);
      }
    }
  };

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

  const removeSelectedImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const removeSelectedMood = (index) => {
    const updatedMoods = moods.filter((_, i) => i !== index);
    setMoods(updatedMoods);
  };

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

  const handleAddMood = () => {
    if (moods.length >= 3) {
      setMaxMoodSet(true);
      return;
    }

    if (moodText.trim()) {
      setMoods([...moods, moodText.trim()]);
      setMoodText([]);
      setMaxMoodSet((prev) => prev + 1);
      setMaxMoodSet(false);
      {}
    }
  };

  const handleLocationSelect = (location) => {
    setLocationText(location.label);
    setSelectedLocation(location);
    setLocationSuggestions([]);
  };

  const dismissKeyboardAndSuggestions = () => {
    Keyboard.dismiss();
    setLocationSuggestions([]);
  };

  // Handle rating button press
  const handleRatePress = () => {
    setShowRatingModal(true);
    setRatingInput("");
  };

  // Validate and submit rating
  const handleRatingSubmit = () => {
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
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboardAndSuggestions}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
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
              onChangeText={(newTitle) => setTitle(newTitle)}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your feelings...."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={(newDesc) => setDescription(newDesc)}
            />
            <TouchableOpacity
              style={styles.rateButton}
              onPress={handleRatePress}
            >
              <Text style={styles.rateText}>
                {rating ? `⭐ ${rating.toFixed(1)} rated` : "⭐ Rate it"}
              </Text>
            </TouchableOpacity>
            <View style={styles.iconRow}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={clickPicture}
              >
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
                You can only select up to 3 images. Please remove one to add a
                new image.
              </Text>
            )}
            {images.length > 0 && (
              <FlatList
                data={images}
                renderItem={renderImageItem}
                keyExtractor={(item, index) =>
                  item.id?.toString() || index.toString()
                }
                horizontal
                scrollEnabled={true}
                showsHorizontalScrollIndicator={false}
                style={{ flex: 1, marginBottom: 10, width: "100%" }}
                contentContainerStyle={{
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                }}
              />
            )}
            <View
              style={styles.locationInput}
              onLayout={(event) => {
                const { y, height } = event.nativeEvent.layout;
                setInputLayout({ y, height });
              }}
            >
              <Ionicons name="location-outline" size={20} color="#666" />
              <TextInput
                style={styles.locationTextInput}
                placeholder="Tag Location"
                placeholderTextColor="#999"
                onPress={() => setShowLocationPicker(true)}
              />
              {marker && (<Text>{marker.latitude} {marker.longitude}</Text>)}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Add your mood here"
              placeholderTextColor="#999"
              value={moodText}
              onChangeText={(mText) => setMoodText(mText)}
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
            {maxMoodSet ? (
              <Text style={{ color: "red", bottom: 5 }}>
                Mood limit up to 3
              </Text>
            ) : null}
            <TouchableOpacity
              style={styles.postButton}
              onPress={handlePostReview}
            >
              <Text style={styles.postButtonText}>Post Review</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Location Picker */}

        <Modal
          visible={showLocationPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLocationPicker(false)}
        >
          <MapView style={{ flex: 1 }} region={region} onPress={handleMapPress}>
            {region && (
              <Marker
                coordinate={{
                  latitude: region.latitude,
                  longitude: region.longitude,
                }}
                title="You"
                pinColor="#3C64FE"
              >
              </Marker>
            )}
            {marker && (
              <Marker
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                title={`${marker.latitude} ${marker.longitude}`}
              />
            )}
          </MapView>
          <View style={styles.modalButtonRow}>
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
              onPress={() => setShowLocationPicker(false)}
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
                autoFocus={true}
              />
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowRatingModal(false)}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      styles.modalButtonTextCancel,
                    ]}
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
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Add;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
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
  },
  suggestionsList: {
    maxHeight: 150,
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  suggestionText: {
    color: "#333",
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
  // Modal styles for rating input
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
});
