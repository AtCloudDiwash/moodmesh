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
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateInputs = () => {
    const newErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username || username.trim() === "") {
      newErrors.username = "Username is required.";
    }

    if (!email || email.trim() === "") {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm your password.";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    return (
      !newErrors.username &&
      !newErrors.email &&
      !newErrors.password &&
      !newErrors.confirmPassword
    );
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    try {
      const result = await account.create(
        ID.unique(),
        email,
        password,
        username
      );

      try {
        await databases.createDocument(
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
        setTimeout(() => router.push("/Login"), 1500);
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
          onChangeText={setUsername}
        />
        {errors.username ? (
          <Text style={styles.errorText}>{errors.username}</Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          keyboardType="email-address"
          placeholderTextColor={COLORS.placeholder || "#999"}
          onChangeText={setEmail}
        />
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          placeholderTextColor={COLORS.placeholder || "#999"}
          onChangeText={setPassword}
        />
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          placeholderTextColor={COLORS.placeholder || "#999"}
          onChangeText={setConfirmPassword}
        />
        {errors.confirmPassword ? (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        ) : null}

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
    marginBottom: 8,
    backgroundColor: COLORS.inputBackground || "#FFFFFF",
    fontSize: 16,
    color: COLORS.textPrimary || "#1A1A1A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  errorText: {
    color: COLORS.error || "red",
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
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
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  linkText: {
    color: "#555555",
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
    backgroundColor: "#FFFFFF",
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
    color: "#28A745",
  },
  modalTitleError: {
    color: "#FF4D4D",
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
    color:  "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
