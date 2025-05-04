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


export default function LoginScreen() {
  const router = useRouter()
  const {session, login} = useAuth();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();


  const handleSubmit = async () => {
    login({email, password})
  };

  
  if (session) {
    return <Redirect href={"/(app)/(tabs)/Feed"} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        keyboardType="email-address"
        placeholderTextColor="#999"
        onChangeText={(email)=>setEmail(email)}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        placeholderTextColor="#999"
        onChangeText={(password)=>setPassword(password)}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.linkText} onPress={() => router.push("/Signup")}>
        Don&apos;t have an account? Sign up
      </Text>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  linkText: {
    color: "#555",
    textAlign: "center",
    textDecorationLine: "underline",
    fontSize: 14,
  },
});
