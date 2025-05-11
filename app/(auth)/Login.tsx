import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";

import { useRouter } from "expo-router";
import { useAuth } from "@/context/authContext";
import { Redirect } from "expo-router";
import { COLORS } from "../styles/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { session, login } = useAuth();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const handleSubmit = async () => {
    login({ email, password });
  };

  if (session) {
    return <Redirect href={"/(app)/(tabs)/Feed"} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back!</Text>
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
          value={password}
          secureTextEntry
          placeholderTextColor={COLORS.placeholder || "#999"}
          onChangeText={(password) => setPassword(password)}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/Signup")}>
          <Text style={styles.linkText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || "#F5F5F5",
  },
  content: {
    flex: 1,
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
    backgroundColor: COLORS.primary || "#007AFF",
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
});
