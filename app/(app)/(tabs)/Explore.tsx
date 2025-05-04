import React, { useState, useEffect } from "react";
import * as Location from "expo-location";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function Explore() {
  const [location, setLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null); // Start with null to ensure proper rendering
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState("");
  const [defaultMarker, setDefaultMarker] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access location was denied");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);

    setInitialRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    setDefaultMarker({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Log values after the state has been set (second render)
  useEffect(() => {
    console.log("Initial Region:", initialRegion);
    console.log("Default Marker:", defaultMarker);
  }, [initialRegion, defaultMarker]);

  const handleMapPress = async (e) => {
    const coords = e.nativeEvent.coordinate;
    setMarker(coords);
    console.log("I touched",marker)
    // Reverse Geocoding with Nominatim
    try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1`,
              {
                headers: {
                  "User-Agent":
                    "com.anonymous.MoodMesh/1.0 (mailto:kuskusmiyaspace321@gmail.com)", 
                },
              }
            );
      const data = await response.json();
      setAddress(data.display_name);
    } catch (err) {
      console.error("Reverse geocoding failed", err);
    }
  };


  if (!initialRegion) {
    return <Text>Loading map...</Text>;
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion} onLongPress={handleMapPress}>
        <Marker
          coordinate={defaultMarker}
          title="My Marker"
          description="This is a marker example"
        />

        {marker && (
          <Marker
            coordinate={marker}
            title={address}
            description="This is where you tapped!"
          />
        )}
      </MapView>

      <Text style={styles.address} >{address || "Tap map to set location"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  address: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "white",
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 8,
    fontSize: 14,
  },
});
