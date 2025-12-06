import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { useActiveProgram } from '@/hooks/useActiveProgram';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';
import { useStats } from '@/hooks/useStats';
import { useWorkoutUI } from '@/contexts/WorkoutUIContext';
import WorkoutInterface from '@/components/workout/WorkoutInterface';

export default function HomePage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { customColors } = useThemeCustomization();
  const { isExpanded, expand, minimize } = useWorkoutUI();

  // Fetch data from storage
  const { program: activeProgram, loading: programLoading } = useActiveProgram();
  const { session, sessionHistory, startSession, completeSession, cancelSession, loading: sessionLoading } = useWorkoutSession();
  const { stats, incrementWorkouts, loading: statsLoading } = useStats();

  // Get next training day from active program
  const nextTrainingDay = useMemo(() => {
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
      await startSession(activeProgram.id, nextTrainingDay.id);
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
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
        >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome back!</Text>
        <Text style={[styles.userName, { color: theme.text }]}>Ready to train?</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: customColors.primaryButton }]}
          onPress={handleWorkoutButtonPress}
        >
          <Ionicons name={session ? "play" : "play-circle"} size={28} color={customColors.primaryButtonText} />
          <Text style={[styles.primaryButtonText, { color: customColors.primaryButtonText }]}>
            {session ? 'Resume Workout' : 'Start Workout'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={customColors.primaryButton} />
        </View>
      )}

      {/* Next on the menu */}
      {!loading && nextTrainingDay && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Next on the menu</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="barbell" size={24} color={customColors.primaryButton} />
              <View style={styles.cardHeaderText}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{nextTrainingDay.name}</Text>
                <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                  {nextTrainingDay.exercises?.length || 0} exercises • {nextTrainingDay.description || 'No description'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.cardButton, { backgroundColor: theme.background }]}>
              <Text style={[styles.cardButtonText, { color: customColors.primaryButton }]}>View Details</Text>
              <Ionicons name="chevron-forward" size={18} color={customColors.primaryButton} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Empty state for no active program */}
      {!loading && !nextTrainingDay && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Next on the menu</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>No active program</Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              Set an active program to see your next workout
            </Text>
          </View>
        </View>
      )}

      {/* Previous Sessions */}
      {!loading && (lastSession || previousInstanceOfToday) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Look back</Text>

          {/* Last Session */}
          {lastSession && (
            <View style={[styles.sessionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionHeaderLeft}>
                  <Ionicons name="checkmark-circle" size={20} color="#4ecdc4" />
                  <View>
                    <Text style={[styles.sessionLabel, { color: theme.textSecondary }]}>Last Session</Text>
                    <Text style={[styles.sessionName, { color: theme.text }]}>
                      {lastSession.exercises?.[0]?.exerciseName || 'Completed workout'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.sessionTime, { color: theme.textSecondary }]}>
                  {lastSession.completedAt ? new Date(lastSession.completedAt).toLocaleDateString() : 'Recent'}
                </Text>
              </View>
              {lastSession.exercises && lastSession.exercises[0] && (
                <View style={styles.sessionDetail}>
                  <Text style={[styles.sessionExercise, { color: theme.textSecondary }]}>
                    {lastSession.exercises[0].exerciseName} • {lastSession.exercises[0].sets?.length || 0} sets
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Last Time You Did This */}
          {previousInstanceOfToday && (
            <View style={[styles.sessionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionHeaderLeft}>
                  <Ionicons name="repeat" size={20} color="#ffd93d" />
                  <View>
                    <Text style={[styles.sessionLabel, { color: theme.textSecondary }]}>Last time you did this</Text>
                    <Text style={[styles.sessionName, { color: theme.text }]}>
                      {previousInstanceOfToday.exercises?.[0]?.exerciseName || 'Previous session'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.sessionTime, { color: theme.textSecondary }]}>
                  {previousInstanceOfToday.completedAt ? new Date(previousInstanceOfToday.completedAt).toLocaleDateString() : 'Previous'}
                </Text>
              </View>
              {previousInstanceOfToday.exercises && previousInstanceOfToday.exercises[0] && (
                <View style={styles.sessionDetail}>
                  <Text style={[styles.sessionExercise, { color: theme.textSecondary }]}>
                    {previousInstanceOfToday.exercises[0].exerciseName}
                  </Text>
                  {previousInstanceOfToday.exercises[0].sets && previousInstanceOfToday.exercises[0].sets[0] && (
                    <Text style={[styles.sessionPerformance, { color: theme.text }]}>
                      {previousInstanceOfToday.exercises[0].sets[0].weight} kg × {previousInstanceOfToday.exercises[0].sets[0].reps} reps
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Recent Activity */}
      {!loading && stats && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
          <View style={[styles.statsGrid]}>
            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Ionicons name="flame" size={28} color="#ff6b6b" />
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalWorkouts || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Workouts</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Ionicons name="calendar" size={28} color="#4ecdc4" />
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.currentStreak || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
            </View>
          </View>
        </View>
      )}
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
    padding: 20,
    paddingBottom: 100,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
  },
  quickActions: {
    marginBottom: 32,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 20,
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
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  cardButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  sessionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  sessionLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  sessionDetail: {
    marginLeft: 30,
    gap: 4,
  },
  sessionExercise: {
    fontSize: 13,
    fontWeight: '400',
  },
  sessionPerformance: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
});