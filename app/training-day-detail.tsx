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
import { Colors } from '@/constants/theme';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import type { TrainingDay, TrainingExercise } from '@/types/training';

const muscleCategoryColors: Record<string, string> = {
  Chest: '#ff6b6b',
  Delts: '#ffd93d',
  Back: '#4ecdc4',
  Quads: '#a29bfe',
  Glutes: '#fd79a8',
  Hamstrings: '#fdcb6e',
  Calves: '#6c5ce7',
  Abs: '#00b894',
};

export default function TrainingDayDetailModal() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { customColors } = useThemeCustomization();
  const params = useLocalSearchParams();

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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.text }]}>Training day not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.closeText, { color: customColors.primaryButton }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{trainingDay.name || 'Training Day'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Description */}
        {trainingDay.description && (
          <View style={styles.descriptionSection}>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {trainingDay.description}
            </Text>
          </View>
        )}

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryBadge, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="barbell-outline" size={18} color={customColors.primaryButton} />
            <Text style={[styles.summaryText, { color: theme.text }]}>
              {trainingDay.exercises?.length || 0} exercises
            </Text>
          </View>
        </View>

        {/* Exercises */}
        <View style={styles.exercisesSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Exercises</Text>
          {trainingDay.exercises?.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id || index}
              exercise={exercise}
              index={index}
              theme={theme}
              customColors={customColors}
            />
          ))}
          {(!trainingDay.exercises || trainingDay.exercises.length === 0) && (
            <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No exercises added yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface ExerciseCardProps {
  exercise: TrainingExercise;
  index: number;
  theme: typeof Colors.light;
  customColors: { primaryButton: string; primaryButtonText: string };
}

function ExerciseCard({ exercise, index, theme, customColors }: ExerciseCardProps) {
  const categoryColor = exercise.muscleCategory
    ? muscleCategoryColors[exercise.muscleCategory] || customColors.primaryButton
    : customColors.primaryButton;

  return (
    <View style={[styles.exerciseCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={styles.exerciseHeader}>
        <View style={[styles.exerciseNumber, { backgroundColor: `${categoryColor}20` }]}>
          <Text style={[styles.exerciseNumberText, { color: categoryColor }]}>{index + 1}</Text>
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseName, { color: theme.text }]}>{exercise.name}</Text>
          {exercise.muscleCategory && (
            <Text style={[styles.exerciseMuscle, { color: categoryColor }]}>
              {exercise.muscleCategory}
              {exercise.muscleSubcategory && ` • ${exercise.muscleSubcategory}`}
            </Text>
          )}
        </View>
      </View>

      {/* Exercise Details */}
      <View style={styles.exerciseDetails}>
        {exercise.targetNumberOfSets && (
          <View style={[styles.detailChip, { backgroundColor: theme.background }]}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Sets</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{exercise.targetNumberOfSets}</Text>
          </View>
        )}
        {exercise.targetRepetitions && (
          <View style={[styles.detailChip, { backgroundColor: theme.background }]}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Reps</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{exercise.targetRepetitions}</Text>
          </View>
        )}
        {exercise.targetRepetitionsInReserve && (
          <View style={[styles.detailChip, { backgroundColor: theme.background }]}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>RIR</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{exercise.targetRepetitionsInReserve}</Text>
          </View>
        )}
      </View>

      {/* Equipment & Position */}
      {(exercise.equipment || exercise.targetPosition) && (
        <View style={styles.tagsRow}>
          {exercise.equipment && (
            <View style={[styles.tag, { backgroundColor: `${customColors.primaryButton}10` }]}>
              <Ionicons name="barbell-outline" size={12} color={customColors.primaryButton} />
              <Text style={[styles.tagText, { color: customColors.primaryButton }]}>{exercise.equipment}</Text>
            </View>
          )}
          {exercise.targetPosition && (
            <View style={[styles.tag, { backgroundColor: `${customColors.primaryButton}10` }]}>
              <Ionicons name="resize-outline" size={12} color={customColors.primaryButton} />
              <Text style={[styles.tagText, { color: customColors.primaryButton }]}>{exercise.targetPosition}</Text>
            </View>
          )}
        </View>
      )}

      {/* Notes */}
      {exercise.notes && (
        <Text style={[styles.exerciseNotes, { color: theme.textSecondary }]}>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
    marginBottom: 24,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  exercisesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  exerciseCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontWeight: '600',
    marginBottom: 2,
  },
  exerciseMuscle: {
    fontSize: 13,
    fontWeight: '500',
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  detailChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
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
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  exerciseNotes: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyCard: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 18,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
