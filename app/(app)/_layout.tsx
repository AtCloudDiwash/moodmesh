import { Redirect, Slot } from "expo-router";
import { useAuth } from "@/context/authContext";

export default function AppLayout(){
    const {session} = useAuth()

    return (!session? <Redirect href = "/(auth)/Login"/>: <Slot/>)
}