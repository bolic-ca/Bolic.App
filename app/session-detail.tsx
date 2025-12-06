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
import { WorkoutSession, SessionExercise } from '@/services/storage/session-storage';

export default function SessionDetailModal() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { customColors } = useThemeCustomization();
  const params = useLocalSearchParams();

  // Parse the session data from params
  const session: WorkoutSession | null = useMemo(() => {
    if (params.session) {
      try {
        return JSON.parse(params.session as string);
      } catch {
        return null;
      }
    }
    return null;
  }, [params.session]);

  // Calculate session duration
  const duration = useMemo(() => {
    if (!session?.startedAt || !session?.completedAt) return null;
    const start = new Date(session.startedAt);
    const end = new Date(session.completedAt);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      return `${diffMins} min`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  }, [session]);

  // Calculate total volume
  const totalVolume = useMemo(() => {
    if (!session?.exercises) return 0;
    return session.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((setTotal, set) => {
        return setTotal + (set.weight * set.reps);
      }, 0);
    }, 0);
  }, [session]);

  // Calculate total sets
  const totalSets = useMemo(() => {
    if (!session?.exercises) return 0;
    return session.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  }, [session]);

  // Format date
  const formattedDate = useMemo(() => {
    if (!session?.completedAt) return 'In progress';
    const date = new Date(session.completedAt);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [session]);

  // Format time
  const formattedTime = useMemo(() => {
    if (!session?.startedAt) return '';
    const start = new Date(session.startedAt);
    const end = session.completedAt ? new Date(session.completedAt) : null;
    const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (end) {
      const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return `${startTime} - ${endTime}`;
    }
    return `Started at ${startTime}`;
  }, [session]);

  if (!session) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.text }]}>Session not found</Text>
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>{session.name || 'Workout Details'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Date and Time */}
        <View style={styles.dateSection}>
          <Text style={[styles.dateText, { color: theme.text }]}>{formattedDate}</Text>
          <Text style={[styles.timeText, { color: theme.textSecondary }]}>{formattedTime}</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          {duration && (
            <View style={[styles.statBadge, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Ionicons name="time-outline" size={18} color={customColors.primaryButton} />
              <Text style={[styles.statBadgeText, { color: theme.text }]}>{duration}</Text>
            </View>
          )}
          <View style={[styles.statBadge, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="fitness-outline" size={18} color="#4ecdc4" />
            <Text style={[styles.statBadgeText, { color: theme.text }]}>{totalSets} sets</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="barbell-outline" size={18} color="#ff6b6b" />
            <Text style={[styles.statBadgeText, { color: theme.text }]}>{totalVolume.toLocaleString()} kg</Text>
          </View>
        </View>

        {/* Exercises */}
        <View style={styles.exercisesSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Exercises</Text>
          {session.exercises.map((exercise, index) => (
            <ExerciseCard
              key={`${exercise.exerciseId}-${index}`}
              exercise={exercise}
              theme={theme}
            />
          ))}
        </View>

        {/* Notes */}
        {session.notes && (
          <View style={styles.notesSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notes</Text>
            <View style={[styles.notesCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.notesText, { color: theme.text }]}>{session.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface ExerciseCardProps {
  exercise: SessionExercise;
  theme: typeof Colors.light;
}

function ExerciseCard({ exercise, theme }: ExerciseCardProps) {
  return (
    <View style={[styles.exerciseCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <Text style={[styles.exerciseName, { color: theme.text }]}>{exercise.exerciseName}</Text>
      <View style={styles.setsContainer}>
        {exercise.sets.map((set, index) => (
          <View key={index} style={styles.setRow}>
            <Text style={[styles.setNumber, { color: theme.textSecondary }]}>Set {index + 1}</Text>
            <Text style={[styles.setDetails, { color: theme.text }]}>
              {set.weight} kg × {set.reps} reps
            </Text>
            {(set.rir !== undefined || set.rpe !== undefined) && (
              <Text style={[styles.setMetrics, { color: theme.textSecondary }]}>
                {set.rir !== undefined && `RIR ${set.rir}`}
                {set.rir !== undefined && set.rpe !== undefined && ' • '}
                {set.rpe !== undefined && `RPE ${set.rpe}`}
              </Text>
            )}
          </View>
        ))}
      </View>
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
  dateSection: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statBadgeText: {
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
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  setsContainer: {
    gap: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  setNumber: {
    fontSize: 13,
    fontWeight: '500',
    width: 50,
  },
  setDetails: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  setMetrics: {
    fontSize: 13,
  },
  notesSection: {
    marginBottom: 24,
  },
  notesCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
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
