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
  Image,
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
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Video player setup
  const player = useVideoPlayer(require("../assets/video.mp4"), (player) => {
    player.loop = true;
    player.muted = true;
  });

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
  const scaleValue = useSharedValue(0.95);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered animations
    overlayOpacity.value = withTiming(1, { duration: 800 });

    fadeValue.value = withDelay(
      300,
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );

    scaleValue.value = withDelay(
      400,
      withSpring(1, {
        damping: 12,
        stiffness: 100,
      })
    );

    // Try to play video
    const timer = setTimeout(async () => {
      try {
        await player.play();
      } catch (error) {
        setVideoError(`Play error: ${error}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeValue.value,
      transform: [{ scale: scaleValue.value }],
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  const handleLogin = () => {
    console.log("Login pressed", { email, password });
  };

  const handleGoogleLogin = () => {
    console.log("Google login pressed");
  };

  const handleForgotPassword = () => {
    console.log("Forgot password pressed");
  };

  const handleSignup = () => {
    console.log("Signup pressed");
  };

  return (
    <View style={{ flex: 1}}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Video with fallback - Full screen coverage */}
      {!videoError ? (
        <VideoView
          style={{
            position: "absolute",
            top: -50, // Extend beyond top
            left: 0,
            right: 0,
            bottom: -50, // Extend beyond bottom
            width: width,
            height: height + 100, // Add extra height
          }}
          player={player}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          nativeControls={false}
          contentFit="cover"
        />
      ) : (
        <LinearGradient
          colors={["#4f46e5", "#7c3aed", "#8b5cf6", "#4f46e5"]}
          style={{
            position: "absolute",
            top: -50,
            left: 0,
            right: 0,
            bottom: -50,
            width: width,
            height: height + 100,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      {/* Gradient Overlay - Full screen coverage */}
      <Animated.View
        style={[
          overlayAnimatedStyle,
          {
            position: "absolute",
            top: -50,
            left: 0,
            right: 0,
            bottom: -50,
            width: width,
            height: height + 100,
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(79, 70, 229, 0.8)",
            "rgba(147, 51, 234, 0.8)",
            "rgba(79, 70, 229, 0.9)",
          ]}
          style={{ flex: 1 }}
        />
      </Animated.View>

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
            zIndex: 1000,
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              {
                flex: 1,
                justifyContent: "center",
                paddingHorizontal: 24,
              },
              containerAnimatedStyle,
            ]}
          >
            {/* Top spacing for status bar */}
            <View style={{ height: 64 }} />

            {/* Header */}
            <Animated.View
              entering={FadeIn.delay(600).duration(1000)}
              style={{
                alignItems: "center",
                marginBottom: 48,
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 36,
                  fontWeight: "700",
                  marginBottom: 4,
                }}
              >
                moodmesh
              </Text>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: 16,
                }}
              >
                Not just another review app
              </Text>
            </Animated.View>

            {/* Form Container */}
            <View style={{ gap: 20 }}>
              {/* Email Input */}
              <Animated.View
                entering={FadeIn.delay(800).duration(800)}
                style={{ gap: 8 }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: "500",
                    marginLeft: 4,
                  }}
                >
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    color: "#ffffff",
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    height: 56,
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Animated.View>

              {/* Password Input */}
              <Animated.View
                entering={FadeIn.delay(950).duration(800)}
                style={{ gap: 8 }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: "500",
                    marginLeft: 4,
                  }}
                >
                  Password
                </Text>
                <View style={{ position: "relative" }}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      paddingRight: 48,
                      color: "#ffffff",
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      height: 56,
                    }}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    style={{
                      position: "absolute",
                      right: 16,
                      top: 18,
                    }}
                  >
                    <Ionicons
                      name={isPasswordVisible ? "eye-off" : "eye"}
                      size={20}
                      color="rgba(255,255,255,0.7)"
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* Login Button */}
              <Animated.View entering={FadeIn.delay(1100).duration(800)}>
                <TouchableOpacity
                  onPress={handleLogin}
                  style={{
                    backgroundColor: "#2563eb",
                    borderRadius: 16,
                    paddingVertical: 16,
                    marginTop: 20,
                    height: 56,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 18,
                      fontWeight: "600",
                    }}
                  >
                    Login
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Forgot Password */}
              <Animated.View
                entering={FadeIn.delay(1250).duration(600)}
                style={{ alignItems: "center" }}
              >
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: 16,
                    }}
                  >
                    Forgot Password ?
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Divider */}
              <Animated.View
                entering={FadeIn.delay(1400).duration(600)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 20,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                  }}
                />
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.6)",
                    marginHorizontal: 16,
                    fontSize: 14,
                  }}
                >
                  or
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                  }}
                />
              </Animated.View>

              {/* Google Login Button */}
              <Animated.View entering={FadeIn.delay(1550).duration(800)}>
                <TouchableOpacity
                  onPress={handleGoogleLogin}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: 16,
                    paddingVertical: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    height: 56,
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-google" size={20} color="#4285F4" />
                  <Text
                    style={{
                      color: "#374151",
                      fontSize: 18,
                      fontWeight: "600",
                    }}
                  >
                    Continue with google
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Sign Up Link */}
              <Animated.View
                entering={FadeIn.delay(1700).duration(600)}
                style={{
                  alignItems: "center",
                  marginTop: 32,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: 16,
                    }}
                  >
                    Don't have an account ?{" "}
                  </Text>
                  <TouchableOpacity onPress={handleSignup}>
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: 16,
                        textDecorationLine: "underline",
                      }}
                    >
                      Signup
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>

            {/* Bottom Links */}
            <Animated.View
              entering={FadeIn.delay(1850).duration(600)}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 20,
                marginTop: 48,
                marginBottom: 32,
              }}
            >
              <TouchableOpacity>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: 14,
                  }}
                >
                  About us
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.4)",
                  fontSize: 14,
                }}
              >
                |
              </Text>
              <TouchableOpacity>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: 14,
                  }}
                >
                  Terms
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.4)",
                  fontSize: 14,
                }}
              >
                |
              </Text>
              <TouchableOpacity>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: 14,
                  }}
                >
                  Privacy policy
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;
