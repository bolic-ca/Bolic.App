import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WorkoutSession } from '@/services/storage/session-storage';
import type { TrainingDay } from '@/types/training';
import { useActiveProgram } from '@/hooks/useActiveProgram';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';
import { useStats } from '@/hooks/useStats';
import { useWorkoutUI } from '@/contexts/WorkoutUIContext';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import WorkoutInterface from '@/components/workout/WorkoutInterface';

export default function HomePage() {
  const colorScheme = useColorScheme();
  const { isExpanded, expand, minimize } = useWorkoutUI();
  const { customColors } = useThemeCustomization();

  // Fetch data from storage
  const { program: activeProgram, loading: programLoading, refetch: refetchActiveProgram } = useActiveProgram();
  const { session, sessionHistory, startSession, completeSession, cancelSession, loading: sessionLoading } = useWorkoutSession();
  const { stats, incrementWorkouts, loading: statsLoading } = useStats();

  // Refetch active program when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetchActiveProgram();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // Get next training day from active program based on session history
  const nextTrainingDay = useMemo(() => {
    if (!activeProgram) return null;

    // Get all training days for the program
    let trainingDays: any[] = [];
    if (activeProgram.type === 'simple' && activeProgram.trainingDays?.length > 0) {
      trainingDays = activeProgram.trainingDays;
    } else if (activeProgram.type === 'periodized' && activeProgram.mesocycles?.length > 0) {
      // For periodized, flatten all training days from all microcycles
      for (const meso of activeProgram.mesocycles) {
        if (meso.microcycles) {
          for (const micro of meso.microcycles) {
            if (micro.trainingDays) {
              trainingDays.push(...micro.trainingDays);
            }
          }
        }
      }
    }

    if (trainingDays.length === 0) return null;

    // Find last completed session for this program
    const lastProgramSession = sessionHistory?.find(
      s => s.programId === activeProgram.id
    );

    if (!lastProgramSession) {
      // No previous sessions, start with first training day
      return trainingDays[0];
    }

    // Find the index of the last completed training day
    const lastIndex = trainingDays.findIndex(
      td => td.id === lastProgramSession.trainingDayId
    );

    if (lastIndex === -1) {
      // Last session's training day not found, start with first
      return trainingDays[0];
    }

    // Return next training day in rotation (wrap around)
    const nextIndex = (lastIndex + 1) % trainingDays.length;
    return trainingDays[nextIndex];
  }, [activeProgram, sessionHistory]);

  // Find training day for active session from the program structure
  const activeTrainingDay = useMemo(() => {
    if (!session || !activeProgram) return null;

    const findTrainingDay = (trainingDayId: string) => {
      // Search in simple program
      if (activeProgram.type === 'simple' && activeProgram.trainingDays) {
        const found = activeProgram.trainingDays.find(td => td.id === trainingDayId);
        if (found) return found;
      }

      // Search in periodized program
      if (activeProgram.type === 'periodized' && activeProgram.mesocycles) {
        for (const meso of activeProgram.mesocycles) {
          if (meso.microcycles) {
            for (const micro of meso.microcycles) {
              if (micro.trainingDays) {
                const found = micro.trainingDays.find(td => td.id === trainingDayId);
                if (found) return found;
              }
            }
          }
        }
      }

      return null;
    };

    return findTrainingDay(session.trainingDayId);
  }, [session, activeProgram]);

  // Get last completed session
  const lastSession = useMemo(() => {
    return sessionHistory && sessionHistory.length > 0 ? sessionHistory[0] : null;
  }, [sessionHistory]);

  // Get previous instance of next training day (if available)
  const previousInstanceOfToday = useMemo(() => {
    if (!nextTrainingDay || !sessionHistory) return null;

    // Find most recent session that matches the next training day
    return sessionHistory.find(
      (session) => session.trainingDayId === nextTrainingDay.id
    ) || null;
  }, [nextTrainingDay, sessionHistory]);

  const loading = programLoading || sessionLoading || statsLoading;

  const handleWorkoutButtonPress = async () => {
    // If there's already a session, just expand the interface
    if (session) {
      expand();
      return;
    }

    if (!activeProgram) {
      Alert.alert(
        'No Active Program',
        'Please set an active program in the Programs tab before starting a workout.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!nextTrainingDay) {
      Alert.alert(
        'No Training Day',
        'Your active program doesn\'t have any training days configured.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await startSession(activeProgram.id, nextTrainingDay.id, nextTrainingDay.name);
      expand();
    } catch (err) {
      Alert.alert('Error', 'Failed to start workout session');
      console.error('Error starting workout:', err);
    }
  };

  const handleCompleteWorkout = async (notes?: string) => {
    try {
      await completeSession(notes);

      // Update stats
      await incrementWorkouts();

      Alert.alert('Workout Complete!', 'Great job! Your progress has been saved.');
    } catch (err) {
      Alert.alert('Error', 'Failed to complete workout');
      console.error('Error completing workout:', err);
    }
  };

  const handleCancelWorkout = async () => {
    Alert.alert(
      'Cancel Workout?',
      'Are you sure? Your progress will be lost.',
      [
        { text: 'Keep Training', style: 'cancel' },
        {
          text: 'Cancel Workout',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSession();
              minimize(); // Minimize after canceling
            } catch {
              Alert.alert('Error', 'Failed to cancel workout');
            }
          },
        },
      ]
    );
  };

  const handleMinimizeWorkout = () => {
    minimize();
  };

  const handleViewSession = useCallback((sessionData: WorkoutSession) => {
    router.push({
      pathname: '/session-detail',
      params: { session: JSON.stringify(sessionData) },
    });
  }, []);

  const handleViewTrainingDay = useCallback((trainingDay: TrainingDay) => {
    router.push({
      pathname: '/training-day-detail',
      params: { trainingDay: JSON.stringify(trainingDay) },
    });
  }, []);

  const isDark = colorScheme === 'dark';

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Athletic color palette - uses customColors from settings
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
    streak: '#FACC15',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
      {session && isExpanded ? (
        <WorkoutInterface
          session={session}
          trainingDay={activeTrainingDay}
          loading={false}
          onComplete={handleCompleteWorkout}
          onCancel={handleCancelWorkout}
          onMinimize={handleMinimizeWorkout}
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Day + Status Badge */}
          <View style={styles.header}>
            <Text style={[styles.headerDay, { color: palette.textMuted }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5', borderColor: palette.cardBorder }]}>
              <View style={[styles.statusDot, { backgroundColor: session ? palette.success : palette.accent }]} />
              <Text style={[styles.statusText, { color: palette.textMuted }]}>
                {session ? 'Active' : 'Ready'}
              </Text>
            </View>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, { color: palette.text }]}>
              {session ? 'Session\nActive' : 'Ready to\nTrain?'}
            </Text>

            {/* Decorative diagonal accent */}
            <View style={[styles.heroAccent, { backgroundColor: palette.accentGlow }]}>
              <View style={[styles.heroAccentInner, { backgroundColor: palette.accent }]} />
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[styles.primaryAction, { shadowColor: palette.accent }]}
            onPress={handleWorkoutButtonPress}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[palette.accent, hexToRgba(palette.accent, 0.85)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryActionGradient}
            >
              <View style={styles.primaryActionContent}>
                <View style={styles.primaryActionIcon}>
                  <Ionicons name={session ? "play" : "flash"} size={32} color="#FFF" />
                </View>
                <View style={styles.primaryActionText}>
                  <Text style={styles.primaryActionTitle}>
                    {session ? 'Resume Workout' : 'Start Workout'}
                  </Text>
                  {nextTrainingDay && !session && (
                    <Text style={styles.primaryActionSubtitle}>
                      {nextTrainingDay.name}
                    </Text>
                  )}
                </View>
                <Ionicons name="arrow-forward" size={24} color="rgba(255,255,255,0.7)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={palette.accent} />
            </View>
          )}

          {/* Stats Row */}
          {!loading && stats && (
            <View style={styles.statsRow}>
              <View style={[styles.statPill, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
                <View style={[styles.statIconBg, { backgroundColor: hexToRgba(palette.accent, 0.12) }]}>
                  <Ionicons name="flame" size={18} color={palette.accent} />
                </View>
                <View>
                  <Text style={[styles.statValue, { color: palette.text }]}>{stats.totalWorkouts || 0}</Text>
                  <Text style={[styles.statLabel, { color: palette.textMuted }]}>workouts</Text>
                </View>
              </View>
              <View style={[styles.statPill, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
                <View style={[styles.statIconBg, { backgroundColor: 'rgba(250, 204, 21, 0.12)' }]}>
                  <Ionicons name="trending-up" size={18} color={palette.streak} />
                </View>
                <View>
                  <Text style={[styles.statValue, { color: palette.text }]}>{stats.currentStreak || 0}</Text>
                  <Text style={[styles.statLabel, { color: palette.textMuted }]}>day streak</Text>
                </View>
              </View>
            </View>
          )}

          {/* Up Next Section */}
          {!loading && nextTrainingDay && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionBadge, { backgroundColor: palette.accentGlow }]}>
                  <Text style={[styles.sectionBadgeText, { color: palette.accent }]}>UP NEXT</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.upNextCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}
                onPress={() => handleViewTrainingDay(nextTrainingDay)}
                activeOpacity={0.8}
              >
                <View style={styles.upNextContent}>
                  <View style={[styles.upNextIconContainer, { backgroundColor: palette.accentGlow }]}>
                    <Ionicons name="barbell-outline" size={28} color={palette.accent} />
                  </View>
                  <View style={styles.upNextDetails}>
                    <Text style={[styles.upNextTitle, { color: palette.text }]} numberOfLines={1}>
                      {nextTrainingDay.name}
                    </Text>
                    <Text style={[styles.upNextMeta, { color: palette.textMuted }]}>
                      {nextTrainingDay.exercises?.length || 0} exercises
                      {nextTrainingDay.description ? ` · ${nextTrainingDay.description}` : ''}
                    </Text>
                  </View>
                  <View style={[styles.upNextArrow, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}>
                    <Ionicons name="chevron-forward" size={20} color={palette.textMuted} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty state for no active program */}
          {!loading && !nextTrainingDay && (
            <View style={styles.section}>
              <View style={[styles.emptyCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
                <View style={[styles.emptyIconContainer, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}>
                  <Ionicons name="calendar-outline" size={32} color={palette.textMuted} />
                </View>
                <Text style={[styles.emptyTitle, { color: palette.text }]}>No Program Selected</Text>
                <Text style={[styles.emptyDescription, { color: palette.textMuted }]}>
                  Set an active program to see your next workout
                </Text>
                <TouchableOpacity
                  style={[styles.emptyAction, { backgroundColor: palette.accentGlow }]}
                  onPress={() => router.push('/(tabs)/programs')}
                >
                  <Text style={[styles.emptyActionText, { color: palette.accent }]}>Browse Programs</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* History Section */}
          {!loading && (lastSession || previousInstanceOfToday) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: palette.text }]}>History</Text>
              </View>

              {/* Last Session */}
              {lastSession && (
                <TouchableOpacity
                  style={[styles.historyCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}
                  onPress={() => handleViewSession(lastSession)}
                  activeOpacity={0.8}
                >
                  <View style={styles.historyCardContent}>
                    <View style={[styles.historyIndicator, { backgroundColor: palette.success }]} />
                    <View style={styles.historyDetails}>
                      <Text style={[styles.historyLabel, { color: palette.textMuted }]}>Last Completed</Text>
                      <Text style={[styles.historyTitle, { color: palette.text }]} numberOfLines={1}>
                        {lastSession.name || 'Workout'}
                      </Text>
                      <Text style={[styles.historyMeta, { color: palette.textMuted }]}>
                        {lastSession.exercises?.length || 0} exercises · {lastSession.exercises?.reduce((total, ex) => total + (ex.sets?.length || 0), 0) || 0} sets
                      </Text>
                    </View>
                    <View style={styles.historyTime}>
                      <Text style={[styles.historyTimeText, { color: palette.textMuted }]}>
                        {lastSession.completedAt ? new Date(lastSession.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {/* Last Time You Did This */}
              {previousInstanceOfToday && (
                <TouchableOpacity
                  style={[styles.historyCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}
                  onPress={() => handleViewSession(previousInstanceOfToday)}
                  activeOpacity={0.8}
                >
                  <View style={styles.historyCardContent}>
                    <View style={[styles.historyIndicator, { backgroundColor: palette.streak }]} />
                    <View style={styles.historyDetails}>
                      <Text style={[styles.historyLabel, { color: palette.textMuted }]}>Previous {nextTrainingDay?.name}</Text>
                      <Text style={[styles.historyTitle, { color: palette.text }]} numberOfLines={1}>
                        {previousInstanceOfToday.name || 'Workout'}
                      </Text>
                      <Text style={[styles.historyMeta, { color: palette.textMuted }]}>
                        {previousInstanceOfToday.exercises?.length || 0} exercises · {previousInstanceOfToday.exercises?.reduce((total, ex) => total + (ex.sets?.length || 0), 0) || 0} sets
                      </Text>
                    </View>
                    <View style={styles.historyTime}>
                      <Text style={[styles.historyTimeText, { color: palette.textMuted }]}>
                        {previousInstanceOfToday.completedAt ? new Date(previousInstanceOfToday.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Previous'}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Bottom Spacer */}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerDay: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Hero Section
  heroSection: {
    paddingTop: 8,
    paddingBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 46,
    letterSpacing: -1.5,
  },
  heroAccent: {
    position: 'absolute',
    top: -20,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroAccentInner: {
    width: 8,
    height: 60,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
  },

  // Primary Action Button
  primaryAction: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryActionGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  primaryActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  primaryActionText: {
    flex: 1,
  },
  primaryActionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  primaryActionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // Up Next Card
  upNextCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  upNextContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  upNextIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  upNextDetails: {
    flex: 1,
  },
  upNextTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  upNextMeta: {
    fontSize: 13,
    fontWeight: '500',
  },
  upNextArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyAction: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // History Cards
  historyCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  historyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  historyIndicator: {
    width: 4,
    height: 44,
    borderRadius: 2,
    marginRight: 14,
  },
  historyDetails: {
    flex: 1,
  },
  historyLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  historyMeta: {
    fontSize: 13,
    fontWeight: '500',
  },
  historyTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyTimeText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
});
