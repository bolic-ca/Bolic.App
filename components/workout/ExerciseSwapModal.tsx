/**
 * ExerciseSwapModal
 * Full-screen modal for picking a replacement exercise during a workout.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { useExercises } from '@/hooks/useExercises';
import type { TrainingExercise } from '@/types/training';
import { MuscleCategory } from '@/types/training';
import {
  muscleCategoryColorsTailwind as muscleCategoryColors,
  muscleCategoryIcons,
} from '@/constants/muscle-categories';
import type { WorkoutSession } from '@/services/storage/session-storage';
import { getPreviousPerformance } from '@/utils/workout-helpers';
import { displayWeight } from '@/utils/weight';

const muscleCategories = Object.values(MuscleCategory);

interface ExerciseSwapModalProps {
  visible: boolean;
  currentExerciseId?: string;
  sessionHistory?: WorkoutSession[];
  onClose: () => void;
  onSelectExercise: (exercise: TrainingExercise) => void;
}

export default function ExerciseSwapModal({
  visible,
  currentExerciseId,
  sessionHistory = [],
  onClose,
  onSelectExercise,
}: ExerciseSwapModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { customColors, preferences } = useThemeCustomization();
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
  };

  const filteredExercises = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allExercises.filter((ex) => {
      if (selectedCategory && ex.muscleCategory !== selectedCategory) {
        return false;
      }
      if (!query) return true;
      const haystack = [ex.name, ex.muscleCategory, ex.muscleSubcategory, ex.equipment]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [allExercises, selectedCategory, searchQuery]);

  const isFiltering = searchQuery.trim().length > 0 || selectedCategory !== null;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const handleSelect = (exercise: TrainingExercise) => {
    onSelectExercise(exercise);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: palette.cardBorder }]}>
          <View>
            <Text style={[styles.headerLabel, { color: palette.textMuted }]}>SWAP</Text>
            <Text style={[styles.headerTitle, { color: palette.text }]}>Choose Exercise</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.resultCount, { color: palette.textMuted }]}>
              {filteredExercises.length}
            </Text>
            <TouchableOpacity onPress={handleClose} style={[styles.closeButton, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}>
              <Ionicons name="close" size={22} color={palette.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
            <Ionicons name="search" size={20} color={palette.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: palette.text }]}
              placeholder="Search name, muscle, equipment"
              placeholderTextColor={palette.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="while-editing"
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
              {
                backgroundColor: !selectedCategory ? palette.accent : palette.cardBg,
                borderColor: !selectedCategory ? palette.accent : palette.cardBorder,
              },
            ]}
            onPress={() => setSelectedCategory(null)}
            activeOpacity={0.8}
          >
            <Text style={[styles.categoryChipText, { color: !selectedCategory ? '#FFFFFF' : palette.textMuted }]}>
              All
            </Text>
          </TouchableOpacity>
          {muscleCategories.map(category => {
            const isActive = selectedCategory === category;
            const categoryColor = muscleCategoryColors[category];
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isActive ? categoryColor : palette.cardBg,
                    borderColor: isActive ? categoryColor : palette.cardBorder,
                  },
                ]}
                onPress={() => setSelectedCategory(isActive ? null : category)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={muscleCategoryIcons[category] || 'fitness'}
                  size={13}
                  color={isActive ? '#FFFFFF' : categoryColor}
                />
                <Text style={[styles.categoryChipText, { color: isActive ? '#FFFFFF' : palette.textMuted }]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Exercise List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filteredExercises.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
              <Ionicons name={isFiltering ? 'search-outline' : 'barbell-outline'} size={48} color={palette.textMuted} />
              <Text style={[styles.emptyTitle, { color: palette.text }]}>
                {isFiltering ? 'No Matches' : 'No exercises found'}
              </Text>
              <Text style={[styles.emptyDescription, { color: palette.textMuted }]}>
                {isFiltering ? 'No exercises match your search or filter' : 'No exercises in library'}
              </Text>
              {isFiltering && (
                <TouchableOpacity
                  style={[styles.emptyAction, { backgroundColor: palette.accentGlow }]}
                  onPress={clearFilters}
                >
                  <Text style={[styles.emptyActionText, { color: palette.accent }]}>Clear filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.exercisesList}>
              {filteredExercises.map((exercise) => {
                const isCurrent = exercise.id === currentExerciseId;
                const categoryColor = exercise.muscleCategory
                  ? muscleCategoryColors[exercise.muscleCategory as MuscleCategory]
                  : palette.textMuted;
                const prevPerf = exercise.id
                  ? getPreviousPerformance(exercise.id, sessionHistory)
                  : null;

                return (
                  <TouchableOpacity
                    key={exercise.id}
                    style={[
                      styles.exerciseCard,
                      { backgroundColor: palette.cardBg, borderColor: isCurrent ? palette.accent : palette.cardBorder },
                    ]}
                    onPress={() => handleSelect(exercise)}
                    disabled={isCurrent}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.exerciseIconContainer, { backgroundColor: hexToRgba(categoryColor, 0.15) }]}>
                      <Ionicons name="barbell" size={22} color={categoryColor} />
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
                      {prevPerf ? (
                        <Text style={[styles.historyHint, { color: palette.textMuted }]}>
                          Last: {displayWeight(prevPerf.weight, preferences.weightUnit)}{preferences.weightUnit} × {prevPerf.reps}
                          {prevPerf.rir !== undefined && (
                            prevPerf.rir === 'F' ? ' (F)' :
                            prevPerf.rir === 'P' ? ' (P)' :
                            ` @${prevPerf.rir}RIR`
                          )}
                        </Text>
                      ) : (
                        <Text style={[styles.historyHint, { color: palette.textMuted }]}>No history</Text>
                      )}
                    </View>
                    {isCurrent ? (
                      <View style={[styles.currentBadge, { backgroundColor: hexToRgba(palette.accent, 0.15) }]}>
                        <Text style={[styles.currentBadgeText, { color: palette.accent }]}>Current</Text>
                      </View>
                    ) : (
                      <Ionicons name="swap-horizontal" size={22} color={palette.accent} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultCount: { fontSize: 14, fontWeight: '600' },
  closeButton: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  searchContainer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 16 },

  categoriesScroll: { maxHeight: 60 },
  categoriesContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 8, gap: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: { fontSize: 14, fontWeight: '600' },

  scrollView: { flex: 1 },
  contentContainer: { padding: 20 },

  emptyState: { padding: 48, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  emptyDescription: { fontSize: 14, textAlign: 'center' },
  emptyAction: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 16 },
  emptyActionText: { fontSize: 14, fontWeight: '600' },

  exercisesList: { gap: 10 },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  exerciseIconContainer: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  exerciseMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  muscleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  muscleBadgeText: { fontSize: 11, fontWeight: '600' },
  exerciseEquipment: { fontSize: 12 },
  historyHint: { fontSize: 11, fontWeight: '500', fontStyle: 'italic', marginTop: 3 },
  currentBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  currentBadgeText: { fontSize: 12, fontWeight: '600' },
});
