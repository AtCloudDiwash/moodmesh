import React, { useState, useEffect } from "react";
import { Text, ActivityIndicator, View } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { COLORS } from "@/app/styles/theme";
import mapStyle from "@/app/styles/mapThemeStyles.json";


export default function Explore() {
  const [location, setLocation] = useState({
    latitude: 27.7172,
    longitude: 85.324,
  });
  const [marker, setMarker] = useState({
    latitude: 27.7172,
    longitude: 85.324,
  });
  const [errMsg, setErrMsg] = useState("");

const nearbyLocations = [
  { name: "Kathmandu Durbar Square", latitude: 27.7046, longitude: 85.3076 },
  { name: "Patan Durbar Square", latitude: 27.6731, longitude: 85.325 },
  { name: "Boudhanath Stupa", latitude: 27.7215, longitude: 85.3616 },
  { name: "Swayambhunath Stupa", latitude: 27.7149, longitude: 85.2901 },
  { name: "Kirtipur", latitude: 27.6674, longitude: 85.2799 },
  { name: "Thamel", latitude: 27.7154, longitude: 85.3114 },
  { name: "Balkhu", latitude: 27.6888, longitude: 85.3203 },
  { name: "Garden of Dreams", latitude: 27.7124, longitude: 85.3167 },
  { name: "Tribhuvan University", latitude: 27.6675, longitude: 85.2775 },
  { name: "Pashupatinath Temple", latitude: 27.7104, longitude: 85.3489 },
  { name: "Bhaktapur Durbar Square", latitude: 27.671, longitude: 85.4298 },
  { name: "Nagarkot Viewpoint", latitude: 27.7153, longitude: 85.525 },
  {
    name: "Tribhuvan International Airport",
    latitude: 27.6995,
    longitude: 85.3591,
  },
  { name: "Chandragiri Hills", latitude: 27.6606, longitude: 85.2643 },
  { name: "Jawalakhel", latitude: 27.6727, longitude: 85.317 },
];
  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrMsg("Permission denied, using fallback location.");
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync();
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        setErrMsg("Error getting location, using fallback");
      }
    })();
  }, []);

  if (!location) {
    return <ActivityIndicator size="large" />;
  }

  const camera = {
    center: {
      latitude: location.latitude,
      longitude: location.longitude,
    },
    zoom: 15,
    pitch: 0,
    heading: 0,
    altitude: 1,
  };

  return (
    <View style={{ flex: 1 }}>
      {errMsg ? <Text>{errMsg}</Text> : null}

      <MapView
        style={{ flex: 1 }}
        initialCamera={camera}
        showsUserLocation={true}
        followsUserLocation={true}
        onPress={handleMapPress} // Handle map press to set marker
        customMapStyle={mapStyle}
      >
        {nearbyLocations.map((location, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={location.name}
            pinColor={COLORS.secondary}
          >
  
          </Marker>
        ))}
      </MapView>
    </View>
  );
}
