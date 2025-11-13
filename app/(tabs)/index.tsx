import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { mockTrainingDay, mockWorkoutStats, mockLastSession, mockPreviousInstanceOfToday } from '@/data/mock-data';
import { useThemeCustomization } from '@/contexts/ThemeContext';

export default function HomePage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { customColors } = useThemeCustomization();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
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
          onPress={() => console.log('Start workout')}
        >
          <Ionicons name="play-circle" size={28} color={customColors.primaryButtonText} />
          <Text style={[styles.primaryButtonText, { color: customColors.primaryButtonText }]}>Start Workout</Text>
        </TouchableOpacity>
      </View>

      {/* Next on the menu */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Next on the menu</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="barbell" size={24} color={theme.tint} />
            <View style={styles.cardHeaderText}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{mockTrainingDay.name}</Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                {mockTrainingDay.exercises?.length || 0} exercises • 45 min
              </Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.cardButton, { backgroundColor: theme.background }]}>
            <Text style={[styles.cardButtonText, { color: theme.tint }]}>View Details</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.tint} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Previous Sessions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Look back</Text>

        {/* Last Session */}
        <View style={[styles.sessionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionHeaderLeft}>
              <Ionicons name="checkmark-circle" size={20} color="#4ecdc4" />
              <View>
                <Text style={[styles.sessionLabel, { color: theme.textSecondary }]}>Last Session</Text>
                <Text style={[styles.sessionName, { color: theme.text }]}>{mockLastSession.name}</Text>
              </View>
            </View>
            <Text style={[styles.sessionTime, { color: theme.textSecondary }]}>Yesterday</Text>
          </View>
          {mockLastSession.exercises && mockLastSession.exercises[0] && (
            <View style={styles.sessionDetail}>
              <Text style={[styles.sessionExercise, { color: theme.textSecondary }]}>
                {mockLastSession.exercises[0].name} • {mockLastSession.exercises[0].sets?.length || 0} sets
              </Text>
            </View>
          )}
        </View>

        {/* Last Time You Did This */}
        <View style={[styles.sessionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionHeaderLeft}>
              <Ionicons name="repeat" size={20} color="#ffd93d" />
              <View>
                <Text style={[styles.sessionLabel, { color: theme.textSecondary }]}>Last time you did this</Text>
                <Text style={[styles.sessionName, { color: theme.text }]}>{mockPreviousInstanceOfToday.name}</Text>
              </View>
            </View>
            <Text style={[styles.sessionTime, { color: theme.textSecondary }]}>Last week</Text>
          </View>
          {mockPreviousInstanceOfToday.exercises && mockPreviousInstanceOfToday.exercises[0] && (
            <View style={styles.sessionDetail}>
              <Text style={[styles.sessionExercise, { color: theme.textSecondary }]}>
                {mockPreviousInstanceOfToday.exercises[0].name}
              </Text>
              {mockPreviousInstanceOfToday.exercises[0].sets && mockPreviousInstanceOfToday.exercises[0].sets[0] && (
                <Text style={[styles.sessionPerformance, { color: theme.text }]}>
                  {mockPreviousInstanceOfToday.exercises[0].sets[0].weight} {mockPreviousInstanceOfToday.exercises[0].sets[0].weightType} × {mockPreviousInstanceOfToday.exercises[0].sets[0].repetitions} reps
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
        <View style={[styles.statsGrid]}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="flame" size={28} color="#ff6b6b" />
            <Text style={[styles.statValue, { color: theme.text }]}>{mockWorkoutStats.totalWorkouts}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Workouts</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="calendar" size={28} color="#4ecdc4" />
            <Text style={[styles.statValue, { color: theme.text }]}>{mockWorkoutStats.currentStreak}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
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
});