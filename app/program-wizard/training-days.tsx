import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { useProgramWizard } from '@/contexts/ProgramWizardContext';
import { MuscleCategory } from '@/types/training';

// Muscle category colors
const muscleCategoryColors: Record<MuscleCategory, string> = {
  [MuscleCategory.Chest]: '#EF4444',
  [MuscleCategory.Back]: '#3B82F6',
  [MuscleCategory.Delts]: '#F59E0B',
  [MuscleCategory.Quads]: '#10B981',
  [MuscleCategory.Hamstrings]: '#8B5CF6',
  [MuscleCategory.Glutes]: '#EC4899',
  [MuscleCategory.Calves]: '#06B6D4',
  [MuscleCategory.Abs]: '#F97316',
};

export default function TrainingDaysScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { customColors } = useThemeCustomization();
  const {
    state,
    updateTrainingDay,
    removeExercise,
    setCurrentMicrocycle,
    setCurrentTrainingDay,
  } = useProgramWizard();

  // Athletic color palette
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const accent = customColors.primaryButton;
  const palette = {
    bg: isDark ? '#0A0A0B' : '#FAFAF9',
    cardBg: isDark ? '#141416' : '#FFFFFF',
    cardBorder: isDark ? '#2A2A2E' : '#E8E8E6',
    text: isDark ? '#FAFAFA' : '#0A0A0B',
    textMuted: isDark ? '#71717A' : '#71717A',
    accent,
    accentGlow: isDark ? hexToRgba(accent, 0.15) : hexToRgba(accent, 0.08),
    danger: '#EF4444',
  };

  const microcycleIndex = state.currentMicrocycleIndex;
  const dayIndex = state.currentTrainingDayIndex;

  const trainingDay = useMemo(() => {
    if (microcycleIndex === null || dayIndex === null) return null;
    return state.microcycles[microcycleIndex]?.trainingDays[dayIndex] || null;
  }, [state.microcycles, microcycleIndex, dayIndex]);

  const microcycle = useMemo(() => {
    if (microcycleIndex === null) return null;
    return state.microcycles[microcycleIndex] || null;
  }, [state.microcycles, microcycleIndex]);

  if (!trainingDay || microcycleIndex === null || dayIndex === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={palette.danger} />
          <Text style={[styles.errorText, { color: palette.text }]}>Training day not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.errorLink, { color: palette.accent }]}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleDeleteExercise = (exerciseIndex: number) => {
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeExercise(microcycleIndex, dayIndex, exerciseIndex) },
      ]
    );
  };

  const handleAddExercise = () => {
    router.push('/program-wizard/exercise-selector');
  };

  const handleBack = () => {
    setCurrentMicrocycle(null);
    setCurrentTrainingDay(null);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: palette.cardBorder }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <View style={[styles.backButtonInner, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}>
            <Ionicons name="chevron-back" size={22} color={palette.text} />
          </View>
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerLabel, { color: palette.textMuted }]}>
            {microcycle?.name || 'Week'}
          </Text>
          <Text style={[styles.headerTitle, { color: palette.text }]}>Training Day</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Day Name */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: palette.text }]}>Day Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: palette.cardBg, color: palette.text, borderColor: palette.cardBorder }]}
            placeholder="e.g., Upper Body, Push Day"
            placeholderTextColor={palette.textMuted}
            value={trainingDay.name}
            onChangeText={(text) => updateTrainingDay(microcycleIndex, dayIndex, { name: text })}
          />
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: palette.text }]}>Description (optional)</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: palette.cardBg, color: palette.text, borderColor: palette.cardBorder }]}
            placeholder="Focus areas or notes for this day"
            placeholderTextColor={palette.textMuted}
            value={trainingDay.description}
            onChangeText={(text) => updateTrainingDay(microcycleIndex, dayIndex, { description: text })}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        {/* Exercises Section */}
        <View style={styles.exercisesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Exercises</Text>
            <Text style={[styles.sectionCount, { color: palette.textMuted }]}>
              {trainingDay.exercises.length} total
            </Text>
          </View>

          {trainingDay.exercises.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
              <Ionicons name="barbell-outline" size={36} color={palette.textMuted} />
              <Text style={[styles.emptyStateText, { color: palette.textMuted }]}>
                No exercises added yet
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: palette.textMuted }]}>
                Add exercises from your library or create new ones
              </Text>
            </View>
          ) : (
            <View style={styles.exercisesList}>
              {trainingDay.exercises.map((exercise, exerciseIndex) => {
                const categoryColor = exercise.muscleCategory
                  ? muscleCategoryColors[exercise.muscleCategory as MuscleCategory] || palette.accent
                  : palette.accent;

                return (
                  <View
                    key={exercise.id || exerciseIndex}
                    style={[styles.exerciseCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}
                  >
                    <View style={styles.exerciseLeft}>
                      <View style={[styles.exerciseIcon, { backgroundColor: hexToRgba(categoryColor, 0.15) }]}>
                        <Ionicons name="barbell" size={18} color={categoryColor} />
                      </View>
                      <View style={styles.exerciseInfo}>
                        <Text style={[styles.exerciseName, { color: palette.text }]} numberOfLines={1}>
                          {exercise.name || 'Unnamed Exercise'}
                        </Text>
                        <View style={styles.exerciseMeta}>
                          {exercise.muscleCategory && (
                            <Text style={[styles.exerciseCategory, { color: categoryColor }]}>
                              {exercise.muscleCategory}
                            </Text>
                          )}
                          {exercise.targetNumberOfSets && (
                            <Text style={[styles.exerciseDetail, { color: palette.textMuted }]}>
                              {exercise.targetNumberOfSets} sets
                            </Text>
                          )}
                          {exercise.targetRepetitions && (
                            <Text style={[styles.exerciseDetail, { color: palette.textMuted }]}>
                              {exercise.targetRepetitions} reps
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                    <View style={styles.exerciseRight}>
                      <TouchableOpacity
                        style={styles.deleteExerciseButton}
                        onPress={() => handleDeleteExercise(exerciseIndex)}
                      >
                        <Ionicons name="close-circle" size={22} color={palette.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Add Exercise Button */}
          <TouchableOpacity
            style={[styles.addExerciseButton, { borderColor: palette.accent }]}
            onPress={handleAddExercise}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[hexToRgba(palette.accent, 0.1), hexToRgba(palette.accent, 0.05)]}
              style={styles.addExerciseGradient}
            >
              <Ionicons name="add-circle" size={22} color={palette.accent} />
              <Text style={[styles.addExerciseText, { color: palette.accent }]}>Add Exercise</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Done Button */}
        <TouchableOpacity
          style={[styles.doneButton, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={22} color={palette.accent} />
          <Text style={[styles.doneButtonText, { color: palette.text }]}>Done Editing</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    minHeight: 70,
  },
  exercisesSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionCount: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderWidth: 1,
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  exercisesList: {
    gap: 10,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  exerciseCategory: {
    fontSize: 12,
    fontWeight: '600',
  },
  exerciseDetail: {
    fontSize: 12,
  },
  exerciseRight: {
    paddingLeft: 12,
  },
  deleteExerciseButton: {
    padding: 4,
  },
  addExerciseButton: {
    marginTop: 16,
    borderWidth: 2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  addExerciseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 14,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
