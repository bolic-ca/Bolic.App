import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { goHome, useAuthPalette } from '@/components/auth/shared';

type Mode = 'sign-in' | 'sign-up';

export default function AuthScreen() {
  const palette = useAuthPalette();
  const { isSignedIn } = useAuth();
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<Mode>(modeParam === 'sign-up' ? 'sign-up' : 'sign-in');

  // Already authenticated (e.g. session restored) — leave. Navigation must run
  // in an effect, not during render.
  useEffect(() => {
    if (isSignedIn) goHome();
  }, [isSignedIn]);

  if (isSignedIn) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.close} onPress={goHome} hitSlop={12}>
            <Ionicons name="close" size={26} color={palette.textMuted} />
          </TouchableOpacity>

          {mode === 'sign-in' ? (
            <SignInForm onSwitchToSignUp={() => setMode('sign-up')} />
          ) : (
            <SignUpForm onSwitchToSignIn={() => setMode('sign-in')} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  close: { alignSelf: 'flex-end', padding: 4 },
});
