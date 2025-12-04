import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { MuscleCategory } from '@/types/training';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { useStorage } from '@/contexts/StorageContext';
import { useExercises } from '@/hooks/useExercises';
import { usePrograms } from '@/hooks/usePrograms';

const muscleCategoryOptions = Object.values(MuscleCategory);

const muscleSubcategories: Record<string, string[]> = {
  Chest: ['Upper', 'Middle', 'Lower'],
  Delts: ['Front', 'Lateral', 'Rear'],
  Back: ['Upper Traps', 'Mid Traps', 'Lower Traps', 'Upper Lats', 'Mid Lats', 'Lower Lats'],
};

const targetPositions = ['Lengthened', 'Shortened', 'Neutral'];

export default function ExerciseFormScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { customColors } = useThemeCustomization();
  const { userId } = useStorage();
  const { createExercise } = useExercises();
  const { programs, updateProgram } = usePrograms();
  const params = useLocalSearchParams<{ trainingDayId?: string; programId?: string }>();

  // Form state
  const [name, setName] = useState('');
  const [muscleCategory, setMuscleCategory] = useState<MuscleCategory | ''>('');
  const [muscleSubcategory, setMuscleSubcategory] = useState('');
  const [equipment, setEquipment] = useState('');
  const [targetRepetitions, setTargetRepetitions] = useState('');
  const [targetRIR, setTargetRIR] = useState('');
  const [targetPosition, setTargetPosition] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Show/hide pickers
  const [showMusclePicker, setShowMusclePicker] = useState(false);
  const [showSubcategoryPicker, setShowSubcategoryPicker] = useState(false);
  const [showPositionPicker, setShowPositionPicker] = useState(false);

  const availableSubcategories = muscleCategory && muscleSubcategories[muscleCategory] || [];

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    if (!muscleCategory) {
      Alert.alert('Error', 'Please select a muscle category');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not initialized');
      return;
    }

    setLoading(true);

    try {
      // Create the exercise in exercise storage
      const trainingDayIds = params.trainingDayId ? [params.trainingDayId] : [];
      const newExercise = await createExercise({
        userId,
        trainingDayIds,
        name: name.trim(),
        muscleCategory,
        muscleSubcategory: muscleSubcategory || null,
        equipment: equipment.trim() || null,
        targetRepetitions: targetRepetitions.trim() || null,
        targetRepetitionsInReserve: targetRIR.trim() || null,
        targetPosition: targetPosition || null,
        notes: notes.trim() || null,
        sets: [],
      });

      // If trainingDayId and programId are provided, add exercise to the program
      if (params.trainingDayId && params.programId) {
        // Find the program and update it with the new exercise
        const program = programs.find(p => p.id === params.programId);
        if (!program) {
          Alert.alert('Warning', 'Exercise created but could not add to program - program not found');
          router.back();
          return;
        }

        // Deep clone the program to avoid mutation
        const updatedProgram = JSON.parse(JSON.stringify(program));

        // Find and update the training day with the new exercise
        let trainingDayFound = false;

        if (updatedProgram.type === 'simple' && updatedProgram.trainingDays) {
          const dayIndex = updatedProgram.trainingDays.findIndex((d: any) => d.id === params.trainingDayId);
          if (dayIndex !== -1) {
            if (!updatedProgram.trainingDays[dayIndex].exercises) {
              updatedProgram.trainingDays[dayIndex].exercises = [];
            }
            updatedProgram.trainingDays[dayIndex].exercises.push(newExercise);
            trainingDayFound = true;
          }
        } else if (updatedProgram.type === 'periodized' && updatedProgram.mesocycles) {
          for (const meso of updatedProgram.mesocycles) {
            if (meso.microcycles) {
              for (const micro of meso.microcycles) {
                if (micro.trainingDays) {
                  const dayIndex = micro.trainingDays.findIndex((d: any) => d.id === params.trainingDayId);
                  if (dayIndex !== -1) {
                    if (!micro.trainingDays[dayIndex].exercises) {
                      micro.trainingDays[dayIndex].exercises = [];
                    }
                    micro.trainingDays[dayIndex].exercises.push(newExercise);
                    trainingDayFound = true;
                    break;
                  }
                }
              }
            }
            if (trainingDayFound) break;
          }
        }

        if (!trainingDayFound) {
          Alert.alert('Warning', 'Exercise created but could not add to training day - day not found');
          router.back();
          return;
        }

        // Save the updated program
        await updateProgram(updatedProgram);

        Alert.alert('Success', 'Exercise added to training day', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        // Exercise created as standalone (not attached to a program)
        Alert.alert('Success', 'Exercise added to library', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create exercise');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>New Exercise</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Exercise Name */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Exercise Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder }]}
            placeholder="e.g., Barbell Bench Press"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Muscle Category */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Muscle Category *</Text>
          <TouchableOpacity
            style={[styles.picker, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => setShowMusclePicker(!showMusclePicker)}
          >
            <Text style={[styles.pickerText, { color: muscleCategory ? theme.text : theme.textSecondary }]}>
              {muscleCategory || 'Select muscle category'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          {showMusclePicker && (
            <View style={[styles.pickerOptions, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              {muscleCategoryOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.pickerOption}
                  onPress={() => {
                    setMuscleCategory(option);
                    setMuscleSubcategory('');
                    setShowMusclePicker(false);
                  }}
                >
                  <Text style={[styles.pickerOptionText, { color: theme.text }]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Muscle Subcategory */}
        {availableSubcategories.length > 0 && (
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Muscle Subcategory</Text>
            <TouchableOpacity
              style={[styles.picker, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={() => setShowSubcategoryPicker(!showSubcategoryPicker)}
            >
              <Text style={[styles.pickerText, { color: muscleSubcategory ? theme.text : theme.textSecondary }]}>
                {muscleSubcategory || 'Select subcategory (optional)'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            {showSubcategoryPicker && (
              <View style={[styles.pickerOptions, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                {availableSubcategories.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.pickerOption}
                    onPress={() => {
                      setMuscleSubcategory(option);
                      setShowSubcategoryPicker(false);
                    }}
                  >
                    <Text style={[styles.pickerOptionText, { color: theme.text }]}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Equipment */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Equipment</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder }]}
            placeholder="e.g., Barbell, Dumbbells, Cable"
            placeholderTextColor={theme.textSecondary}
            value={equipment}
            onChangeText={setEquipment}
          />
        </View>

        {/* Target Repetitions */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Target Repetitions</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder }]}
            placeholder="e.g., 8-12, 15-20"
            placeholderTextColor={theme.textSecondary}
            value={targetRepetitions}
            onChangeText={setTargetRepetitions}
          />
        </View>

        {/* Target RIR */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Target RIR (Reps In Reserve)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder }]}
            placeholder="e.g., 2-3, 1-2"
            placeholderTextColor={theme.textSecondary}
            value={targetRIR}
            onChangeText={setTargetRIR}
          />
        </View>

        {/* Target Position */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Target Position</Text>
          <TouchableOpacity
            style={[styles.picker, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => setShowPositionPicker(!showPositionPicker)}
          >
            <Text style={[styles.pickerText, { color: targetPosition ? theme.text : theme.textSecondary }]}>
              {targetPosition || 'Select position (optional)'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          {showPositionPicker && (
            <View style={[styles.pickerOptions, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              {targetPositions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.pickerOption}
                  onPress={() => {
                    setTargetPosition(option);
                    setShowPositionPicker(false);
                  }}
                >
                  <Text style={[styles.pickerOptionText, { color: theme.text }]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Notes</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder }]}
            placeholder="Additional notes or instructions"
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: customColors.primaryButton }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.submitButtonText}>Create Exercise</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  pickerText: {
    fontSize: 16,
  },
  pickerOptions: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  pickerOptionText: {
    fontSize: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    gap: 12,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
