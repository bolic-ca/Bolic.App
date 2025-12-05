/**
 * SetLogForm Component
 * Form for logging a new set during a workout
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import type { SessionSet } from '@/services/storage/session-storage';

interface SetLogFormProps {
  onSubmit: (set: Omit<SessionSet, 'completedAt'>) => void;
  defaultWeight?: number;
}

export default function SetLogForm({ onSubmit, defaultWeight }: SetLogFormProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { customColors } = useThemeCustomization();

  const [weight, setWeight] = useState<string>(defaultWeight?.toString() || '');
  const [reps, setReps] = useState<string>('');
  const [rir, setRir] = useState<string>('');
  const [rpe, setRpe] = useState<string>('');

  // Update weight when defaultWeight changes
  useEffect(() => {
    if (defaultWeight !== undefined) {
      setWeight(defaultWeight.toString());
    }
  }, [defaultWeight]);

  const handleSubmit = () => {
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);

    // Validate required fields
    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight greater than 0');
      return;
    }

    if (!reps || isNaN(repsNum) || repsNum <= 0) {
      Alert.alert('Invalid Reps', 'Please enter a valid number of reps greater than 0');
      return;
    }

    // Parse optional fields
    const rirNum = rir ? parseInt(rir, 10) : undefined;
    const rpeNum = rpe ? parseFloat(rpe) : undefined;

    const setData: Omit<SessionSet, 'completedAt'> = {
      weight: weightNum,
      reps: repsNum,
      rir: rirNum,
      rpe: rpeNum,
    };

    onSubmit(setData);

    // Clear RIR/RPE but keep weight for next set
    setReps('');
    setRir('');
    setRpe('');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={[styles.label, { color: theme.text }]}>Log New Set</Text>

      {/* Weight and Reps (Required) */}
      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Weight (kg)*</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.background }]}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Reps*</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.background }]}
            value={reps}
            onChangeText={setReps}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
          />
        </View>
      </View>

      {/* RIR and RPE (Optional) */}
      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>RIR</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.background }]}
            value={rir}
            onChangeText={setRir}
            keyboardType="number-pad"
            placeholder="Optional"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>RPE</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.background }]}
            value={rpe}
            onChangeText={setRpe}
            keyboardType="decimal-pad"
            placeholder="Optional"
            placeholderTextColor={theme.textSecondary}
          />
        </View>
      </View>

      {/* Add Set Button */}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: customColors.primaryButton }]}
        onPress={handleSubmit}
      >
        <Ionicons name="add-circle" size={20} color={customColors.primaryButtonText} />
        <Text style={[styles.submitButtonText, { color: customColors.primaryButtonText }]}>
          Add Set
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 8,
    marginTop: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
