import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";

import { COLORS } from "../styles/theme";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ID } from "appwrite";
import { account } from "@/lib/appwriteConfig";

export default function SignupScreen() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [username, setUsername] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");


  const handleSubmit = async ()=>{
    if(password !== confirmPassword){
        console.log("Password donot match")
        return
    }

    try{

      const result = await account.create(
        ID.unique(),
        email,
        confirmPassword,
        username
      )

      setSuccess("Account created successfully")

    } catch(err){
      console.log(err)
      setError("Account creation error")
    }
  }


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={styles.input}
          value={username}
          placeholder="Username"
          placeholderTextColor="#999"
          onChangeText={(username) => setUsername(username)}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          keyboardType="email-address"
          placeholderTextColor="#999"
          onChangeText={(email) => setEmail(email)}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          placeholderTextColor="#999"
          onChangeText={(password) => setPassword(password)}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          placeholderTextColor="#999"
          onChangeText={(confirmPassword) =>
            setConfirmPassword(confirmPassword)
          }
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.linkText} onPress={()=>router.push("/Login")}>Already have an account? Log in</Text>

        <Text>{success ? (<Text style={{color:"green"}}>success</Text>) : <Text style={{color: "red"}}>error</Text>}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 40,
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
    backgroundColor: "#28A745",
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
