import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/app/styles/theme";
import mapStyle from "@/app/styles/mapThemeStyles.json";
import { SafeAreaView } from "react-native-safe-area-context";
import useAllLocations from "../features/getAllLocation";

export default function Explore() {
  const [location, setLocation] = useState({
    latitude: 27.7172,
    longitude: 85.324,
  });
  const [errMsg, setErrMsg] = useState("");
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const mapRef = useRef<MapView | null>(null); // Ref to the MapView

  const { postedLocations, postedMoods, allCreators, loading, error } =
    useAllLocations(refreshKey);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrMsg("Permission denied, using fallback location.");
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync();
        const { latitude, longitude } = currentLocation.coords;

        setLocation({ latitude, longitude });

        // Animate map camera to user's location
        mapRef.current?.animateCamera({
          center: { latitude, longitude },
          zoom: 15,
          pitch: 45,
          heading: 0,
          altitude: 500,
        });
      } catch (error) {
        setErrMsg("Error getting location, using fallback");
      }
    })();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey(Date.now());
  }, []);

  if (!location || (loading && postedLocations.length === 0)) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const camera = {
    center: {
      latitude: location.latitude,
      longitude: location.longitude,
    },
    zoom: 13,
    pitch: 45,
    heading: 0,
    altitude: 5000,
  };

  return (
    <SafeAreaView style={styles.container}>
      {errMsg ? <Text style={styles.errorText}>{errMsg}</Text> : null}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialCamera={camera}
        showsUserLocation={true}
        followsUserLocation={true}
        customMapStyle={mapStyle}
      >
        {postedLocations.length > 0 &&
          postedLocations.map((location, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: parseFloat(location[0]),
                longitude: parseFloat(location[1]),
              }}
              pinColor={COLORS.secondary}
                title={
                  Platform.OS === "android"
                    ? `Mood: ${
                        postedMoods[index]?.join(", ") || "N/A"
                      }`
                    : undefined
                }
              >
              {Platform.OS === "ios" && (
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutText}>
                      Mood: {postedMoods[index]?.join(", ") || "N/A"}
                    </Text>
                    <Text style={styles.calloutText}>
                      Creator: {allCreators[index] || "Unknown"}
                    </Text>
                  </View>
                </Callout>
              )}
            </Marker>
          ))}
      </MapView>
      <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
        <Ionicons name="refresh" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
  refreshButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  callout: {
    width: 150,
    padding: 8,
  },
  calloutText: {
    fontSize: 14,
  },
});
