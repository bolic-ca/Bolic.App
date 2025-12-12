import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { useProgramWizard } from '@/contexts/ProgramWizardContext';
import { useExercises } from '@/hooks/useExercises';
import { MuscleCategory, TrainingExercise } from '@/types/training';

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

const muscleCategories = Object.values(MuscleCategory);

export default function ExerciseSelectorScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { customColors } = useThemeCustomization();
  const { state, addExercise } = useProgramWizard();
  const { allExercises } = useExercises();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MuscleCategory | null>(null);

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
    success: '#22C55E',
  };

  const microcycleIndex = state.currentMicrocycleIndex;
  const dayIndex = state.currentTrainingDayIndex;

  const trainingDay = useMemo(() => {
    if (microcycleIndex === null || dayIndex === null) return null;
    return state.microcycles[microcycleIndex]?.trainingDays[dayIndex] || null;
  }, [state.microcycles, microcycleIndex, dayIndex]);

  // Get IDs of exercises already added to this training day
  const addedExerciseNames = useMemo(() => {
    if (!trainingDay) return new Set<string>();
    return new Set(trainingDay.exercises.map(ex => ex.name?.toLowerCase() || ''));
  }, [trainingDay]);

  // Filter exercises
  const filteredExercises = useMemo(() => {
    let exercises = allExercises;

    if (selectedCategory) {
      exercises = exercises.filter(ex => ex.muscleCategory === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      exercises = exercises.filter(ex =>
        (ex.name?.toLowerCase().includes(query)) ||
        (ex.muscleCategory?.toLowerCase().includes(query)) ||
        (ex.equipment?.toLowerCase().includes(query))
      );
    }

    return exercises;
  }, [allExercises, selectedCategory, searchQuery]);

  const handleSelectExercise = (exercise: TrainingExercise) => {
    if (microcycleIndex === null || dayIndex === null) return;

    // Create a copy of the exercise for this training day
    const exerciseCopy: TrainingExercise = {
      ...exercise,
      id: undefined, // Will be assigned in context
      trainingDayIds: [],
    };

    addExercise(microcycleIndex, dayIndex, exerciseCopy);
  };

  const handleCreateNew = () => {
    router.push('/exercise-form');
  };

  if (microcycleIndex === null || dayIndex === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={palette.accent} />
          <Text style={[styles.errorText, { color: palette.text }]}>No training day selected</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.errorLink, { color: palette.accent }]}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: palette.cardBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={[styles.backButtonInner, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}>
            <Ionicons name="chevron-back" size={22} color={palette.text} />
          </View>
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerLabel, { color: palette.textMuted }]}>SELECT</Text>
          <Text style={[styles.headerTitle, { color: palette.text }]}>Add Exercise</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
          <Ionicons name="search" size={20} color={palette.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: palette.text }]}
            placeholder="Search exercises..."
            placeholderTextColor={palette.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={palette.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === null ? palette.accent : palette.cardBg,
                borderColor: selectedCategory === null ? palette.accent : palette.cardBorder,
              },
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.categoryChipText, { color: selectedCategory === null ? '#FFF' : palette.text }]}>
              All
            </Text>
          </TouchableOpacity>
          {muscleCategories.map((category) => {
            const isSelected = selectedCategory === category;
            const categoryColor = muscleCategoryColors[category];
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected ? categoryColor : palette.cardBg,
                    borderColor: isSelected ? categoryColor : palette.cardBorder,
                  },
                ]}
                onPress={() => setSelectedCategory(isSelected ? null : category)}
              >
                <Text style={[styles.categoryChipText, { color: isSelected ? '#FFF' : palette.text }]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Create New Exercise */}
        <TouchableOpacity
          style={[styles.createNewCard, { backgroundColor: palette.accentGlow, borderColor: hexToRgba(palette.accent, 0.3) }]}
          onPress={handleCreateNew}
          activeOpacity={0.8}
        >
          <View style={[styles.createNewIcon, { backgroundColor: palette.accent }]}>
            <Ionicons name="add" size={24} color="#FFF" />
          </View>
          <View style={styles.createNewInfo}>
            <Text style={[styles.createNewTitle, { color: palette.text }]}>Create New Exercise</Text>
            <Text style={[styles.createNewSubtitle, { color: palette.textMuted }]}>
              Add a custom exercise to your library
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={palette.textMuted} />
        </TouchableOpacity>

        {/* Exercise Library */}
        <View style={styles.librarySection}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            From Library ({filteredExercises.length})
          </Text>

          {filteredExercises.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: palette.cardBorder }]}>
              <Ionicons name="search" size={32} color={palette.textMuted} />
              <Text style={[styles.emptyStateText, { color: palette.textMuted }]}>
                No exercises found
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: palette.textMuted }]}>
                Try a different search or create a new exercise
              </Text>
            </View>
          ) : (
            <View style={styles.exercisesList}>
              {filteredExercises.map((exercise) => {
                const categoryColor = exercise.muscleCategory
                  ? muscleCategoryColors[exercise.muscleCategory as MuscleCategory] || palette.accent
                  : palette.accent;
                const isAlreadyAdded = addedExerciseNames.has(exercise.name?.toLowerCase() || '');

                return (
                  <TouchableOpacity
                    key={exercise.id}
                    style={[
                      styles.exerciseCard,
                      {
                        backgroundColor: palette.cardBg,
                        borderColor: isAlreadyAdded ? palette.success : palette.cardBorder,
                      },
                    ]}
                    onPress={() => handleSelectExercise(exercise)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.exerciseLeft}>
                      <View style={[styles.exerciseIcon, { backgroundColor: hexToRgba(categoryColor, 0.15) }]}>
                        <Ionicons name="barbell" size={18} color={categoryColor} />
                      </View>
                      <View style={styles.exerciseInfo}>
                        <Text style={[styles.exerciseName, { color: palette.text }]} numberOfLines={1}>
                          {exercise.name || 'Unnamed'}
                        </Text>
                        <View style={styles.exerciseMeta}>
                          {exercise.muscleCategory && (
                            <Text style={[styles.exerciseCategory, { color: categoryColor }]}>
                              {exercise.muscleCategory}
                            </Text>
                          )}
                          {exercise.equipment && (
                            <Text style={[styles.exerciseEquipment, { color: palette.textMuted }]}>
                              {exercise.equipment}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                    <View style={styles.exerciseRight}>
                      {isAlreadyAdded ? (
                        <View style={[styles.addedBadge, { backgroundColor: hexToRgba(palette.success, 0.15) }]}>
                          <Ionicons name="checkmark" size={16} color={palette.success} />
                        </View>
                      ) : (
                        <View style={[styles.addButton, { backgroundColor: palette.accentGlow }]}>
                          <Ionicons name="add" size={20} color={palette.accent} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 2,
  },
  categoryFilter: {
    paddingTop: 12,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  createNewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 24,
  },
  createNewIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createNewInfo: {
    flex: 1,
    marginLeft: 14,
  },
  createNewTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  createNewSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  librarySection: {
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
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
  exerciseEquipment: {
    fontSize: 12,
  },
  exerciseRight: {
    paddingLeft: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
