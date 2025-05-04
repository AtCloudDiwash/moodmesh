import { View, Text, TouchableOpacity, Button } from 'react-native'
import React from 'react'
import { useAuth } from '@/context/authContext'

const Profile = () => {

  const {signout, user} = useAuth()

  const handleSubmit = ()=>{
    signout()
  }
  return (
    <View>
      <Text>
        Profile {user.name}
      </Text>

      <TouchableOpacity onPress={handleSubmit}>
        <Button title={`Wanna log out ${user.name}`} onPress={handleSubmit} />
      </TouchableOpacity>
    </View>
  );
}

export default Profile