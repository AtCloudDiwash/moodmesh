import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { backendReady } from '../config';
import { useAuth } from '../context/AuthContext';
import { signUp } from '../lib/api';
import { Button, ErrorNotice, Field, Icon, Screen } from './ui';
import { colors } from '../theme';

export function AuthScreen({ signup = false }: { signup?: boolean }) {
  const { user, login, error: sessionError, retry } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState(''), [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false), [created, setCreated] = useState(false);
  const lock = useRef(false);
  if (user) return <Redirect href="/(app)/(tabs)/Explore" />;
  const submit = async () => {
    if (lock.current || !backendReady) return;
    if (signup && (name.trim().length < 2 || name.trim().length > 60)) return setError('Use a display name between 2 and 60 characters.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid email address.');
    if (password.length < 8 || password.length > 256) return setError('Use a password between 8 and 256 characters.');
    if (signup && confirm !== password) return setError('Your passwords do not match.');
    lock.current = true; setBusy(true); setError(null);
    try {
      if (signup) { await signUp(name, email, password); setCreated(true); setPassword(''); setConfirm(''); }
      else await login(email, password);
    } catch { setError(signup ? 'Could not create the account. Check your connection, or sign in if you already have an account.' : 'Could not sign in. Check your email, password, and connection.'); }
    finally { lock.current = false; setBusy(false); }
  };
  return <Screen><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
    <View style={styles.logo}><Icon name="navigate" color={colors.white} size={34} /></View>
    <Text style={styles.brand}>MoodMesh</Text><Text style={styles.tagline}>Good places. Real feelings.</Text>
    <View style={styles.card}><Text style={styles.title}>{created ? 'You’re on the map.' : signup ? 'Find your kind of place.' : 'Welcome back.'}</Text>
      <Text style={styles.description}>{created ? 'Your account is ready. Sign in to start exploring.' : 'Discover little corners of the world that feel like you.'}</Text>
      {!backendReady && <ErrorNotice message="Connection setup is incomplete. Complete the local configuration to sign in, or enable preview mode to explore sample places." />}
      <ErrorNotice message={sessionError} retry={retry} />
      {created ? <Button title="Continue to sign in" onPress={() => router.replace('/(auth)/Login')} /> : <>
        {signup && <Field label="Your name" value={name} onChangeText={setName} maxLength={60} autoComplete="name" editable={!busy} />}
        <Field label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" maxLength={254} editable={!busy} />
        <Field label="Password" placeholder="At least 8 characters" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete={signup ? 'new-password' : 'current-password'} maxLength={256} editable={!busy} />
        {signup && <Field label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" maxLength={256} editable={!busy} />}
        <ErrorNotice message={error} /><Button title={signup ? 'Create account' : 'Let’s explore'} busy={busy} disabled={!backendReady} onPress={() => void submit()} />
        <Button secondary title={signup ? 'Already a member? Sign in' : 'New here? Create an account'} disabled={busy} onPress={() => router.replace(signup ? '/(auth)/Login' : '/(auth)/Signup')} />
      </>}
    </View><Text style={styles.footer}>Map your mood. Find your people.</Text>
  </ScrollView></KeyboardAvoidingView></Screen>;
}
const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 48, gap: 12, flexGrow: 1, justifyContent: 'center' },
  logo: { alignSelf: 'center', backgroundColor: colors.blue, width: 70, height: 70, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 34, letterSpacing: -1.5, color: colors.blue, fontWeight: '800', textAlign: 'center' },
  tagline: { fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: 18 },
  card: { gap: 16, backgroundColor: colors.white, padding: 22, borderRadius: 26, borderWidth: 1, borderColor: colors.line },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, letterSpacing: -0.6 }, description: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 11, marginVertical: 18 },
});
