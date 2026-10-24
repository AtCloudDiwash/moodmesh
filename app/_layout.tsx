import React from 'react';
import { StatusBar, View } from 'react-native';
import { Slot, type ErrorBoundaryProps } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { Button, Message, Screen } from '@/src/components/ui';
import { colors } from '@/src/theme';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <SafeAreaProvider><Screen><Message title="Let’s try that again" detail="This screen could not open. Your published places are safe." /><Button title="Reload screen" onPress={retry} /></Screen></SafeAreaProvider>;
}
function Routes() { const { loading } = useAuth(); return loading ? <Screen><Message title="Finding your place…" loading /></Screen> : <Slot />; }
export default function RootLayout() {
  return <SafeAreaProvider><View style={{ flex: 1, backgroundColor: '#ECEDE9' }}><View style={{ flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', backgroundColor: colors.paper }}><AuthProvider><StatusBar barStyle="dark-content" backgroundColor={colors.paper} /><Routes /></AuthProvider></View></View></SafeAreaProvider>;
}
