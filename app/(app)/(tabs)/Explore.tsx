import React, { useState, useEffect } from "react";
import { Text, ActivityIndicator, View } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
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

  const {postedLocations, postedMoods} = useAllLocations()



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

  if(postedLocations.length <=0){
    return <ActivityIndicator size="large" />;
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
    <SafeAreaView style={{ flex: 1 }}>
      {errMsg ? <Text>{errMsg}</Text> : null}

      <MapView
        style={{ flex: 1 }}
        initialCamera={camera}
        showsUserLocation={true}
        followsUserLocation={true}
        customMapStyle={mapStyle}
      >
        {postedLocations.length > 0 &&(postedLocations.map((location, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude:parseFloat(location[0]),
              longitude: parseFloat(location[1]),
            }}
            title={location[0]}
            pinColor={COLORS.secondary}
          >
  
          </Marker>
        )))}
      </MapView>
    </SafeAreaView>
  );
}
