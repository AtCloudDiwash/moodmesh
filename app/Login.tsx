import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

 
  const player = useVideoPlayer(
    require("../assets/video.mp4"),
    
    (player) => {
      player.loop = true;
      player.muted = true;
    }
  );

  // Listen to video events
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // Listen for video errors
  useEvent(player, "statusChange", (status, oldStatus, error) => {
    if (error) {
      console.error("Video error:", error);
      setVideoError(error.message);
    }
  });

  // Animation values
  const fadeValue = useSharedValue(0);
  const slideValue = useSharedValue(50);
  const scaleValue = useSharedValue(0.8);

  useEffect(() => {
    // Trigger animations on mount
    fadeValue.value = withTiming(1, { duration: 1000 });
    slideValue.value = withSpring(0, { damping: 10 });
    scaleValue.value = withSpring(1, { damping: 8 });


    // Try to play video after a delay with error handling
    const timer = setTimeout(async () => {
      try {
        await player.play();
      } catch (error) {
        setVideoError(`Play error: ${error}`);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeValue.value,
      transform: [
        { translateY: slideValue.value },
        { scale: scaleValue.value },
      ],
    };
  });

  const handleLogin = () => {
    // Add login logic here
    console.log("Login pressed", { email, password });
  };

  const handleGoogleLogin = () => {
    // Add Google login logic here
    console.log("Google login pressed");
  };

  const handleForgotPassword = () => {
    // Add forgot password logic here
    console.log("Forgot password pressed");
  };

  const handleSignup = () => {
    // Add signup navigation logic here
    console.log("Signup pressed");
  };

  return (
    <View className="flex-1">
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Video with fallback */}
      {!videoError ? (
        <VideoView
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            width: width,
            height: height,
          }}
          player={player}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          nativeControls={false}
          contentFit="cover"
        />
      ) : (
        // Fallback animated gradient background
        <LinearGradient
          colors={["#4f46e5", "#7c3aed", "#8b5cf6", "#4f46e5"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      {/* Debug Info - Remove in production */}
      {__DEV__ && videoError && (
        <View
          style={{
            position: "absolute",
            top: 100,
            left: 20,
            right: 20,
            backgroundColor: "red",
            padding: 10,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "white", fontSize: 12 }}>
            Video Error: {videoError}
          </Text>
          <TouchableOpacity
            onPress={async () => {
              try {
                await player.play();
                setVideoError(null);
              } catch (error) {
                console.error("Retry failed:", error);
              }
            }}
            style={{
              backgroundColor: "white",
              padding: 5,
              marginTop: 5,
              borderRadius: 3,
            }}
          >
            <Text style={{ color: "red", fontSize: 10 }}>Retry Video</Text>
          </TouchableOpacity>
        </View>
      )}


      {/* Gradient Overlay */}
      <LinearGradient
        colors={[
          "rgba(79, 70, 229, 0.8)",
          "rgba(147, 51, 234, 0.8)",
          "rgba(79, 70, 229, 0.9)",
        ]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            className="flex-1 justify-center px-6"
            style={containerAnimatedStyle}
          >
            {/* Top spacing for status bar */}
            <View className="h-16" />

            {/* Header */}
            <Animated.View
              entering={FadeIn.delay(300).duration(800)}
              className="items-center mb-12"
            >
              <Text className="text-white text-4xl font-bold mb-2">
                moodmesh
              </Text>
              <Text className="text-white/80 text-base">
                Not just another review app
              </Text>
            </Animated.View>

            {/* Form Container */}
            <Animated.View
              entering={SlideInUp.delay(500).duration(800)}
              className="space-y-6"
            >
              {/* Email Input */}
              <View className="space-y-2">
                <Text className="text-white text-sm font-medium ml-1">
                  Email
                </Text>
                <View className="relative">
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-4 text-white text-base border border-white/30"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="space-y-2">
                <Text className="text-white text-sm font-medium ml-1">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-4 pr-12 text-white text-base border border-white/30"
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute right-4 top-4"
                  >
                    <Ionicons
                      name={isPasswordVisible ? "eye-off" : "eye"}
                      size={20}
                      color="rgba(255,255,255,0.7)"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <Animated.View entering={FadeIn.delay(800).duration(600)}>
                <TouchableOpacity
                  onPress={handleLogin}
                  className="bg-blue-600 rounded-xl py-4 mt-6 shadow-lg"
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-center text-lg font-semibold">
                    Login
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Forgot Password */}
              <Animated.View
                entering={FadeIn.delay(1000).duration(600)}
                className="items-center"
              >
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text className="text-white/80 text-base">
                    Forgot Password ?
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Divider */}
              <Animated.View
                entering={FadeIn.delay(1200).duration(600)}
                className="flex-row items-center my-6"
              >
                <View className="flex-1 h-px bg-white/30" />
                <Text className="text-white/60 mx-4 text-sm">or</Text>
                <View className="flex-1 h-px bg-white/30" />
              </Animated.View>

              {/* Google Login Button */}
              <Animated.View entering={FadeIn.delay(1400).duration(600)}>
                <TouchableOpacity
                  onPress={handleGoogleLogin}
                  className="bg-white/90 rounded-xl py-4 flex-row items-center justify-center space-x-3 shadow-lg"
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-google" size={20} color="#4285F4" />
                  <Text className="text-gray-700 text-lg font-medium">
                    Continue with google
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Sign Up Link */}
              <Animated.View
                entering={FadeIn.delay(1600).duration(600)}
                className="items-center mt-8"
              >
                <View className="flex-row items-center">
                  <Text className="text-white/80 text-base">
                    Dont' have an account ?
                  </Text>
                  <TouchableOpacity onPress={handleSignup} className="ml-1">
                    <Text className="text-white text-base underline">
                      Signup
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </Animated.View>

            {/* Bottom Links */}
            <Animated.View
              entering={FadeIn.delay(1800).duration(600)}
              className="flex-row justify-center space-x-6 mt-12 mb-8"
            >
              <TouchableOpacity>
                <Text className="text-white/60 text-sm">About us</Text>
              </TouchableOpacity>
              <Text className="text-white/40 text-sm">|</Text>
              <TouchableOpacity>
                <Text className="text-white/60 text-sm">Terms</Text>
              </TouchableOpacity>
              <Text className="text-white/40 text-sm">|</Text>
              <TouchableOpacity>
                <Text className="text-white/60 text-sm">Privacy policy</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;
