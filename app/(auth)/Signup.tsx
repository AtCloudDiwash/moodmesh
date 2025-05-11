import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
} from "react-native";

import { COLORS } from "../styles/theme";
import { useRouter } from "expo-router";
import { ID } from "appwrite";
import { account, databases } from "@/lib/appwriteConfig";

export default function SignupScreen() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [username, setUsername] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setModalMessage("Password does not match");
      setModalVisible(true);
      return;
    }

    try {
      const result = await account.create(
        ID.unique(),
        email,
        confirmPassword,
        username
      );

      try {
        const userProfileRegister = await databases.createDocument(
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_DATABSE_ID,
          process.env.EXPO_PUBLIC_APPWRITE_MOODMESH_USER_PROFILE_COLLECTION_ID,
          ID.unique(),
          {
            username,
            total_likes: 0,
            total_mesh_points: 0,
            saved_posts: [],
            avatar_url: [],
          }
        );

        setModalMessage("Account created successfully");
        setModalVisible(true);
        router.push("/Login");
      } catch (error) {
        console.error(error);
        setModalMessage("Error creating user profile");
        setModalVisible(true);
      }
    } catch (err) {
      console.log(err);
      setModalMessage("Account creation error");
      setModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={styles.input}
          value={username}
          placeholder="Username"
          placeholderTextColor={COLORS.placeholder || "#999"}
          onChangeText={(username) => setUsername(username)}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          keyboardType="email-address"
          placeholderTextColor={COLORS.placeholder || "#999"}
          onChangeText={(email) => setEmail(email)}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          placeholderTextColor={COLORS.placeholder || "#999"}
          onChangeText={(password) => setPassword(password)}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          placeholderTextColor={COLORS.placeholder || "#999"}
          onChangeText={(confirmPassword) =>
            setConfirmPassword(confirmPassword)
          }
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/Login")}>
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text
              style={[
                styles.modalTitle,
                modalMessage.includes("Error") && styles.modalTitleError,
              ]}
            >
              {modalMessage.includes("Error") ? "Error" : "Success"}
            </Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || "#F5F5F5",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 32,
    textAlign: "center",
    color: COLORS.textPrimary || "#1A1A1A",
    letterSpacing: 0.5,
  },
  input: {
    height: 56,
    borderWidth: 0,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.inputBackground || "#FFFFFF",
    fontSize: 16,
    color: COLORS.textPrimary || "#1A1A1A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    backgroundColor: COLORS.primary || "#28A745",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginVertical: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: COLORS.buttonText || "#FFFFFF",
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  linkText: {
    color: COLORS.link || "#555555",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    backgroundColor: COLORS.modalBackground || "#FFFFFF",
    padding: 24,
    borderRadius: 20,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    color: COLORS.success || "#28A745",
  },
  modalTitleError: {
    color: COLORS.error || "#FF4D4D",
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: COLORS.textSecondary || "#333333",
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: COLORS.secondary || "#28A745",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: COLORS.buttonText || "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
