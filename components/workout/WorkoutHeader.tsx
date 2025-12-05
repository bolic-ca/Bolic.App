/**
 * WorkoutHeader Component
 * Header for active workout with timer and action buttons
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import WorkoutTimer from './WorkoutTimer';

interface WorkoutHeaderProps {
  startedAt: string;
  trainingDayName?: string;
  onCancel: () => void;
  onFinish: () => void;
  onMinimize?: () => void;
}

export default function WorkoutHeader({
  startedAt,
  trainingDayName = 'Workout',
  onCancel,
  onFinish,
  onMinimize,
}: WorkoutHeaderProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const handleCancelPress = () => {
    Alert.alert(
      'Cancel Workout?',
      'Are you sure? Your progress will be lost.',
      [
        { text: 'Keep Training', style: 'cancel' },
        {
          text: 'Cancel Workout',
          style: 'destructive',
          onPress: onCancel,
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderBottomColor: theme.cardBorder }]}>
      <View style={styles.content}>
        {/* Left: Cancel and Minimize */}
        <View style={styles.leftActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCancelPress}
          >
            <Ionicons name="close-circle-outline" size={28} color={theme.textSecondary} />
          </TouchableOpacity>
          {onMinimize && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onMinimize}
            >
              <Ionicons name="chevron-down-circle-outline" size={28} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center: Training Day Name + Timer */}
        <View style={styles.centerContent}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {trainingDayName}
          </Text>
          <WorkoutTimer startedAt={startedAt} color={theme.tint} />
        </View>

        {/* Finish Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onFinish}
        >
          <Ionicons name="checkmark-circle" size={28} color={theme.tint} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
});
