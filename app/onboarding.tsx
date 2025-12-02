/**
 * Onboarding Screen
 * First-time user experience
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useStorage } from '@/contexts/StorageContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeCustomization } from '@/contexts/ThemeContext';

export default function OnboardingScreen() {
  const { completeOnboarding } = useStorage();
  const { customColors } = useThemeCustomization();
  const backgroundColor = useThemeColor({}, 'background');

  async function handleGetStarted() {
    await completeOnboarding();
    router.replace('/(tabs)');
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Welcome to Bolic! 💪
        </ThemedText>

        <ThemedText style={styles.description}>
          Track your workouts offline, anytime, anywhere.
        </ThemedText>

        <View style={styles.features}>
          <View style={styles.feature}>
            <ThemedText style={styles.featureIcon}>📱</ThemedText>
            <ThemedText style={styles.featureText}>Works completely offline</ThemedText>
          </View>

          <View style={styles.feature}>
            <ThemedText style={styles.featureIcon}>📊</ThemedText>
            <ThemedText style={styles.featureText}>Track your progress and PRs</ThemedText>
          </View>

          <View style={styles.feature}>
            <ThemedText style={styles.featureIcon}>🏋️</ThemedText>
            <ThemedText style={styles.featureText}>Science-based training</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.button, { backgroundColor: customColors.primaryButton }]}
          onPress={handleGetStarted}
        >
          <Text style={[styles.buttonText, { color: customColors.primaryButtonText }]}>
            Get Started
          </Text>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 48,
    opacity: 0.8,
  },
  features: {
    width: '100%',
    gap: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    fontSize: 32,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
