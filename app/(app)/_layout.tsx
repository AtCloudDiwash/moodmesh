import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { DataProvider } from '@/src/context/DataContext';
export default function AppLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/(auth)/Login" />;
  return <DataProvider key={user.id}><Stack screenOptions={{ headerShown: false }} /></DataProvider>;
}
