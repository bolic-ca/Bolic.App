import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { useProgramWizard } from '@/contexts/ProgramWizardContext';
import { MuscleCategory } from '@/types/training';
import { muscleCategoryColorsTailwind as muscleCategoryColors } from '@/constants/muscle-categories';

export default function PreviewScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { customColors } = useThemeCustomization();
  const { state, saveProgram, canSave, isSaving } = useProgramWizard();

  const [expandedMicrocycle, setExpandedMicrocycle] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

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

  // Calculate stats
  const stats = useMemo(() => {
    let totalDays = 0;
    let totalExercises = 0;

    state.microcycles.forEach(micro => {
      totalDays += micro.trainingDays.length;
      micro.trainingDays.forEach(day => {
        totalExercises += day.exercises.length;
      });
    });

    return {
      weeks: state.microcycles.length,
      days: totalDays,
      exercises: totalExercises,
    };
  }, [state.microcycles]);

  const handleSave = async () => {
    await saveProgram();
  };

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
          <Text style={[styles.headerLabel, { color: palette.textMuted }]}>STEP 3</Text>
          <Text style={[styles.headerTitle, { color: palette.text }]}>Preview</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, { backgroundColor: palette.accent }]} />
        <View style={[styles.stepLine, { backgroundColor: palette.accent }]} />
        <View style={[styles.stepDot, { backgroundColor: palette.accent }]} />
        <View style={[styles.stepLine, { backgroundColor: palette.accent }]} />
        <View style={[styles.stepDot, { backgroundColor: palette.accent }]} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Program Summary */}
        <View style={[styles.summaryCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
          <View style={styles.summaryHeader}>
            <View style={[styles.programIcon, { backgroundColor: palette.accentGlow }]}>
              <Ionicons name="calendar" size={24} color={palette.accent} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={[styles.programName, { color: palette.text }]} numberOfLines={1}>
                {state.name || 'Untitled Program'}
              </Text>
              {state.goal && (
                <View style={[styles.goalBadge, { backgroundColor: palette.accentGlow }]}>
                  <Text style={[styles.goalBadgeText, { color: palette.accent }]}>{state.goal}</Text>
                </View>
              )}
            </View>
          </View>
          {state.description && (
            <Text style={[styles.programDescription, { color: palette.textMuted }]} numberOfLines={2}>
              {state.description}
            </Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
            <Ionicons name="calendar-outline" size={20} color={palette.accent} />
            <Text style={[styles.statValue, { color: palette.text }]}>{stats.weeks}</Text>
            <Text style={[styles.statLabel, { color: palette.textMuted }]}>Weeks</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
            <Ionicons name="sunny-outline" size={20} color={palette.accent} />
            <Text style={[styles.statValue, { color: palette.text }]}>{stats.days}</Text>
            <Text style={[styles.statLabel, { color: palette.textMuted }]}>Days</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
            <Ionicons name="barbell-outline" size={20} color={palette.accent} />
            <Text style={[styles.statValue, { color: palette.text }]}>{stats.exercises}</Text>
            <Text style={[styles.statLabel, { color: palette.textMuted }]}>Exercises</Text>
          </View>
        </View>

        {/* Program Structure */}
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Program Structure</Text>

        {state.microcycles.map((microcycle) => {
          const isExpanded = expandedMicrocycle === microcycle.tempId;

          return (
            <View key={microcycle.tempId} style={[styles.microcycleCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
              <TouchableOpacity
                style={styles.microcycleHeader}
                onPress={() => setExpandedMicrocycle(isExpanded ? null : microcycle.tempId)}
                activeOpacity={0.8}
              >
                <View style={styles.microcycleHeaderLeft}>
                  <View style={[styles.weekBadge, { backgroundColor: palette.accentGlow }]}>
                    <Text style={[styles.weekBadgeText, { color: palette.accent }]}>W{microcycle.weekNumber}</Text>
                  </View>
                  <View>
                    <Text style={[styles.weekName, { color: palette.text }]}>{microcycle.name}</Text>
                    <Text style={[styles.weekMeta, { color: palette.textMuted }]}>
                      {microcycle.trainingDays.length} training day{microcycle.trainingDays.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={palette.textMuted} />
              </TouchableOpacity>

              {isExpanded && (
                <View style={[styles.expandedContent, { borderTopColor: palette.cardBorder }]}>
                  {microcycle.trainingDays.map((day) => {
                    const isDayExpanded = expandedDay === day.tempId;

                    return (
                      <View key={day.tempId}>
                        <TouchableOpacity
                          style={[styles.trainingDayRow, { borderBottomColor: palette.cardBorder }]}
                          onPress={() => setExpandedDay(isDayExpanded ? null : day.tempId)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.dayLeft}>
                            <View style={[styles.dayIcon, { backgroundColor: isDark ? '#1A1A1D' : '#F4F4F5' }]}>
                              <Ionicons name="barbell-outline" size={16} color={palette.text} />
                            </View>
                            <View>
                              <Text style={[styles.dayName, { color: palette.text }]}>{day.name}</Text>
                              <Text style={[styles.dayMeta, { color: palette.textMuted }]}>
                                {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
                              </Text>
                            </View>
                          </View>
                          <Ionicons name={isDayExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={palette.textMuted} />
                        </TouchableOpacity>

                        {isDayExpanded && day.exercises.length > 0 && (
                          <View style={styles.exercisesList}>
                            {day.exercises.map((exercise, exIndex) => {
                              const categoryColor = exercise.muscleCategory
                                ? muscleCategoryColors[exercise.muscleCategory as MuscleCategory] || palette.textMuted
                                : palette.textMuted;

                              return (
                                <View key={exercise.id || exIndex} style={styles.exerciseRow}>
                                  <View style={[styles.exerciseDot, { backgroundColor: categoryColor }]} />
                                  <Text style={[styles.exerciseName, { color: palette.text }]} numberOfLines={1}>
                                    {exercise.name || 'Unnamed'}
                                  </Text>
                                  {exercise.muscleCategory && (
                                    <Text style={[styles.exerciseCategory, { color: categoryColor }]}>
                                      {exercise.muscleCategory}
                                    </Text>
                                  )}
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  })}

                  {microcycle.trainingDays.length === 0 && (
                    <Text style={[styles.emptyText, { color: palette.textMuted }]}>
                      No training days added
                    </Text>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { shadowColor: palette.success },
            !canSave() && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!canSave() || isSaving}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={canSave()
              ? [palette.success, hexToRgba(palette.success, 0.85)]
              : [palette.cardBorder, palette.cardBorder]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <View style={styles.saveButtonIcon}>
                  <Ionicons name="checkmark" size={22} color="#FFF" />
                </View>
                <Text style={styles.saveButtonText}>Create Program</Text>
                <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {!canSave() && (
          <Text style={[styles.helperText, { color: palette.textMuted }]}>
            Add at least one training day to save
          </Text>
        )}
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepLine: {
    width: 32,
    height: 2,
    borderRadius: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  summaryCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryInfo: {
    flex: 1,
    marginLeft: 14,
  },
  programName: {
    fontSize: 18,
    fontWeight: '700',
  },
  goalBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  goalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  programDescription: {
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
    gap: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  microcycleCard: {
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  microcycleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  microcycleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weekBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  weekName: {
    fontSize: 15,
    fontWeight: '600',
  },
  weekMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  expandedContent: {
    borderTopWidth: 1,
  },
  trainingDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  dayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dayIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayMeta: {
    fontSize: 11,
    marginTop: 1,
  },
  exercisesList: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    paddingLeft: 52,
    gap: 6,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  exerciseName: {
    flex: 1,
    fontSize: 13,
  },
  exerciseCategory: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 13,
    padding: 14,
    fontStyle: 'italic',
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  saveButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  saveButtonText: {
    flex: 1,
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  helperText: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 12,
  },
});
