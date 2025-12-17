/**
 * SetEditor Component
 * Unified modal for adding and editing sets during a workout
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import type { SessionSet, RirValue } from '@/services/storage/session-storage';
import { displayWeight, toStorageUnit } from '@/utils/weight';

// RIR quick-select options
const RIR_OPTIONS: { value: RirValue | null; label: string; description?: string }[] = [
  { value: null, label: '-', description: 'None' },
  { value: 3, label: '3' },
  { value: 2, label: '2' },
  { value: 1, label: '1' },
  { value: 0, label: '0' },
  { value: 'F', label: 'F', description: 'Failure' },
  { value: 'P', label: 'P', description: 'Partials' },
];

interface SetEditorProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (set: Omit<SessionSet, 'completedAt'>) => void;
  onDelete?: () => void;
  mode: 'add' | 'edit';
  setNumber?: number;
  initialData?: {
    weight?: number;
    reps?: number;
    rir?: RirValue;
    notes?: string;
  };
}

export default function SetEditor({
  visible,
  onClose,
  onSubmit,
  onDelete,
  mode,
  setNumber,
  initialData,
}: SetEditorProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { customColors, preferences } = useThemeCustomization();

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rir, setRir] = useState<RirValue | null>(null);
  const [notes, setNotes] = useState('');

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (visible) {
      // Convert weight from storage unit (kg) to display unit
      const displayWeightValue = initialData?.weight
        ? displayWeight(initialData.weight, preferences.weightUnit).toString()
        : '';
      setWeight(displayWeightValue);
      setReps(initialData?.reps?.toString() ?? '');
      setRir(initialData?.rir ?? null);
      setNotes(initialData?.notes ?? '');
    }
  }, [visible, initialData, preferences.weightUnit]);

  const handleSubmit = () => {
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);

    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight greater than 0');
      return;
    }

    if (!reps || isNaN(repsNum) || repsNum <= 0) {
      Alert.alert('Invalid Reps', 'Please enter a valid number of reps greater than 0');
      return;
    }

    // Convert weight from display unit to storage unit (kg)
    const weightInStorageUnit = toStorageUnit(weightNum, preferences.weightUnit);

    const setData: Omit<SessionSet, 'completedAt'> = {
      weight: weightInStorageUnit,
      reps: repsNum,
    };

    if (rir !== null) {
      setData.rir = rir;
    }

    if (notes.trim() !== '') {
      setData.notes = notes.trim();
    }

    onSubmit(setData);
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Set',
      `Are you sure you want to delete Set ${setNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete?.();
            onClose();
          },
        },
      ]
    );
  };

  const title = mode === 'add' ? 'Add Set' : `Edit Set ${setNumber}`;
  const submitText = mode === 'add' ? 'Add Set' : 'Save Changes';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={28} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Weight and Reps Row */}
              <View style={styles.inputRow}>
                <View style={styles.inputGroupLarge}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
                    Weight ({preferences.weightUnit}) <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.inputLarge,
                      { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder },
                    ]}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={theme.textSecondary}
                    selectTextOnFocus
                  />
                </View>
                <View style={styles.inputGroupLarge}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
                    Reps <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.inputLarge,
                      { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder },
                    ]}
                    value={reps}
                    onChangeText={setReps}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={theme.textSecondary}
                    selectTextOnFocus
                  />
                </View>
              </View>

              {/* RIR */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  RIR <Text style={[styles.optionalText, { color: theme.textSecondary }]}>(Reps in Reserve)</Text>
                </Text>
                <View style={styles.rirOptionsRow}>
                  {RIR_OPTIONS.map((option) => {
                    const isSelected = rir === option.value;
                    const isSpecial = option.value === 'F' || option.value === 'P';
                    return (
                      <TouchableOpacity
                        key={option.label}
                        style={[
                          styles.rirOption,
                          {
                            backgroundColor: isSelected
                              ? (isSpecial ? (option.value === 'F' ? '#ff6b6b' : '#ffd93d') : customColors.primaryButton)
                              : theme.card,
                            borderColor: isSelected
                              ? (isSpecial ? (option.value === 'F' ? '#ff6b6b' : '#ffd93d') : customColors.primaryButton)
                              : theme.cardBorder,
                          },
                        ]}
                        onPress={() => setRir(option.value)}
                      >
                        <Text
                          style={[
                            styles.rirOptionText,
                            {
                              color: isSelected
                                ? (isSpecial && option.value === 'P' ? '#000' : '#fff')
                                : theme.text,
                            },
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={styles.rirLegend}>
                  <Text style={[styles.rirLegendText, { color: theme.textSecondary }]}>
                    F = Failure · P = Partials (beyond failure)
                  </Text>
                </View>
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  Notes <Text style={[styles.optionalText, { color: theme.textSecondary }]}>(optional)</Text>
                </Text>
                <TextInput
                  style={[
                    styles.inputMultiline,
                    { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder },
                  ]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add notes about this set..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              {mode === 'edit' && onDelete && (
                <TouchableOpacity
                  style={[styles.deleteButton, { borderColor: '#ff6b6b' }]}
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: customColors.primaryButton }]}
                onPress={handleSubmit}
              >
                {mode === 'add' && (
                  <Ionicons name="add-circle" size={20} color={customColors.primaryButtonText} />
                )}
                <Text style={[styles.submitButtonText, { color: customColors.primaryButtonText }]}>
                  {submitText}
                </Text>
              </TouchableOpacity>
            </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  modalScroll: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputGroupLarge: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#ff6b6b',
    fontWeight: '400',
  },
  optionalText: {
    fontSize: 13,
    fontWeight: '400',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  inputLarge: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputMultiline: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    fontWeight: '400',
    minHeight: 80,
  },
  rirOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  rirOption: {
    minWidth: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  rirOptionText: {
    fontSize: 16,
    fontWeight: '700',
  },
  rirLegend: {
    marginTop: 8,
  },
  rirLegendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
