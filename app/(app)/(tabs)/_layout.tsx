import {Tabs} from "expo-router"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { COLORS } from "@/app/styles/theme";

export default function TabsLayout(){
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.iconColor,
          tabBarStyle: {
            height: 70,
          },
        }}
      >
        <Tabs.Screen
          name="Feed"
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Explore"
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="compass" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Add"
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="plus-circle" size={30} color={color} style={{top: -5}}/>
            ),
          }}
        />
        <Tabs.Screen
          name="Leagues"
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="trophy" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    );
}