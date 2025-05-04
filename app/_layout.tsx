import { Slot } from "expo-router";
import { AuthProvider } from "@/context/authContext";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content"></StatusBar>
      <Slot />
    </AuthProvider>
  );
}
