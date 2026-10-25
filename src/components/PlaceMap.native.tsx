import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Constants from 'expo-constants';
import { MapProps } from './mapTypes';
import { MapPreview } from './MapPreview';
import { moodStyle } from '../theme';

export default function PlaceMap(props: MapProps) {
  const { posts, selectedId, onSelect, center, picked, onPick } = props;
  const ref = useRef<MapView>(null);
  const focus = picked ?? center ?? posts.find((post) => post.id === selectedId)?.location;
  useEffect(() => {
    if (focus)
      ref.current?.animateToRegion({ ...focus, latitudeDelta: 0.035, longitudeDelta: 0.035 }, 500);
  }, [focus?.latitude, focus?.longitude]); // eslint-disable-line react-hooks/exhaustive-deps
  if (Platform.OS === 'android' && !Constants.expoConfig?.extra?.androidMapsConfigured)
    return <MapPreview {...props} />;
  const initial = center ??
    posts.find((post) => post.location)?.location ?? { latitude: 37.7694, longitude: -122.446 };
  return (
    <MapView
      ref={ref}
      style={StyleSheet.absoluteFill}
      initialRegion={{ ...initial, latitudeDelta: 0.07, longitudeDelta: 0.07 }}
      showsUserLocation={!!center}
      showsMyLocationButton={false}
      onPress={(event) => onPick?.(event.nativeEvent.coordinate)}
    >
      {posts
        .filter((post) => post.location)
        .map((post) => (
          <Marker
            key={post.id}
            coordinate={post.location!}
            title={post.title}
            description={post.moods.join(' · ')}
            pinColor={
              selectedId === post.id ? '#1464FF' : moodStyle(post.moods[0] ?? 'Chill').color
            }
            onPress={() => onSelect?.(post.id)}
          />
        ))}
      {picked && <Marker coordinate={picked} pinColor="#1464FF" title="Your selected place" />}
    </MapView>
  );
}
