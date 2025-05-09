import { View, Text, TouchableOpacity, Button } from "react-native";
import React from "react";
import { useAuth } from "@/context/authContext";
import { SafeAreaView } from "react-native-safe-area-context";
import useAllLocations from "../features/getAllLocation";

const Profile = () => {
  const { signout, user } = useAuth();
  const { postedLocations, postedMoods } = useAllLocations();

  console.log("moods", postedMoods);
  const handleSubmit = () => {
    signout();
  };
  return (
    <SafeAreaView>
      <Text>Profile {user.name}</Text>
      {/* {postedLocations.length > 0 && (
        postedLocations.map((item, index)=>(
          <Text key={index}>{`${item[0]} ${item[1]}`}</Text>
        ):{console.log(postedLocations)})
      )} */}
      <TouchableOpacity onPress={handleSubmit}>
        <Button title={`Wanna log out ${user.name}`} onPress={handleSubmit} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Profile;
