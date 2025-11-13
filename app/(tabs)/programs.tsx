import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { mockPrograms, mockTrainingDay } from '@/data/mock-data';
import type { TrainingExercise } from '@/types/training';

const difficultyColors = {
  Beginner: '#4ecdc4',
  Intermediate: '#ffd93d',
  Advanced: '#ff6b6b',
};

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

export default function ProgramsPage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
      <Text style={[styles.heading, { color: theme.text }]}>Training Programs</Text>
      <Text style={[styles.subheading, { color: theme.textSecondary }]}>
        Choose a program that fits your goals
      </Text>

      {mockPrograms.map((program) => (
        <TouchableOpacity
          key={program.id}
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={() => {
            console.log('Open program', program.title);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${theme.tint}15` }]}>
              <Ionicons name={program.icon as keyof typeof Ionicons.glyphMap} size={24} color={theme.tint} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={[styles.title, { color: theme.text }]}>{program.title}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {program.days} days/week
                </Text>
                <Text style={[styles.metaSeparator, { color: theme.textSecondary }]}>•</Text>
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {program.exercises} exercises
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColors[program.difficulty]}20` }]}>
              <Text style={[styles.difficultyText, { color: difficultyColors[program.difficulty] }]}>
                {program.difficulty}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </View>
        </TouchableOpacity>
      ))}

      {/* Current Training Day */}
      <View style={styles.trainingDaySection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Current Training Day</Text>
        <View style={[styles.trainingDayCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* Training Day Header */}
          <View style={styles.trainingDayHeader}>
            <View style={styles.trainingDayHeaderLeft}>
              <Ionicons name="calendar-outline" size={20} color={theme.tint} />
              <View>
                <Text style={[styles.trainingDayName, { color: theme.text }]}>{mockTrainingDay.name}</Text>
                {mockTrainingDay.description && (
                  <Text style={[styles.trainingDayDescription, { color: theme.textSecondary }]}>
                    {mockTrainingDay.description}
                  </Text>
                )}
              </View>
            </View>
            <View style={[styles.exerciseCountBadge, { backgroundColor: `${theme.tint}15` }]}>
              <Text style={[styles.exerciseCountText, { color: theme.tint }]}>
                {mockTrainingDay.exercises?.length || 0}
              </Text>
            </View>
          </View>

          {/* Exercises List */}
          <View style={styles.exercisesList}>
            {mockTrainingDay.exercises?.map((exercise, index) => (
              <View key={exercise.id}>
                {index > 0 && <View style={[styles.exerciseDivider, { backgroundColor: theme.cardBorder }]} />}
                <TouchableOpacity
                  style={styles.exerciseItem}
                  onPress={() => setExpandedExercise(expandedExercise === exercise.id ? null : exercise.id)}
                  activeOpacity={0.7}
                >
                  {/* Exercise Header */}
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseHeaderLeft}>
                      {exercise.muscleCategory && (
                        <View
                          style={[
                            styles.muscleIconContainer,
                            { backgroundColor: `${muscleCategoryColors[exercise.muscleCategory]}20` },
                          ]}
                        >
                          <Ionicons
                            name={muscleCategoryIcons[exercise.muscleCategory] || 'fitness'}
                            size={18}
                            color={muscleCategoryColors[exercise.muscleCategory]}
                          />
                        </View>
                      )}
                      <View style={styles.exerciseInfo}>
                        <Text style={[styles.exerciseName, { color: theme.text }]}>{exercise.name}</Text>
                        <View style={styles.exerciseMeta}>
                          {exercise.muscleCategory && (
                            <Text style={[styles.exerciseMetaText, { color: theme.textSecondary }]}>
                              {exercise.muscleCategory}
                              {exercise.muscleSubcategory && ` • ${exercise.muscleSubcategory}`}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                    <Ionicons
                      name={expandedExercise === exercise.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={theme.textSecondary}
                    />
                  </View>

                  {/* Exercise Details (Expanded) */}
                  {expandedExercise === exercise.id && (
                    <View style={styles.exerciseDetails}>
                      {/* Target Details */}
                      <View style={styles.detailsGrid}>
                        {exercise.targetRepetitions && (
                          <View style={[styles.detailItem, { backgroundColor: theme.background }]}>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Target Reps</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>
                              {exercise.targetRepetitions}
                            </Text>
                          </View>
                        )}
                        {exercise.targetRepetitionsInReserve && (
                          <View style={[styles.detailItem, { backgroundColor: theme.background }]}>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Target RIR</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>
                              {exercise.targetRepetitionsInReserve}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Equipment & Position */}
                      {(exercise.equipment || exercise.targetPosition) && (
                        <View style={styles.tagsContainer}>
                          {exercise.equipment && (
                            <View style={[styles.tag, { backgroundColor: `${theme.tint}10` }]}>
                              <Ionicons name="barbell-outline" size={14} color={theme.tint} />
                              <Text style={[styles.tagText, { color: theme.tint }]}>{exercise.equipment}</Text>
                            </View>
                          )}
                          {exercise.targetPosition && (
                            <View style={[styles.tag, { backgroundColor: `${theme.tint}10` }]}>
                              <Ionicons name="resize-outline" size={14} color={theme.tint} />
                              <Text style={[styles.tagText, { color: theme.tint }]}>{exercise.targetPosition}</Text>
                            </View>
                          )}
                        </View>
                      )}

                      {/* Sets */}
                      {exercise.sets && exercise.sets.length > 0 && (
                        <View style={styles.setsContainer}>
                          <Text style={[styles.setsTitle, { color: theme.text }]}>
                            Sets ({exercise.sets.length})
                          </Text>
                          {exercise.sets.map((set, setIndex) => (
                            <View
                              key={set.id}
                              style={[styles.setItem, { backgroundColor: theme.background }]}
                            >
                              <Text style={[styles.setNumber, { color: theme.textSecondary }]}>
                                {setIndex + 1}
                              </Text>
                              <Text style={[styles.setText, { color: theme.text }]}>
                                {set.weight} {set.weightType} × {set.repetitions} reps
                              </Text>
                              {set.repetitionsInReserve !== undefined && (
                                <Text style={[styles.setRIR, { color: theme.textSecondary }]}>
                                  {set.repetitionsInReserve} RIR
                                </Text>
                              )}
                              {set.rateOfPerceivedExertion && (
                                <Text style={[styles.setRPE, { color: theme.tint }]}>
                                  RPE {set.rateOfPerceivedExertion}
                                </Text>
                              )}
                            </View>
                          ))}
                        </View>
                      )}

                      {exercise.notes && (
                        <Text style={[styles.exerciseNotes, { color: theme.textSecondary }]}>
                          Note: {exercise.notes}
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </View>
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
  heading: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '400',
  },
  metaSeparator: {
    fontSize: 14,
    marginHorizontal: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  trainingDaySection: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  trainingDayCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  trainingDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  trainingDayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  trainingDayName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  trainingDayDescription: {
    fontSize: 14,
    fontWeight: '400',
  },
  exerciseCountBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseCountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  exercisesList: {
    gap: 0,
  },
  exerciseDivider: {
    height: 1,
    marginVertical: 12,
  },
  exerciseItem: {
    gap: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  muscleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exerciseMetaText: {
    fontSize: 13,
    fontWeight: '400',
  },
  exerciseDetails: {
    marginTop: 12,
    gap: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  detailItem: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  setsContainer: {
    gap: 8,
  },
  setsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  setItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 8,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '600',
    width: 20,
  },
  setText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  setRIR: {
    fontSize: 12,
    fontWeight: '500',
  },
  setRPE: {
    fontSize: 12,
    fontWeight: '700',
  },
  exerciseNotes: {
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'italic',
  },
});
