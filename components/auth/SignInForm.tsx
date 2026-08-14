import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSignIn } from '@clerk/expo';
import { AuthHeader, authStyles, goHome, useAuthPalette } from './shared';

export function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const palette = useAuthPalette();
  const { signIn, errors, fetchStatus } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const busy = fetchStatus === 'fetching';

  const fieldError =
    errors.fields.identifier?.longMessage ??
    errors.fields.password?.longMessage ??
    null;

  const displayError = formError ?? fieldError;

  const handleSignIn = async () => {
    setFormError(null);
    const emailAddress = email.trim();
    if (!emailAddress || !password) {
      setFormError('Enter your email and password to sign in.');
      return;
    }

    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      if (error.code === 'form_identifier_not_found') {
        setFormError('No account found for that email. Create an account instead.');
      } else {
        setFormError(error.longMessage ?? error.message);
      }
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize();
      goHome();
    } else {
      setFormError('Additional verification is required to finish signing in.');
    }
  };

  return (
    <>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to sync your training."
        palette={palette}
      />

      <View style={authStyles.form}>
        <View style={authStyles.field}>
          <Text style={[authStyles.label, { color: palette.textMuted }]}>Email</Text>
          <TextInput
            style={[authStyles.input, { backgroundColor: palette.inputBg, color: palette.text, borderColor: palette.cardBorder }]}
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

        <View style={authStyles.field}>
          <Text style={[authStyles.label, { color: palette.textMuted }]}>Password</Text>
          <TextInput
            style={[authStyles.input, { backgroundColor: palette.inputBg, color: palette.text, borderColor: palette.cardBorder }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            placeholderTextColor={palette.textMuted}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            editable={!busy}
            onSubmitEditing={handleSignIn}
          />
        </View>

        {displayError && <Text style={[authStyles.error, { color: palette.danger }]}>{displayError}</Text>}

        <TouchableOpacity
          style={[authStyles.primaryButton, { backgroundColor: palette.accent }, busy && authStyles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={busy}
          activeOpacity={0.85}
        >
          {busy ? (
            <ActivityIndicator color={palette.accentText} />
          ) : (
            <Text style={[authStyles.primaryButtonText, { color: palette.accentText }]}>Sign in</Text>
          )}
        </TouchableOpacity>

        <View style={authStyles.verifyActions}>
          <Text style={[authStyles.hint, { color: palette.textMuted }]}>New here?</Text>
          <TouchableOpacity onPress={onSwitchToSignUp} disabled={busy} hitSlop={8}>
            <Text style={[authStyles.linkText, { color: palette.accent }]}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
