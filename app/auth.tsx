import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSignIn, useSignUp, useAuth } from '@clerk/expo';

type Step = 'credentials' | 'verify';

export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { isSignedIn } = useAuth();
  const { signIn, errors: signInErrors, fetchStatus: signInStatus } = useSignIn();
  const { signUp, errors: signUpErrors, fetchStatus: signUpStatus } = useSignUp();

  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const busy = signInStatus === 'fetching' || signUpStatus === 'fetching';

  const palette = {
    bg: isDark ? '#0A0A0B' : '#FAFAF9',
    cardBg: isDark ? '#141416' : '#FFFFFF',
    cardBorder: isDark ? '#2A2A2E' : '#E8E8E6',
    text: isDark ? '#FAFAFA' : '#0A0A0B',
    textMuted: '#71717A',
    accent: '#0a7ea4',
    danger: '#EF4444',
    inputBg: isDark ? '#1C1C1F' : '#F4F4F3',
  };

  const goHome = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const fieldError =
    signInErrors.fields.identifier?.longMessage ??
    signInErrors.fields.password?.longMessage ??
    signInErrors.fields.code?.longMessage ??
    signUpErrors.fields.emailAddress?.longMessage ??
    signUpErrors.fields.password?.longMessage ??
    signUpErrors.fields.code?.longMessage ??
    null;

  const displayError = formError ?? fieldError;

  const handleContinue = async () => {
    setFormError(null);
    const emailAddress = email.trim();
    if (!emailAddress || !password) {
      setFormError('Enter your email and password to continue.');
      return;
    }

    const { error: signInError } = await signIn.password({ emailAddress, password });

    if (!signInError) {
      if (signIn.status === 'complete') {
        await signIn.finalize();
        goHome();
      } else {
        setFormError('Additional verification is required to finish signing in.');
      }
      return;
    }

    if (signInError.code === 'form_identifier_not_found') {
      const { error: signUpError } = await signUp.password({ emailAddress, password });
      if (signUpError) {
        setFormError(signUpError.longMessage ?? signUpError.message);
        return;
      }

      if (signUp.unverifiedFields?.includes('email_address')) {
        const { error: sendError } = await signUp.verifications.sendEmailCode();
        if (sendError) {
          setFormError(sendError.longMessage ?? sendError.message);
          return;
        }
        setStep('verify');
      } else if (signUp.status === 'complete') {
        await signUp.finalize();
        goHome();
      }
      return;
    }

    setFormError(signInError.longMessage ?? signInError.message);
  };

  const handleVerify = async () => {
    setFormError(null);
    if (!code.trim()) {
      setFormError('Enter the code we emailed you.');
      return;
    }

    const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() });
    if (error) {
      setFormError(error.longMessage ?? error.message);
      return;
    }

    if (signUp.status === 'complete') {
      await signUp.finalize();
      goHome();
    }
  };

  const handleResend = async () => {
    setFormError(null);
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) setFormError(error.longMessage ?? error.message);
  };

  const restart = () => {
    setStep('credentials');
    setCode('');
    setFormError(null);
    void signUp.reset();
    void signIn.reset();
  };

  if (isSignedIn) {
    // Already authenticated (e.g. session restored) — nothing to do here.
    goHome();
    return null;
  }

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

          <View style={styles.header}>
            <View style={[styles.logo, { backgroundColor: palette.accent }]}>
              <Ionicons name="barbell" size={28} color="#FFF" />
            </View>
            <Text style={[styles.title, { color: palette.text }]}>
              {step === 'verify' ? 'Check your email' : 'Welcome to Bolic'}
            </Text>
            <Text style={[styles.subtitle, { color: palette.textMuted }]}>
              {step === 'verify'
                ? `We sent a verification code to ${email.trim()}.`
                : 'Sign in or create an account to sync your training.'}
            </Text>
          </View>

          {step === 'credentials' ? (
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: palette.textMuted }]}>Email</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: palette.inputBg, color: palette.text, borderColor: palette.cardBorder }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={palette.textMuted}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!busy}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: palette.textMuted }]}>Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: palette.inputBg, color: palette.text, borderColor: palette.cardBorder }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Your password"
                  placeholderTextColor={palette.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="password"
                  editable={!busy}
                  onSubmitEditing={handleContinue}
                />
              </View>

              {displayError && <Text style={[styles.error, { color: palette.danger }]}>{displayError}</Text>}

              {/* Clerk bot protection mount point (required for sign-up) */}
              <View nativeID="clerk-captcha" />

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: palette.accent }, busy && styles.buttonDisabled]}
                onPress={handleContinue}
                disabled={busy}
                activeOpacity={0.85}
              >
                {busy ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Continue</Text>
                )}
              </TouchableOpacity>

              <Text style={[styles.hint, { color: palette.textMuted }]}>
                New here? Entering your details creates an account automatically.
              </Text>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: palette.textMuted }]}>Verification code</Text>
                <TextInput
                  style={[styles.input, styles.codeInput, { backgroundColor: palette.inputBg, color: palette.text, borderColor: palette.cardBorder }]}
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  placeholderTextColor={palette.textMuted}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  editable={!busy}
                  onSubmitEditing={handleVerify}
                />
              </View>

              {displayError && <Text style={[styles.error, { color: palette.danger }]}>{displayError}</Text>}

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: palette.accent }, busy && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={busy}
                activeOpacity={0.85}
              >
                {busy ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify & continue</Text>
                )}
              </TouchableOpacity>

              <View style={styles.verifyActions}>
                <TouchableOpacity onPress={handleResend} disabled={busy} hitSlop={8}>
                  <Text style={[styles.linkText, { color: palette.accent }]}>Resend code</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={restart} disabled={busy} hitSlop={8}>
                  <Text style={[styles.linkText, { color: palette.textMuted }]}>Use a different email</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  header: { alignItems: 'center', marginTop: 12, marginBottom: 32 },
  logo: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, fontWeight: '500', textAlign: 'center', lineHeight: 21, paddingHorizontal: 12 },
  form: { gap: 16 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  input: { height: 52, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
  codeInput: { textAlign: 'center', letterSpacing: 8, fontSize: 22, fontWeight: '700' },
  error: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  primaryButton: { height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  primaryButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  buttonDisabled: { opacity: 0.6 },
  hint: { fontSize: 13, fontWeight: '500', textAlign: 'center', lineHeight: 19 },
  verifyActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  linkText: { fontSize: 15, fontWeight: '600' },
});
