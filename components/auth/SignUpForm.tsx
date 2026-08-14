import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSignUp } from '@clerk/expo';
import { AuthHeader, authStyles, goHome, useAuthPalette } from './shared';

type Step = 'credentials' | 'verify';

export function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const palette = useAuthPalette();
  const { signUp, errors, fetchStatus } = useSignUp();

  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const busy = fetchStatus === 'fetching';

  const fieldError =
    errors.fields.emailAddress?.longMessage ??
    errors.fields.password?.longMessage ??
    errors.fields.code?.longMessage ??
    null;

  const displayError = formError ?? fieldError;

  const handleSignUp = async () => {
    setFormError(null);
    const emailAddress = email.trim();
    if (!emailAddress || !password) {
      setFormError('Enter your email and password to create an account.');
      return;
    }

    const { error } = await signUp.password({ emailAddress, password });
    if (error) {
      setFormError(error.longMessage ?? error.message);
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
  };

  if (step === 'verify') {
    return (
      <>
        <AuthHeader
          title="Check your email"
          subtitle={`We sent a verification code to ${email.trim()}.`}
          palette={palette}
        />

        <View style={authStyles.form}>
          <View style={authStyles.field}>
            <Text style={[authStyles.label, { color: palette.textMuted }]}>Verification code</Text>
            <TextInput
              style={[authStyles.input, authStyles.codeInput, { backgroundColor: palette.inputBg, color: palette.text, borderColor: palette.cardBorder }]}
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

          {displayError && <Text style={[authStyles.error, { color: palette.danger }]}>{displayError}</Text>}

          <TouchableOpacity
            style={[authStyles.primaryButton, { backgroundColor: palette.accent }, busy && authStyles.buttonDisabled]}
            onPress={handleVerify}
            disabled={busy}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator color={palette.accentText} />
            ) : (
              <Text style={[authStyles.primaryButtonText, { color: palette.accentText }]}>Verify & continue</Text>
            )}
          </TouchableOpacity>

          <View style={authStyles.verifyActions}>
            <TouchableOpacity onPress={handleResend} disabled={busy} hitSlop={8}>
              <Text style={[authStyles.linkText, { color: palette.accent }]}>Resend code</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={restart} disabled={busy} hitSlop={8}>
              <Text style={[authStyles.linkText, { color: palette.textMuted }]}>Use a different email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <AuthHeader
        title="Create your account"
        subtitle="Sign up to sync your training."
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
            placeholder="Choose a password"
            placeholderTextColor={palette.textMuted}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!busy}
            onSubmitEditing={handleSignUp}
          />
        </View>

        {displayError && <Text style={[authStyles.error, { color: palette.danger }]}>{displayError}</Text>}

        {/* Clerk bot protection mount point (required for sign-up) */}
        <View nativeID="clerk-captcha" />

        <TouchableOpacity
          style={[authStyles.primaryButton, { backgroundColor: palette.accent }, busy && authStyles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={busy}
          activeOpacity={0.85}
        >
          {busy ? (
            <ActivityIndicator color={palette.accentText} />
          ) : (
            <Text style={[authStyles.primaryButtonText, { color: palette.accentText }]}>Create account</Text>
          )}
        </TouchableOpacity>

        <View style={authStyles.verifyActions}>
          <Text style={[authStyles.hint, { color: palette.textMuted }]}>Already have an account?</Text>
          <TouchableOpacity onPress={onSwitchToSignIn} disabled={busy} hitSlop={8}>
            <Text style={[authStyles.linkText, { color: palette.accent }]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
