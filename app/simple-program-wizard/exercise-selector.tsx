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
import { useSimpleProgramWizard } from '@/contexts/SimpleProgramWizardContext';
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
  const { state, addExercise } = useSimpleProgramWizard();
  const { allExercises } = useExercises();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MuscleCategory | null>(null);

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

  const dayIndex = state.currentDayIndex;
  const trainingDay = dayIndex !== null ? state.trainingDays[dayIndex] : null;

  // Get names of exercises already added to this training day
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
    if (dayIndex === null) return;

    // Create a copy of the exercise for this training day
    const exerciseCopy: TrainingExercise = {
      ...exercise,
      id: undefined,
      trainingDayIds: [],
    };

    addExercise(dayIndex, exerciseCopy);
    router.back();
  };

  const handleCreateNew = () => {
    router.push('/exercise-form');
  };

  if (dayIndex === null) {
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesScroll}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            { backgroundColor: !selectedCategory ? palette.accent : palette.cardBg, borderColor: palette.cardBorder },
          ]}
          onPress={() => setSelectedCategory(null)}
          activeOpacity={0.8}
        >
          <Text style={[styles.categoryChipText, { color: !selectedCategory ? '#FFFFFF' : palette.text }]}>
            All
          </Text>
        </TouchableOpacity>
        {muscleCategories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              { backgroundColor: selectedCategory === category ? muscleCategoryColors[category] : palette.cardBg, borderColor: palette.cardBorder },
            ]}
            onPress={() => setSelectedCategory(category)}
            activeOpacity={0.8}
          >
            <Text style={[styles.categoryChipText, { color: selectedCategory === category ? '#FFFFFF' : palette.text }]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Create New Exercise */}
        <TouchableOpacity
          style={[styles.createNewButton, { backgroundColor: palette.accentGlow, borderColor: palette.accent }]}
          onPress={handleCreateNew}
          activeOpacity={0.8}
        >
          <View style={[styles.createNewIcon, { backgroundColor: palette.accent }]}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.createNewText, { color: palette.accent }]}>Create New Exercise</Text>
          <Ionicons name="chevron-forward" size={20} color={palette.accent} />
        </TouchableOpacity>

        {/* Exercises List */}
        {filteredExercises.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
            <Ionicons name="barbell-outline" size={48} color={palette.textMuted} />
            <Text style={[styles.emptyTitle, { color: palette.text }]}>No exercises found</Text>
            <Text style={[styles.emptyDescription, { color: palette.textMuted }]}>
              {searchQuery || selectedCategory ? 'Try adjusting your filters' : 'Create your first exercise to get started'}
            </Text>
          </View>
        ) : (
          <View style={styles.exercisesList}>
            {filteredExercises.map((exercise) => {
              const isAdded = addedExerciseNames.has(exercise.name?.toLowerCase() || '');
              const categoryColor = exercise.muscleCategory ? muscleCategoryColors[exercise.muscleCategory as MuscleCategory] : palette.textMuted;

              return (
                <TouchableOpacity
                  key={exercise.id}
                  style={[styles.exerciseCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}
                  onPress={() => handleSelectExercise(exercise)}
                  disabled={isAdded}
                  activeOpacity={0.8}
                >
                  <View style={[styles.exerciseIconContainer, { backgroundColor: hexToRgba(categoryColor, 0.15) }]}>
                    <Ionicons name="barbell" size={24} color={categoryColor} />
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={[styles.exerciseName, { color: palette.text }]} numberOfLines={1}>
                      {exercise.name}
                    </Text>
                    <View style={styles.exerciseMeta}>
                      {exercise.muscleCategory && (
                        <View style={[styles.muscleBadge, { backgroundColor: hexToRgba(categoryColor, 0.15) }]}>
                          <Text style={[styles.muscleBadgeText, { color: categoryColor }]}>
                            {exercise.muscleCategory}
                          </Text>
                        </View>
                      )}
                      {exercise.equipment && (
                        <Text style={[styles.exerciseEquipment, { color: palette.textMuted }]}>
                          {exercise.equipment}
                        </Text>
                      )}
                    </View>
                  </View>
                  {isAdded ? (
                    <View style={[styles.addedBadge, { backgroundColor: hexToRgba(palette.success, 0.15) }]}>
                      <Ionicons name="checkmark-circle" size={20} color={palette.success} />
                      <Text style={[styles.addedText, { color: palette.success }]}>Added</Text>
                    </View>
                  ) : (
                    <Ionicons name="add-circle-outline" size={24} color={palette.accent} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backButton: { width: 40 },
  backButtonInner: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, textAlign: 'center', marginBottom: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3, textAlign: 'center' },

  searchContainer: { paddingHorizontal: 20, paddingVertical: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 16 },

  categoriesScroll: { maxHeight: 60 },
  categoriesContainer: { paddingHorizontal: 20, paddingVertical: 8, gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  categoryChipText: { fontSize: 14, fontWeight: '600' },

  scrollView: { flex: 1 },
  contentContainer: { padding: 20 },

  createNewButton: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  createNewIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  createNewText: { flex: 1, fontSize: 16, fontWeight: '700' },

  emptyState: { padding: 48, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  emptyDescription: { fontSize: 14, textAlign: 'center' },

  exercisesList: { gap: 10 },
  exerciseCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, borderWidth: 1 },
  exerciseIconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  exerciseMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  muscleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  muscleBadgeText: { fontSize: 11, fontWeight: '600' },
  exerciseEquipment: { fontSize: 12 },
  addedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  addedText: { fontSize: 12, fontWeight: '600' },

  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, marginTop: 16, marginBottom: 8 },
  errorLink: { fontSize: 15, fontWeight: '600' },
});
