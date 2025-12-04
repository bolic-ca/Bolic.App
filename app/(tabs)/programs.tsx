import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '@/constants/theme';
import type { TrainingExercise, Program, Mesocycle } from '@/types/training';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { usePrograms } from '@/hooks/usePrograms';
import { useActiveProgram } from '@/hooks/useActiveProgram';
import { useExercises } from '@/hooks/useExercises';
import { loadTemplate, getTemplateInfo } from '@/services/storage/template-loader';
import { useStorage } from '@/contexts/StorageContext';

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
  const { customColors } = useThemeCustomization();
  const { userId } = useStorage();
  const { programs, loading, error, deleteProgram, refetch: refetchPrograms } = usePrograms();
  const { program: activeProgram, loading: activeProgramLoading, clearActive, refetch: refetchActiveProgram } = useActiveProgram();
  const { exercises, loading: exercisesLoading, refetch: refetchExercises } = useExercises();
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [expandedMeso, setExpandedMeso] = useState<string | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const templates = getTemplateInfo();

  // Refetch data when screen comes into focus (e.g., after adding an exercise)
  useFocusEffect(
    useCallback(() => {
      const refetchData = async () => {
        try {
          await Promise.all([
            refetchPrograms(),
            refetchActiveProgram(),
            refetchExercises()
          ]);
        } catch (error) {
          console.error('Error refetching data on focus:', error);
        }
      };
      refetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleAddTemplate = async (templateIndex: number) => {
    try {
      setLoadingTemplate(true);
      await loadTemplate(userId, templateIndex);
      await refetchPrograms();
      Alert.alert('Success', 'Template program added!');
    } catch (err) {
      Alert.alert('Error', 'Failed to add template program');
      console.error('Error adding template:', err);
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleDeleteProgram = async (program: Program) => {
    Alert.alert(
      'Delete Program',
      `Are you sure you want to delete "${program.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // If this is the active program, clear it first
              if (program.isActive && activeProgram?.id === program.id) {
                await clearActive();
              }

              // Delete the program
              await deleteProgram(program.id);

              Alert.alert('Success', 'Program deleted successfully');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete program');
              console.error('Error deleting program:', err);
            }
          },
        },
      ]
    );
  };

  // Get current training day from active program
  const currentTrainingDay = useMemo(() => {
    if (!activeProgram) return null;

    // Simple program: get first training day
    if (activeProgram.type === 'simple' && activeProgram.trainingDays?.length > 0) {
      return activeProgram.trainingDays[0];
    }

    // Periodized program: get first training day from first microcycle
    if (activeProgram.type === 'periodized' && activeProgram.mesocycles?.length > 0) {
      const firstMeso = activeProgram.mesocycles[0];
      if (firstMeso.microcycles?.length > 0) {
        const firstMicro = firstMeso.microcycles[0];
        if (firstMicro.trainingDays?.length > 0) {
          return firstMicro.trainingDays[0];
        }
      }
    }

    return null;
  }, [activeProgram]);

  const renderProgramCard = (program: Program) => {
    const isExpanded = expandedProgram === program.id;
    const isSimple = program.type === 'simple';

    return (
      <TouchableOpacity
        key={program.id}
        style={[
          styles.programCard,
          { backgroundColor: theme.card, borderColor: theme.cardBorder },
          program.isActive && { borderColor: customColors.primaryButton, borderWidth: 2 },
        ]}
        onPress={() => setExpandedProgram(isExpanded ? null : program.id)}
        activeOpacity={0.7}
      >
        {/* Program Header */}
        <View style={styles.programHeader}>
          <View style={styles.programHeaderLeft}>
            <View style={[styles.programIconContainer, { backgroundColor: `${customColors.primaryButton}15` }]}>
              <Ionicons
                name={isSimple ? 'repeat' : 'calendar'}
                size={24}
                color={customColors.primaryButton}
              />
            </View>
            <View style={styles.programInfo}>
              <View style={styles.programTitleRow}>
                <Text style={[styles.programName, { color: theme.text }]}>{program.name}</Text>
                {program.isActive && (
                  <View style={[styles.activeBadge, { backgroundColor: customColors.primaryButton }]}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                  </View>
                )}
              </View>
              {program.description && (
                <Text style={[styles.programDescription, { color: theme.textSecondary }]}>
                  {program.description}
                </Text>
              )}
              <View style={styles.programTags}>
                <View style={[styles.programTypeBadge, { backgroundColor: isSimple ? '#4ecdc420' : '#a29bfe20' }]}>
                  <Text style={[styles.programTypeText, { color: isSimple ? '#4ecdc4' : '#a29bfe' }]}>
                    {isSimple ? 'Simple' : 'Periodized'}
                  </Text>
                </View>
                {program.tags?.map((tag, i) => (
                  <Text key={i} style={[styles.programTag, { color: theme.textSecondary }]}>
                    {tag}
                  </Text>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.programHeaderActions}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteProgram(program);
              }}
              style={styles.deleteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="trash-outline"
                size={22}
                color="#ff6b6b"
              />
            </TouchableOpacity>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={theme.textSecondary}
            />
          </View>
        </View>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.programDetails}>
            {isSimple ? (
              // Simple Program: Just show training days
              <View style={styles.trainingDaysList}>
                <Text style={[styles.detailsLabel, { color: theme.text }]}>
                  Training Days ({program.trainingDays?.length || 0})
                </Text>
                <Text style={[styles.scheduleNote, { color: theme.textSecondary }]}>
                  {program.schedule === 'rotating' ? 'Rotating schedule - repeat these days in order' : 'Weekly schedule'}
                </Text>
                {program.trainingDays?.map((day, index) => (
                  <View key={day.id} style={[styles.dayCard, { backgroundColor: theme.background }]}>
                    <View>
                      <Text style={[styles.dayNumber, { color: theme.textSecondary }]}>
                        Day {index + 1}
                      </Text>
                      <Text style={[styles.dayName, { color: theme.text }]}>{day.name}</Text>
                    </View>
                    <Text style={[styles.dayDescription, { color: theme.textSecondary }]}>
                      {day.description}
                    </Text>
                    <Text style={[styles.dayExerciseCount, { color: theme.textSecondary }]}>
                      {day.exercises?.length || 0} exercises
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              // Periodized Program: Show mesocycles
              <View style={styles.mesocyclesList}>
                <Text style={[styles.detailsLabel, { color: theme.text }]}>
                  Training Phases ({program.mesocycles?.length || 0})
                </Text>
                {program.mesocycles?.map((meso, mesoIndex) => (
                  <View key={meso.id} style={styles.mesocycleSection}>
                    <TouchableOpacity
                      style={[styles.mesocycleCard, { backgroundColor: theme.background }]}
                      onPress={() => setExpandedMeso(expandedMeso === meso.id ? null : meso.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.mesocycleHeader}>
                        <View style={styles.mesocycleHeaderLeft}>
                          <Text style={[styles.mesocycleNumber, { color: theme.textSecondary }]}>
                            Phase {mesoIndex + 1}
                          </Text>
                          <Text style={[styles.mesocycleName, { color: theme.text }]}>{meso.name}</Text>
                        </View>
                        <Ionicons
                          name={expandedMeso === meso.id ? 'remove-circle-outline' : 'add-circle-outline'}
                          size={24}
                          color={customColors.primaryButton}
                        />
                      </View>
                      {meso.description && (
                        <Text style={[styles.mesocycleDescription, { color: theme.textSecondary }]}>
                          {meso.description}
                        </Text>
                      )}
                      <View style={styles.mesocycleMeta}>
                        {meso.goal && (
                          <View style={[styles.mesoMetaItem, { backgroundColor: `${customColors.primaryButton}10` }]}>
                            <Ionicons name="flag-outline" size={14} color={customColors.primaryButton} />
                            <Text style={[styles.mesoMetaText, { color: customColors.primaryButton }]}>{meso.goal}</Text>
                          </View>
                        )}
                        {meso.durationWeeks && (
                          <View style={[styles.mesoMetaItem, { backgroundColor: `${customColors.primaryButton}10` }]}>
                            <Ionicons name="time-outline" size={14} color={customColors.primaryButton} />
                            <Text style={[styles.mesoMetaText, { color: customColors.primaryButton }]}>
                              {meso.durationWeeks} weeks
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Expanded Mesocycle: Show Microcycles */}
                      {expandedMeso === meso.id && meso.microcycles.length > 0 && (
                        <View style={styles.microcyclesList}>
                          <Text style={[styles.microLabel, { color: theme.text }]}>
                            Weeks ({meso.microcycles.length})
                          </Text>
                          {meso.microcycles.map((micro) => (
                            <View key={micro.id} style={[styles.microCard, { borderColor: theme.cardBorder }]}>
                              <Text style={[styles.microWeek, { color: theme.text }]}>
                                Week {micro.weekNumber}
                              </Text>
                              <View style={styles.microMeta}>
                                <Text style={[styles.microMetaText, { color: theme.textSecondary }]}>
                                  Volume: {micro.volumeTarget} • Intensity: {micro.intensityTarget}
                                </Text>
                              </View>
                              <Text style={[styles.microDays, { color: theme.textSecondary }]}>
                                {micro.trainingDays.length} training days
                              </Text>
                              {/* Training Days within Microcycle */}
                              {micro.trainingDays?.map((day, dayIndex) => (
                                <View key={day.id} style={[styles.dayCard, { backgroundColor: theme.card, marginTop: 8 }]}>
                                  <View>
                                    <Text style={[styles.dayNumber, { color: theme.textSecondary }]}>
                                      Day {dayIndex + 1}
                                    </Text>
                                    <Text style={[styles.dayName, { color: theme.text }]}>{day.name}</Text>
                                  </View>
                                  <Text style={[styles.dayDescription, { color: theme.textSecondary }]}>
                                    {day.description}
                                  </Text>
                                  <Text style={[styles.dayExerciseCount, { color: theme.textSecondary }]}>
                                    {day.exercises?.length || 0} exercises
                                  </Text>
                                </View>
                              ))}
                            </View>
                          ))}
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
      <View style={styles.headerSection}>
        <Text style={[styles.heading, { color: theme.text }]}>Training Programs</Text>
        <Text style={[styles.subheading, { color: theme.textSecondary }]}>
          Simple or periodized - choose what works for you
        </Text>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={customColors.primaryButton} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading programs...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={[styles.errorText, { color: theme.text }]}>{error.message}</Text>
        </View>
      )}

      {/* Template Programs Section */}
      {!loading && !error && (
        <View style={styles.templatesSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Program Templates</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Start with a pre-built program
          </Text>
          <View style={styles.templatesGrid}>
            {templates.map((template, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.templateCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => handleAddTemplate(index)}
                disabled={loadingTemplate}
                activeOpacity={0.7}
              >
                <View style={[styles.templateIconContainer, { backgroundColor: `${customColors.primaryButton}15` }]}>
                  <Ionicons
                    name={template.type === 'simple' ? 'repeat' : 'calendar'}
                    size={28}
                    color={customColors.primaryButton}
                  />
                </View>
                <Text style={[styles.templateName, { color: theme.text }]}>{template.name}</Text>
                <Text style={[styles.templateDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                  {template.description}
                </Text>
                <View style={styles.templateTags}>
                  {template.tags?.slice(0, 2).map((tag, i) => (
                    <View key={i} style={[styles.templateTag, { backgroundColor: `${customColors.primaryButton}10` }]}>
                      <Text style={[styles.templateTagText, { color: customColors.primaryButton }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={[styles.addButton, { backgroundColor: customColors.primaryButton }]}>
                  <Ionicons name="add" size={16} color="white" />
                  <Text style={styles.addButtonText}>Add Program</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Full Programs Section */}
      {!loading && !error && programs.length > 0 && (
        <View style={styles.fullProgramsSection}>
          {programs.map((program) => renderProgramCard(program))}
        </View>
      )}

      {/* Current Training Day */}
      {currentTrainingDay && (
        <View style={styles.trainingDaySection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Current Training Day</Text>
          <View style={[styles.trainingDayCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            {/* Training Day Header */}
            <View style={styles.trainingDayHeader}>
              <View style={styles.trainingDayHeaderLeft}>
                <Ionicons name="calendar-outline" size={20} color={customColors.primaryButton} />
                <View>
                  <Text style={[styles.trainingDayName, { color: theme.text }]}>{currentTrainingDay.name}</Text>
                  {currentTrainingDay.description && (
                    <Text style={[styles.trainingDayDescription, { color: theme.textSecondary }]}>
                      {currentTrainingDay.description}
                    </Text>
                  )}
                </View>
              </View>
              <View style={[styles.exerciseCountBadge, { backgroundColor: `${customColors.primaryButton}15` }]}>
                <Text style={[styles.exerciseCountText, { color: customColors.primaryButton }]}>
                  {currentTrainingDay.exercises?.length || 0}
                </Text>
              </View>
            </View>

            {/* Exercises List */}
            <View style={styles.exercisesList}>
              {currentTrainingDay.exercises?.map((exercise: TrainingExercise, index: number) => (
              <View key={exercise.id}>
                {index > 0 && <View style={[styles.exerciseDivider, { backgroundColor: theme.cardBorder }]} />}
                <TouchableOpacity
                  style={styles.exerciseItem}
                  onPress={() => setExpandedExercise(expandedExercise === exercise.id ? null : (exercise.id ?? null))}
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
                            <View style={[styles.tag, { backgroundColor: `${customColors.primaryButton}10` }]}>
                              <Ionicons name="barbell-outline" size={14} color={customColors.primaryButton} />
                              <Text style={[styles.tagText, { color: customColors.primaryButton }]}>{exercise.equipment}</Text>
                            </View>
                          )}
                          {exercise.targetPosition && (
                            <View style={[styles.tag, { backgroundColor: `${customColors.primaryButton}10` }]}>
                              <Ionicons name="resize-outline" size={14} color={customColors.primaryButton} />
                              <Text style={[styles.tagText, { color: customColors.primaryButton }]}>{exercise.targetPosition}</Text>
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
                          {exercise.sets.map((set: any, setIndex: number) => (
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
                                <Text style={[styles.setRPE, { color: customColors.primaryButton }]}>
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
      )}

      {/* Exercise Library */}
      <View style={styles.exerciseLibrarySection}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Exercise Library</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              All your exercises ({exercises.length})
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addExerciseToLibraryButton, { backgroundColor: customColors.primaryButton }]}
            onPress={() => router.push('/exercise-form')}
          >
            <Ionicons name="add-circle" size={20} color="white" />
            <Text style={styles.addExerciseToLibraryButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {exercisesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={customColors.primaryButton} />
          </View>
        ) : exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
              No exercises yet. Add your first exercise!
            </Text>
          </View>
        ) : (
          <View style={styles.exerciseLibraryList}>
            {exercises.map((exercise, index) => (
              <TouchableOpacity
                key={exercise.id}
                style={[styles.exerciseLibraryCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                activeOpacity={0.7}
              >
                <View style={styles.exerciseLibraryCardHeader}>
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
                  <View style={styles.exerciseLibraryCardInfo}>
                    <Text style={[styles.exerciseLibraryCardName, { color: theme.text }]}>
                      {exercise.name}
                    </Text>
                    <View style={styles.exerciseLibraryCardMeta}>
                      {exercise.muscleCategory && (
                        <Text style={[styles.exerciseLibraryCardMetaText, { color: theme.textSecondary }]}>
                          {exercise.muscleCategory}
                          {exercise.muscleSubcategory && ` • ${exercise.muscleSubcategory}`}
                        </Text>
                      )}
                    </View>
                    {exercise.equipment && (
                      <View style={styles.exerciseLibraryCardTags}>
                        <View style={[styles.equipmentTag, { backgroundColor: `${customColors.primaryButton}10` }]}>
                          <Ionicons name="barbell" size={12} color={customColors.primaryButton} />
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
    marginBottom: 16,
  },
  trainingDaySection: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  // New Program Structure Styles
  fullProgramsSection: {
    gap: 16,
    marginBottom: 24,
  },
  programCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  programHeaderLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  programHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  programIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  programInfo: {
    flex: 1,
  },
  programTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  programName: {
    fontSize: 18,
    fontWeight: '700',
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  programDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  programTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  programTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  programTypeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  programTag: {
    fontSize: 13,
  },
  programDetails: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  detailsLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  scheduleNote: {
    fontSize: 13,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  trainingDaysList: {
    gap: 10,
  },
  dayCard: {
    padding: 14,
    borderRadius: 12,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayDescription: {
    fontSize: 13,
    marginBottom: 6,
  },
  dayExerciseCount: {
    fontSize: 12,
  },
  mesocyclesList: {
    gap: 12,
  },
  mesocycleSection: {
    marginTop: 4,
  },
  mesocycleCard: {
    padding: 16,
    borderRadius: 12,
  },
  mesocycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mesocycleHeaderLeft: {
    flex: 1,
  },
  mesocycleNumber: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  mesocycleName: {
    fontSize: 16,
    fontWeight: '700',
  },
  mesocycleDescription: {
    fontSize: 13,
    marginBottom: 10,
  },
  mesocycleMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mesoMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mesoMetaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  microcyclesList: {
    marginTop: 14,
    gap: 8,
  },
  microLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  microCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  microWeek: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  microMeta: {
    marginBottom: 4,
  },
  microMetaText: {
    fontSize: 12,
  },
  microDays: {
    fontSize: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  templatesSection: {
    marginBottom: 32,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  templatesGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  templateCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  templateIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  templateDescription: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  templateTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  templateTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  templateTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseLibrarySection: {
    marginTop: 24,
    marginBottom: 16,
  },
  addExerciseToLibraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addExerciseToLibraryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseLibraryList: {
    gap: 12,
    marginTop: 16,
  },
  exerciseLibraryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  exerciseLibraryCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  exerciseLibraryCardInfo: {
    flex: 1,
  },
  exerciseLibraryCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseLibraryCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  exerciseLibraryCardMetaText: {
    fontSize: 13,
  },
  exerciseLibraryCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  equipmentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  equipmentTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
