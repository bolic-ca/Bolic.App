import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeCustomization } from '@/contexts/ThemeContext';

export function useAuthPalette() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { customColors } = useThemeCustomization();

  return {
    bg: isDark ? '#0A0A0B' : '#FAFAF9',
    cardBg: isDark ? '#141416' : '#FFFFFF',
    cardBorder: isDark ? '#2A2A2E' : '#E8E8E6',
    text: isDark ? '#FAFAFA' : '#0A0A0B',
    textMuted: '#71717A',
    accent: customColors.primaryButton,
    accentText: customColors.primaryButtonText,
    danger: '#EF4444',
    inputBg: isDark ? '#1C1C1F' : '#F4F4F3',
  };
}

export type AuthPalette = ReturnType<typeof useAuthPalette>;

export function goHome() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/(tabs)');
  }
}

export function AuthHeader({ title, subtitle, palette }: { title: string; subtitle: string; palette: AuthPalette }) {
  return (
    <View style={authStyles.header}>
      <View style={[authStyles.logo, { backgroundColor: palette.accent }]}>
        <Ionicons name="barbell" size={28} color="#FFF" />
      </View>
      <Text style={[authStyles.title, { color: palette.text }]}>{title}</Text>
      <Text style={[authStyles.subtitle, { color: palette.textMuted }]}>{subtitle}</Text>
    </View>
  );
}

export const authStyles = StyleSheet.create({
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
  primaryButtonText: { fontSize: 17, fontWeight: '700' },
  buttonDisabled: { opacity: 0.6 },
  hint: { fontSize: 13, fontWeight: '500', textAlign: 'center', lineHeight: 19 },
  verifyActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  linkText: { fontSize: 15, fontWeight: '600' },
});
