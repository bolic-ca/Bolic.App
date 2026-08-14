import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSignIn } from '@clerk/expo';
import { AuthHeader, authStyles, goHome, useAuthPalette } from './shared';

type Step = 'credentials' | 'verify';

const EMAIL_VERIFICATION_STATUSES = new Set(['needs_client_trust', 'needs_second_factor']);

export function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const palette = useAuthPalette();
  const { signIn, errors, fetchStatus } = useSignIn();

  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const busy = fetchStatus === 'fetching';

  const fieldError =
    errors.fields.identifier?.longMessage ??
    errors.fields.password?.longMessage ??
    errors.fields.code?.longMessage ??
    null;

  const displayError = formError ?? fieldError;

  const startEmailVerification = async () => {
    const emailFactor = signIn.supportedSecondFactors?.find((f) => f.strategy === 'email_code');
    if (!emailFactor) {
      setFormError('This sign-in needs extra verification, which is not available for your account.');
      return;
    }
    const { error } = await signIn.mfa.sendEmailCode();
    if (error) {
      setFormError(error.longMessage ?? error.message);
      return;
    }
    setStep('verify');
  };

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
    } else if (EMAIL_VERIFICATION_STATUSES.has(signIn.status ?? '')) {
      await startEmailVerification();
    } else {
      setFormError('Additional verification is required to finish signing in.');
    }
  };

  const handleVerify = async () => {
    setFormError(null);
    if (!code.trim()) {
      setFormError('Enter the code we emailed you.');
      return;
    }

    const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });
    if (error) {
      setFormError(error.longMessage ?? error.message);
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize();
      goHome();
    }
  };

  const handleResend = async () => {
    setFormError(null);
    const { error } = await signIn.mfa.sendEmailCode();
    if (error) setFormError(error.longMessage ?? error.message);
  };

  const restart = () => {
    setStep('credentials');
    setCode('');
    setFormError(null);
    void signIn.reset();
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
              <Text style={[authStyles.linkText, { color: palette.textMuted }]}>Use a different account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

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
