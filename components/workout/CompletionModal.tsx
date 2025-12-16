/**
 * CompletionModal Component
 * Modal for completing a workout with summary and notes
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useColorScheme,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import type { WorkoutSession } from '@/services/storage/session-storage';
import { calculateWorkoutDuration, formatDuration } from '@/utils/workout-helpers';

interface CompletionModalProps {
  visible: boolean;
  onComplete: (notes?: string) => void;
  onCancel: () => void;
  session: WorkoutSession;
}

function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k kg`;
  }
  return `${volume.toLocaleString()} kg`;
}

export default function CompletionModal({
  visible,
  onComplete,
  onCancel,
  session,
}: CompletionModalProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { customColors } = useThemeCustomization();
  const [notes, setNotes] = useState('');

  // Calculate workout statistics
  const duration = calculateWorkoutDuration(session.startedAt);
  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const exercisesCompleted = session.exercises.length;
  const totalVolume = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((setSum, set) => setSum + set.weight * set.reps, 0),
    0
  );

  const handleComplete = () => {
    onComplete(notes || undefined);
    setNotes(''); // Reset notes for next time
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.modal, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: `${customColors.primaryButton}15` }]}>
                <Ionicons name="trophy" size={40} color={customColors.primaryButton} />
              </View>
              <Text style={[styles.title, { color: theme.text }]}>Workout Complete!</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Great job crushing it today
              </Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Ionicons name="time-outline" size={22} color={customColors.primaryButton} />
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {formatDuration(duration)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Duration</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Ionicons name="fitness-outline" size={22} color={customColors.primaryButton} />
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {exercisesCompleted}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Exercises</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Ionicons name="layers-outline" size={22} color={customColors.primaryButton} />
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {totalSets}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Sets</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Ionicons name="barbell-outline" size={22} color={customColors.primaryButton} />
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {formatVolume(totalVolume)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Volume</Text>
              </View>
            </View>

            {/* Notes Input */}
            <View style={styles.notesContainer}>
              <Text style={[styles.notesLabel, { color: theme.text }]}>
                How did it feel? (Optional)
              </Text>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    color: theme.text,
                    borderColor: theme.cardBorder,
                    backgroundColor: theme.card,
                  },
                ]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about this workout..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}
                onPress={onCancel}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                  Keep Training
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.completeButton, { backgroundColor: customColors.primaryButton }]}
                onPress={handleComplete}
              >
                <Ionicons name="checkmark-circle" size={20} color={customColors.primaryButtonText} />
                <Text style={[styles.completeButtonText, { color: customColors.primaryButtonText }]}>
                  Save Workout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 80,
  },
  buttons: {
    gap: 10,
  },
  button: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButton: {
    borderWidth: 1,
  },
  completeButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
