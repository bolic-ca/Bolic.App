import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '@/constants/theme';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { useExercises } from '@/hooks/useExercises';
import { router } from 'expo-router';

const muscleCategoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Chest: 'fitness',
  Delts: 'triangle',
  Back: 'git-pull-request',
  Quads: 'footsteps',
  Glutes: 'body',
  Hamstrings: 'walk',
  Calves: 'footsteps-outline',
  Abs: 'grid',
};

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

export default function ExercisesPage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { customColors } = useThemeCustomization();
  const { exercises, loading: exercisesLoading, refetch } = useExercises();

  // Refetch exercises when screen comes into focus (e.g., after adding an exercise)
  useFocusEffect(
    useCallback(() => {
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.headerSection}>
          <Text style={[styles.heading, { color: theme.text }]}>Exercise Library</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            All your exercises ({exercises.length})
          </Text>
        </View>

        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={[styles.addExerciseButton, { backgroundColor: customColors.primaryButton }]}
            onPress={() => router.push('/exercise-form')}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>

        {exercisesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={customColors.primaryButton} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading exercises...</Text>
          </View>
        ) : exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyStateText, { color: theme.text }]}>
              No exercises yet
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
              Add your first exercise to get started
            </Text>
          </View>
        ) : (
          <View style={styles.exercisesList}>
            {exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={[styles.exerciseCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                activeOpacity={0.7}
              >
                <View style={styles.exerciseCardHeader}>
                  {exercise.muscleCategory && (
                    <View
                      style={[
                        styles.muscleIconContainer,
                        { backgroundColor: `${muscleCategoryColors[exercise.muscleCategory]}20` },
                      ]}
                    >
                      <Ionicons
                        name={muscleCategoryIcons[exercise.muscleCategory] || 'fitness'}
                        size={24}
                        color={muscleCategoryColors[exercise.muscleCategory]}
                      />
                    </View>
                  )}
                  <View style={styles.exerciseCardInfo}>
                    <Text style={[styles.exerciseCardName, { color: theme.text }]}>
                      {exercise.name}
                    </Text>
                    <View style={styles.exerciseCardMeta}>
                      {exercise.muscleCategory && (
                        <Text style={[styles.exerciseCardMetaText, { color: theme.textSecondary }]}>
                          {exercise.muscleCategory}
                          {exercise.muscleSubcategory && ` • ${exercise.muscleSubcategory}`}
                        </Text>
                      )}
                    </View>
                    {exercise.equipment && (
                      <View style={styles.exerciseCardTags}>
                        <View style={[styles.equipmentTag, { backgroundColor: `${customColors.primaryButton}10` }]}>
                          <Ionicons name="barbell" size={14} color={customColors.primaryButton} />
                          <Text style={[styles.equipmentTagText, { color: customColors.primaryButton }]}>
                            {exercise.equipment}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  headerSection: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '400',
  },
  addButtonContainer: {
    marginBottom: 24,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addExerciseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  muscleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseCardInfo: {
    flex: 1,
  },
  exerciseCardName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  exerciseCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  exerciseCardMetaText: {
    fontSize: 14,
  },
  exerciseCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  equipmentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  equipmentTagText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
