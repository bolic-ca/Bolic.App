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
import type { SessionSet } from '@/services/storage/session-storage';

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
    rir?: number;
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
  const { customColors } = useThemeCustomization();

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rir, setRir] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (visible) {
      setWeight(initialData?.weight?.toString() ?? '');
      setReps(initialData?.reps?.toString() ?? '');
      setRir(initialData?.rir?.toString() ?? '');
      setNotes(initialData?.notes ?? '');
    }
  }, [visible, initialData]);

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

    const setData: Omit<SessionSet, 'completedAt'> = {
      weight: weightNum,
      reps: repsNum,
    };

    if (rir.trim() !== '') {
      const rirNum = parseInt(rir, 10);
      if (!isNaN(rirNum) && rirNum >= 0) {
        setData.rir = rirNum;
      }
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
                    Weight (kg) <Text style={styles.requiredStar}>*</Text>
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
                  RIR <Text style={[styles.optionalText, { color: theme.textSecondary }]}>(optional)</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder },
                  ]}
                  value={rir}
                  onChangeText={setRir}
                  keyboardType="number-pad"
                  placeholder="Reps in reserve"
                  placeholderTextColor={theme.textSecondary}
                  selectTextOnFocus
                />
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
