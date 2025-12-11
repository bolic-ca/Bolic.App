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
import { WorkoutSession, SessionExercise } from '@/services/storage/session-storage';

export default function SessionDetailModal() {
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
    success: '#22C55E',
  };

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
      <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
        <View style={styles.errorContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}>
            <Ionicons name="document-outline" size={32} color={palette.textMuted} />
          </View>
          <Text style={[styles.errorText, { color: palette.text }]}>Session not found</Text>
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
          <Text style={[styles.headerLabel, { color: palette.textMuted }]}>WORKOUT</Text>
          <Text style={[styles.headerTitle, { color: palette.text }]}>{session.name || 'Session Details'}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date and Time */}
        <View style={styles.dateSection}>
          <Text style={[styles.dateText, { color: palette.text }]}>{formattedDate}</Text>
          <Text style={[styles.timeText, { color: palette.textMuted }]}>{formattedTime}</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          {duration && (
            <View style={[styles.statBadge, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
              <View style={[styles.statIconBg, { backgroundColor: palette.accentGlow }]}>
                <Ionicons name="time-outline" size={16} color={palette.accent} />
              </View>
              <Text style={[styles.statBadgeText, { color: palette.text }]}>{duration}</Text>
            </View>
          )}
          <View style={[styles.statBadge, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(78, 205, 196, 0.12)' }]}>
              <Ionicons name="fitness-outline" size={16} color="#4ecdc4" />
            </View>
            <Text style={[styles.statBadgeText, { color: palette.text }]}>{totalSets} sets</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(255, 107, 107, 0.12)' }]}>
              <Ionicons name="barbell-outline" size={16} color="#ff6b6b" />
            </View>
            <Text style={[styles.statBadgeText, { color: palette.text }]}>{totalVolume.toLocaleString()} kg</Text>
          </View>
        </View>

        {/* Exercises */}
        <View style={styles.exercisesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Exercises</Text>
          </View>
          {session.exercises.map((exercise, index) => (
            <ExerciseCard
              key={`${exercise.exerciseId}-${index}`}
              exercise={exercise}
              palette={palette}
              isDark={isDark}
            />
          ))}
        </View>

        {/* Notes */}
        {session.notes && (
          <View style={styles.notesSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Notes</Text>
            </View>
            <View style={[styles.notesCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
              <Text style={[styles.notesText, { color: palette.text }]}>{session.notes}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface ExerciseCardProps {
  exercise: SessionExercise;
  palette: {
    bg: string;
    cardBg: string;
    cardBorder: string;
    text: string;
    textMuted: string;
    accent: string;
    accentGlow: string;
    success: string;
  };
  isDark: boolean;
}

function ExerciseCard({ exercise, palette, isDark }: ExerciseCardProps) {
  return (
    <View style={[styles.exerciseCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
      <View style={styles.exerciseHeader}>
        <View style={[styles.exerciseIconBg, { backgroundColor: palette.accentGlow }]}>
          <Ionicons name="barbell-outline" size={18} color={palette.accent} />
        </View>
        <Text style={[styles.exerciseName, { color: palette.text }]}>{exercise.exerciseName}</Text>
      </View>
      <View style={styles.setsContainer}>
        {exercise.sets.map((set, index) => (
          <View key={index} style={[styles.setRow, { backgroundColor: isDark ? '#1F1F23' : '#F9F9F8' }]}>
            <View style={[styles.setNumberBadge, { backgroundColor: palette.accentGlow }]}>
              <Text style={[styles.setNumber, { color: palette.accent }]}>{index + 1}</Text>
            </View>
            <Text style={[styles.setDetails, { color: palette.text }]}>
              {set.weight} kg × {set.reps} reps
            </Text>
            {(set.rir !== undefined || set.rpe !== undefined) && (
              <Text style={[styles.setMetrics, { color: palette.textMuted }]}>
                {set.rir !== undefined && `RIR ${set.rir}`}
                {set.rir !== undefined && set.rpe !== undefined && ' · '}
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
  dateSection: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statBadgeText: {
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
  exerciseIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
  },
  setsContainer: {
    gap: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  setNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setNumber: {
    fontSize: 13,
    fontWeight: '700',
  },
  setDetails: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  setMetrics: {
    fontSize: 12,
    fontWeight: '500',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesCard: {
    borderRadius: 16,
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
    padding: 32,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
