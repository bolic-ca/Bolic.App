import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import type { TrainingDay, TrainingExercise } from '@/types/training';

import { muscleCategoryColors } from '@/constants/muscle-categories';

export default function TrainingDayDetailModal() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { customColors } = useThemeCustomization();
  const params = useLocalSearchParams();

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
  };

  // Parse the training day data from params
  const trainingDay: TrainingDay | null = useMemo(() => {
    if (params.trainingDay) {
      try {
        return JSON.parse(params.trainingDay as string);
      } catch {
        return null;
      }
    }
    return null;
  }, [params.trainingDay]);

  if (!trainingDay) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
        <View style={styles.errorContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}>
            <Ionicons name="calendar-outline" size={32} color={palette.textMuted} />
          </View>
          <Text style={[styles.errorText, { color: palette.text }]}>Training day not found</Text>
          <TouchableOpacity style={[styles.errorButton, { backgroundColor: palette.accentGlow }]} onPress={() => router.back()}>
            <Text style={[styles.closeText, { color: palette.accent }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: palette.cardBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <View style={[styles.closeButtonInner, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}>
            <Ionicons name="close" size={22} color={palette.text} />
          </View>
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerLabel, { color: palette.textMuted }]}>TRAINING DAY</Text>
          <Text style={[styles.headerTitle, { color: palette.text }]}>{trainingDay.name || 'Details'}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description */}
        {trainingDay.description && (
          <View style={styles.descriptionSection}>
            <Text style={[styles.description, { color: palette.textMuted }]}>
              {trainingDay.description}
            </Text>
          </View>
        )}

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryBadge, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
            <View style={[styles.summaryIconBg, { backgroundColor: palette.accentGlow }]}>
              <Ionicons name="barbell-outline" size={16} color={palette.accent} />
            </View>
            <Text style={[styles.summaryText, { color: palette.text }]}>
              {trainingDay.exercises?.length || 0} exercises
            </Text>
          </View>
        </View>

        {/* Exercises */}
        <View style={styles.exercisesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Exercises</Text>
          </View>
          {trainingDay.exercises?.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id || index}
              exercise={exercise}
              index={index}
              palette={palette}
              isDark={isDark}
            />
          ))}
          {(!trainingDay.exercises || trainingDay.exercises.length === 0) && (
            <View style={[styles.emptyCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
              <View style={[styles.emptyIconContainerSmall, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}>
                <Ionicons name="barbell-outline" size={24} color={palette.textMuted} />
              </View>
              <Text style={[styles.emptyText, { color: palette.textMuted }]}>
                No exercises added yet
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface ExerciseCardProps {
  exercise: TrainingExercise;
  index: number;
  palette: {
    bg: string;
    cardBg: string;
    cardBorder: string;
    text: string;
    textMuted: string;
    accent: string;
    accentGlow: string;
  };
  isDark: boolean;
}

function ExerciseCard({ exercise, index, palette, isDark }: ExerciseCardProps) {
  const categoryColor = exercise.muscleCategory
    ? muscleCategoryColors[exercise.muscleCategory] || palette.accent
    : palette.accent;

  return (
    <View style={[styles.exerciseCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
      <View style={styles.exerciseHeader}>
        <View style={[styles.exerciseNumber, { backgroundColor: `${categoryColor}20` }]}>
          <Text style={[styles.exerciseNumberText, { color: categoryColor }]}>{index + 1}</Text>
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseName, { color: palette.text }]}>{exercise.name}</Text>
          {exercise.muscleCategory && (
            <Text style={[styles.exerciseMuscle, { color: categoryColor }]}>
              {exercise.muscleCategory}
              {exercise.muscleSubcategory && ` · ${exercise.muscleSubcategory}`}
            </Text>
          )}
        </View>
      </View>

      {/* Exercise Details */}
      <View style={styles.exerciseDetails}>
        {exercise.targetNumberOfSets && (
          <View style={[styles.detailChip, { backgroundColor: isDark ? '#1F1F23' : '#F9F9F8' }]}>
            <Text style={[styles.detailLabel, { color: palette.textMuted }]}>Sets</Text>
            <Text style={[styles.detailValue, { color: palette.text }]}>{exercise.targetNumberOfSets}</Text>
          </View>
        )}
        {exercise.targetRepetitions && (
          <View style={[styles.detailChip, { backgroundColor: isDark ? '#1F1F23' : '#F9F9F8' }]}>
            <Text style={[styles.detailLabel, { color: palette.textMuted }]}>Reps</Text>
            <Text style={[styles.detailValue, { color: palette.text }]}>{exercise.targetRepetitions}</Text>
          </View>
        )}
        {exercise.targetRepetitionsInReserve && (
          <View style={[styles.detailChip, { backgroundColor: isDark ? '#1F1F23' : '#F9F9F8' }]}>
            <Text style={[styles.detailLabel, { color: palette.textMuted }]}>RIR</Text>
            <Text style={[styles.detailValue, { color: palette.text }]}>{exercise.targetRepetitionsInReserve}</Text>
          </View>
        )}
      </View>

      {/* Equipment & Position */}
      {(exercise.equipment || exercise.targetPosition) && (
        <View style={styles.tagsRow}>
          {exercise.equipment && (
            <View style={[styles.tag, { backgroundColor: palette.accentGlow }]}>
              <Ionicons name="barbell-outline" size={12} color={palette.accent} />
              <Text style={[styles.tagText, { color: palette.accent }]}>{exercise.equipment}</Text>
            </View>
          )}
          {exercise.targetPosition && (
            <View style={[styles.tag, { backgroundColor: palette.accentGlow }]}>
              <Ionicons name="resize-outline" size={12} color={palette.accent} />
              <Text style={[styles.tagText, { color: palette.accent }]}>{exercise.targetPosition}</Text>
            </View>
          )}
        </View>
      )}

      {/* Notes */}
      {exercise.notes && (
        <Text style={[styles.exerciseNotes, { color: palette.textMuted }]}>
          {exercise.notes}
        </Text>
      )}
    </View>
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonInner: {
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
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  summaryIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  exercisesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  exerciseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  exerciseNumber: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  exerciseMuscle: {
    fontSize: 13,
    fontWeight: '600',
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  detailChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  exerciseNotes: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 10,
    lineHeight: 18,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyIconContainerSmall: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  errorButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
