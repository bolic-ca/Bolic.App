import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { useStats } from '@/hooks/useStats';

interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export default function StatsPage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { customColors } = useThemeCustomization();
  const { stats: userStats, prs, loading } = useStats();

  // Build stat cards from real data
  const stats: StatCard[] = [
    { title: 'Total Workouts', value: userStats?.totalWorkouts || 0, subtitle: 'Keep it up!', icon: 'fitness', color: '#4ecdc4' },
    { title: 'Current Streak', value: `${userStats?.currentStreak || 0} days`, subtitle: `Best: ${userStats?.longestStreak || 0} days`, icon: 'flame', color: '#ff6b6b' },
    { title: 'Total Volume', value: `${(userStats?.totalVolume || 0).toLocaleString()} kg`, subtitle: 'Total weight lifted', icon: 'barbell', color: '#ffd93d' },
    { title: 'Active Time', value: `${userStats?.activeTime || 0} hrs`, subtitle: 'Time spent training', icon: 'time', color: '#a29bfe' },
  ];

  // Mock weekly activity (this would come from session history in a future implementation)
  const mockWeeklyActivity = [
    { day: 'M', completed: true },
    { day: 'T', completed: false },
    { day: 'W', completed: true },
    { day: 'T', completed: true },
    { day: 'F', completed: false },
    { day: 'S', completed: true },
    { day: 'S', completed: false },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
      <Text style={[styles.heading, { color: theme.text }]}>Your Progress</Text>
      <Text style={[styles.subheading, { color: theme.textSecondary }]}>
        Track your fitness journey
      </Text>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={customColors.primaryButton} />
        </View>
      )}

      {/* Stats Grid */}
      {!loading && (
        <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          >
            <View style={[styles.iconCircle, { backgroundColor: `${stat.color}20` }]}>
              <Ionicons name={stat.icon} size={24} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
            <Text style={[styles.statTitle, { color: theme.text }]}>{stat.title}</Text>
            {stat.subtitle && (
              <Text style={[styles.statSubtitle, { color: theme.textSecondary }]}>{stat.subtitle}</Text>
            )}
          </View>
        ))}
        </View>
      )}

      {/* Weekly Activity */}
      {!loading && (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>This Week</Text>
        <View style={[styles.weeklyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.weeklyGrid}>
            {mockWeeklyActivity.map((item, index) => (
              <View key={index} style={styles.dayContainer}>
                <Text style={[styles.dayLabel, { color: theme.textSecondary }]}>{item.day}</Text>
                <View
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: item.completed ? customColors.primaryButton : theme.background,
                      borderColor: item.completed ? customColors.primaryButton : theme.cardBorder,
                    },
                  ]}
                >
                  {item.completed && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
              </View>
            ))}
          </View>
          <View style={styles.weeklyStats}>
            <View style={styles.weeklyStatItem}>
              <Text style={[styles.weeklyStatValue, { color: theme.text }]}>4/7</Text>
              <Text style={[styles.weeklyStatLabel, { color: theme.textSecondary }]}>Days Completed</Text>
            </View>
            <View style={[styles.separator, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.weeklyStatItem}>
              <Text style={[styles.weeklyStatValue, { color: theme.text }]}>57%</Text>
              <Text style={[styles.weeklyStatLabel, { color: theme.textSecondary }]}>Completion Rate</Text>
            </View>
          </View>
        </View>
      </View>
      )}

      {/* Personal Records */}
      {!loading && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Records</Text>
          {prs && prs.length > 0 ? (
            <View style={[styles.prCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              {prs.map((record, index) => (
                <React.Fragment key={record.id || index}>
                  {index > 0 && <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />}
                  <View style={styles.prItem}>
                    <View style={styles.prLeft}>
                      <Ionicons name="trophy" size={20} color="#ffd700" />
                      <Text style={[styles.prExercise, { color: theme.text }]}>{record.exerciseName}</Text>
                    </View>
                    <Text style={[styles.prValue, { color: customColors.primaryButton }]}>
                      {record.weight} {record.unit} × {record.reps}
                    </Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          ) : (
            <View style={[styles.prCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No personal records yet</Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                Start working out to track your progress!
              </Text>
            </View>
          )}
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  weeklyCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayContainer: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  weeklyStatValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  weeklyStatLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  separator: {
    width: 1,
    height: 40,
  },
  prCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  prItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prExercise: {
    fontSize: 16,
    fontWeight: '600',
  },
  prValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
