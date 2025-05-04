import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/app/styles/theme";
import { debounce } from "lodash";
import fetchSuggestions from "../features/fetchSuggestions";

const { width } = Dimensions.get("window");

const Add = () => {
  const [moodText, setMoodText] = useState("");
  const [moods, setMoods] = useState<string[]>([]);
  const [locationText, setLocationText] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [inputLayout, setInputLayout] = useState({ y: 0, height: 0 });


  

  // Fetch location suggestions when locationText changes
 useEffect(() => {
   if (locationText.trim()) {
     const debouncedFetch = debounce(async (text: string) => {
       const suggestions = await fetchSuggestions(text);
       setLocationSuggestions(suggestions);
     }, 300); // 300ms debounce

     debouncedFetch(locationText);

     // Cleanup: cancel debounce on unmount or before next run
     return () => debouncedFetch.cancel();
   } else {
     setLocationSuggestions([]);
   }
 }, [locationText]);

  const handleAddMood = () => {
    if (moodText.trim()) {
      setMoods([...moods, moodText.trim()]);
      setMoodText("");
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
              <Text style={styles.username}>User name</Text>
            </View>

            <Text style={styles.subtext}>Share your feelings</Text>

            <TextInput
              style={styles.input}
              placeholder="Add a catchy title to your post"
              placeholderTextColor="#999"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your feelings...."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.rateButton}>
              <Text style={styles.rateText}>⭐ Rate it</Text>
            </TouchableOpacity>

            <View style={styles.iconRow}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="camera" size={24} color="#000" />
                <Text>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="images" size={24} color="#000" />
                <Text>Gallery</Text>
              </TouchableOpacity>
            </View>

            {/* LOCATION INPUT */}
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
                value={locationText}
                onChangeText={setLocationText}
              />
            </View>

            {/* Mood Input */}
            <TextInput
              style={styles.input}
              placeholder="Add your mood here"
              placeholderTextColor="#999"
              value={moodText}
              onChangeText={(mText) => setMoodText(mText)}
              onSubmitEditing={handleAddMood}
              returnKeyType="done"
            />

            {/* Mood Tags */}
            <View style={styles.moodRow}>
              {moods.map((mood, index) => (
                <TouchableOpacity key={index} style={styles.moodTag}>
                  <Text style={styles.moodText}>{mood}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Post Button */}
            <TouchableOpacity style={styles.postButton}>
              <Text style={styles.postButtonText}>Post Review</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* LOCATION SUGGESTIONS */}
        {locationSuggestions.length > 3 && (
          <View
            style={[
              styles.suggestionBox,
              {
                top: inputLayout.y - locationSuggestions.length * 45 - 10,
              },
            ]}
          >
            <FlatList
              data={locationSuggestions}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.locationSuggestion}
                  onPress={() => handleLocationSelect(item)}
                >
                  <Text>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
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
  locationSuggestion: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  moodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  moodTag: {
    backgroundColor: "#F3F3F3",
    borderRadius: 20,
    paddingHorizontal: 16,
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
  suggestionBox: {
    position: "absolute",
    width: width - 40,
    left: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    zIndex: 999,
    maxHeight: 150,
  },
});
