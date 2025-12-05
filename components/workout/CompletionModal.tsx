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
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="checkmark-circle" size={48} color={customColors.primaryButton} />
            <Text style={[styles.title, { color: theme.text }]}>Complete Workout?</Text>
          </View>

          {/* Workout Summary */}
          <View style={[styles.summary, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.summaryRow}>
              <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Duration</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {formatDuration(duration)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Ionicons name="barbell-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Exercises</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {exercisesCompleted}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Ionicons name="list-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total Sets</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {totalSets}
              </Text>
            </View>
          </View>

          {/* Notes Input */}
          <View style={styles.notesContainer}>
            <Text style={[styles.notesLabel, { color: theme.text }]}>
              Notes (Optional)
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
              numberOfLines={4}
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
              <Text style={[styles.completeButtonText, { color: customColors.primaryButtonText }]}>
                Complete Workout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
  },
  summary: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
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
    padding: 12,
    fontSize: 15,
    minHeight: 100,
  },
  buttons: {
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  completeButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
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
