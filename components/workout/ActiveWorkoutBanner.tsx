/**
 * ActiveWorkoutBanner Component
 * Floating banner that shows when user navigates away from active workout
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { useWorkoutUI } from '@/contexts/WorkoutUIContext';
import WorkoutTimer from './WorkoutTimer';

interface ActiveWorkoutBannerProps {
  startedAt: string;
  trainingDayName?: string;
}

export default function ActiveWorkoutBanner({ startedAt, trainingDayName }: ActiveWorkoutBannerProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { customColors } = useThemeCustomization();
  const router = useRouter();
  const pathname = usePathname();
  const { expand } = useWorkoutUI();

  const handlePress = () => {
    // Expand the workout interface
    expand();

    // Navigate to home tab if not already there
    const isOnHomeTab = pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/';
    if (!isOnHomeTab) {
      router.push('/(tabs)');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: customColors.primaryButton, borderTopColor: theme.cardBorder }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Ionicons name="barbell" size={20} color={customColors.primaryButtonText} />
        <View style={styles.textContent}>
          <Text style={[styles.workoutName, { color: customColors.primaryButtonText }]} numberOfLines={1}>
            {trainingDayName || 'Workout in progress'}
          </Text>
          <Text style={[styles.resumeText, { color: customColors.primaryButtonText }]}>
            Tap to resume
          </Text>
        </View>
        <WorkoutTimer startedAt={startedAt} color={customColors.primaryButtonText} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 85, // Above tab bar (tab bar height)
    left: 0,
    right: 0,
    zIndex: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textContent: {
    flex: 1,
  },
  workoutName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  resumeText: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.9,
  },
});
