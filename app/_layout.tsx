import { Slot } from "expo-router";
import { AuthProvider } from "@/context/authContext";
import { StatusBar } from "react-native";
import { Alert, BackHandler } from "react-native";
import { useEffect } from "react";

export default function RootLayout() {
    useEffect(() => {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          Alert.alert("Exit App", "Are you sure you want to exit?", [
            { text: "Cancel", onPress: () => null, style: "cancel" },
            { text: "Yes", onPress: () => BackHandler.exitApp() },
          ]);
          return true; // Prevent default back press behavior
        }
      );

      return () => backHandler.remove(); // Cleanup on component unmount
    }, []);

  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content"></StatusBar>
      <Slot />
    </AuthProvider>
  );
}
