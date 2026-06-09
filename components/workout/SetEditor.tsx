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

const RPE_QUICK: number[] = [5, 6, 7, 8, 9, 10];

function rpeColor(value: number): string {
  // 5=green → 10=red
  const stops: Record<number, string> = {
    5: '#4ade80',
    6: '#a3e635',
    7: '#facc15',
    8: '#fb923c',
    9: '#f97316',
    10: '#ef4444',
  };
  return stops[Math.round(value)] ?? '#fb923c';
}

// RIR quick-select options (no null/P — handled by text inputs)
const RIR_OPTIONS: { value: RirValue; label: string; description?: string }[] = [
  { value: 3, label: '3' },
  { value: 2, label: '2' },
  { value: 1, label: '1' },
  { value: 0, label: '0' },
  { value: 'F', label: 'F', description: 'Failure' },
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
    rpe?: number;
    numberOfPartials?: number;
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
  const [rirInput, setRirInput] = useState('');
  const [numberOfPartials, setNumberOfPartials] = useState<number | null>(null);
  const [partialsInput, setPartialsInput] = useState('');
  const [rpe, setRpe] = useState<number | null>(null);
  const [rpeInput, setRpeInput] = useState('');
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
      const initRir = initialData?.rir ?? null;
      setRir(initRir);
      setRirInput(initRir !== null ? String(initRir) : '');
      const initPartials = initialData?.numberOfPartials ?? null;
      setNumberOfPartials(initPartials);
      setPartialsInput(initPartials !== null ? String(initPartials) : '');
      const initRpe = initialData?.rpe ?? null;
      setRpe(initRpe);
      setRpeInput(initRpe !== null ? String(initRpe) : '');
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

    if (rpe !== null) {
      setData.rpe = rpe;
    }

    if (numberOfPartials !== null) {
      setData.numberOfPartials = numberOfPartials;
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
                  {/* Free-text input */}
                  <TextInput
                    style={[
                      styles.rpeInput,
                      {
                        backgroundColor: theme.card,
                        color: theme.text,
                        borderColor: rir !== null && typeof rir === 'number'
                          ? customColors.primaryButton
                          : theme.cardBorder,
                      },
                    ]}
                    value={rirInput}
                    onChangeText={(text) => {
                      setRirInput(text);
                      if (text === '' || text === '-') {
                        setRir(null);
                      } else {
                        const parsed = parseFloat(text);
                        if (!isNaN(parsed) && parsed >= 0) {
                          setRir(parsed);
                          // partials are mutually exclusive
                          setNumberOfPartials(null);
                          setPartialsInput('');
                        }
                      }
                    }}
                    keyboardType="decimal-pad"
                    placeholder="—"
                    placeholderTextColor={theme.textSecondary}
                    selectTextOnFocus
                  />
                  {/* Quick chips */}
                  {RIR_OPTIONS.map((option) => {
                    const isSelected = rir === option.value;
                    const isFail = option.value === 'F';
                    return (
                      <TouchableOpacity
                        key={option.label}
                        style={[
                          styles.rirOption,
                          {
                            backgroundColor: isSelected
                              ? (isFail ? '#ff6b6b' : customColors.primaryButton)
                              : theme.card,
                            borderColor: isSelected
                              ? (isFail ? '#ff6b6b' : customColors.primaryButton)
                              : theme.cardBorder,
                          },
                        ]}
                        onPress={() => {
                          if (isSelected) {
                            setRir(null);
                            setRirInput('');
                          } else {
                            setRir(option.value);
                            setRirInput(String(option.value));
                            // partials are mutually exclusive
                            setNumberOfPartials(null);
                            setPartialsInput('');
                          }
                        }}
                      >
                        <Text style={[styles.rirOptionText, { color: isSelected ? '#fff' : theme.text }]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {/* Partials input — replaces old P chip */}
                  <TextInput
                    style={[
                      styles.rpeInput,
                      {
                        backgroundColor: numberOfPartials !== null ? '#ffd93d' : theme.card,
                        color: numberOfPartials !== null ? '#000' : theme.text,
                        borderColor: numberOfPartials !== null ? '#ffd93d' : theme.cardBorder,
                      },
                    ]}
                    value={partialsInput}
                    onChangeText={(text) => {
                      setPartialsInput(text);
                      if (text === '') {
                        setNumberOfPartials(null);
                      } else {
                        const parsed = parseInt(text, 10);
                        if (!isNaN(parsed) && parsed > 0) {
                          setNumberOfPartials(parsed);
                          // overrides RIR
                          setRir(null);
                          setRirInput('');
                        }
                      }
                    }}
                    keyboardType="number-pad"
                    placeholder="P"
                    placeholderTextColor={theme.textSecondary}
                    selectTextOnFocus
                  />
                </View>
                <View style={styles.rirLegend}>
                  <Text style={[styles.rirLegendText, { color: theme.textSecondary }]}>
                    F = Failure · P = number of partial reps beyond failure
                  </Text>
                </View>
              </View>

              {/* RPE */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  RPE <Text style={[styles.optionalText, { color: theme.textSecondary }]}>(Rate of Perceived Exertion)</Text>
                </Text>
                <View style={styles.rirOptionsRow}>
                  {/* Free-text input */}
                  <TextInput
                    style={[
                      styles.rpeInput,
                      {
                        backgroundColor: theme.card,
                        color: theme.text,
                        borderColor: rpe !== null && !RPE_QUICK.includes(rpe)
                          ? rpeColor(rpe)
                          : theme.cardBorder,
                      },
                    ]}
                    value={rpeInput}
                    onChangeText={(text) => {
                      setRpeInput(text);
                      const parsed = parseFloat(text);
                      if (!isNaN(parsed) && parsed >= 1 && parsed <= 10) {
                        setRpe(parsed);
                      } else if (text === '' || text === '-') {
                        setRpe(null);
                      }
                    }}
                    keyboardType="decimal-pad"
                    placeholder="—"
                    placeholderTextColor={theme.textSecondary}
                    selectTextOnFocus
                  />
                  {/* Quick chips */}
                  {RPE_QUICK.map((val) => {
                    const isSelected = rpe === val;
                    const chipColor = rpeColor(val);
                    return (
                      <TouchableOpacity
                        key={val}
                        style={[
                          styles.rirOption,
                          {
                            backgroundColor: isSelected ? chipColor : theme.card,
                            borderColor: isSelected ? chipColor : theme.cardBorder,
                          },
                        ]}
                        onPress={() => {
                          if (isSelected) {
                            setRpe(null);
                            setRpeInput('');
                          } else {
                            setRpe(val);
                            setRpeInput(String(val));
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.rirOptionText,
                            { color: isSelected ? '#000' : theme.text },
                          ]}
                        >
                          {val}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
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
    alignItems: 'center',
  },
  rpeInput: {
    width: 52,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
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
