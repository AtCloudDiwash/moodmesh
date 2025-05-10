import { Ionicons } from '@expo/vector-icons';
import { Button, Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAllLocations from '../features/getAllLocation';
import { View, Text, TouchableOpacity, Button } from "react-native";
import React from "react";
import { useAuth } from "@/context/authContext";
import { SafeAreaView } from "react-native-safe-area-context";


const Profile = () => {
  const { signout, user } = useAuth();
  const { postedLocations, postedMoods } = useAllLocations();

  const handleLogout = () => {
    signout();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Your Profile</Text>

        <View style={styles.userInfo}>
          <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>{user?.name || 'Guest'}</Text>
            <Text style={styles.likes}>
              Total Likes: {postedMoods.length * 50 || 0}{' '}
              <Text style={styles.meshPoints}>Mesh points: {postedLocations.length * 10 || 0}</Text>
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your Milestones</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.milestoneContainer}>
          <View style={styles.milestoneCard}>
            <Image source={require('../../../assets/images/react-logo.png')} style={styles.milestoneImage} />
            <Text style={styles.milestoneTitle}>First Post</Text>
            <Text style={styles.milestoneSubtitle}>Unlocked</Text>
          </View>
          <View style={styles.milestoneCard}>
            <Image source={require('../../../assets/images/react-logo.png')} style={styles.milestoneImage} />
            <Text style={styles.milestoneTitle}>Vibe Star</Text>
            <Text style={styles.milestoneSubtitle}>Got 100 VibeBoosts</Text>
          </View>
          <View style={styles.milestoneCard}>
            <Image source={require('../../../assets/images/react-logo.png')} style={styles.milestoneImage} />
            <Text style={styles.milestoneTitle}>Trail Blazer</Text>
            <Text style={styles.milestoneSubtitle}>Created {postedLocations.length} venue cards</Text>
          </View>
        </ScrollView>

        <Text style={styles.sectionTitle}>Your Posts</Text>
        <View style={styles.filters}>
          <Text style={[styles.filterText, styles.activeFilter]}>Most Liked</Text>
          <Text style={styles.filterText}>Only Leagues</Text>
          <Text style={styles.filterText}>Won</Text>
        </View>

        <View style={styles.postGrid}>
          {postedMoods?.map((mood, idx) => (
            <View key={idx} style={styles.postCard}>
              <Image
                source={{ uri: mood.imageUrl || 'https://placekitten.com/200/200' }}
                style={styles.postImage}
              />
              <Text style={styles.postTitle}>{mood.title || 'Mood Title'}</Text>
              <Text style={styles.postDetails}>{mood.likes || 50} Likes | 50 mesh points</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.favoriteButton}>
          <Text style={styles.favoriteText}>Go to favorites</Text>
        </TouchableOpacity>

        <View style={styles.walletSection}>
          <Ionicons name="wallet" size={24} color="#0066FF" />
          <Text style={styles.connectText}>Connect to Phantom</Text>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Button title={`Wanna log out ${user?.name || ''}`} onPress={handleLogout} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  username: { fontSize: 18, fontWeight: '600' },
  likes: { fontSize: 14, color: '#888' },
  meshPoints: { color: '#FF6C00' },

  sectionTitle: { fontSize: 18, fontWeight: '600', marginVertical: 10 },
  milestoneContainer: { flexDirection: 'row', marginBottom: 20 },
  milestoneCard: { width: 120, marginRight: 12 },
  milestoneImage: { width: 120, height: 80, borderRadius: 10 },
  milestoneTitle: { fontWeight: 'bold', marginTop: 6 },
  milestoneSubtitle: { fontSize: 12, color: '#666' },

  filters: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  filterText: { marginRight: 10, color: '#666' },
  activeFilter: { color: '#000', fontWeight: '600' },

  postGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  postCard: { width: '48%', marginBottom: 16 },
  postImage: { width: '100%', height: 100, borderRadius: 10 },
  postTitle: { fontWeight: '600', marginTop: 6 },
  postDetails: { fontSize: 12, color: '#888' },

  favoriteButton: {
    backgroundColor: '#4460F1',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  favoriteText: { color: '#fff', fontWeight: '600' },

  walletSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 30,
  },
  connectText: { fontSize: 16, color: '#0066FF' },
});


export default Profile;
