import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { mockWorkoutStats, mockPersonalRecords, mockWeeklyActivity } from '@/data/mock-data';
import { useThemeCustomization } from '@/contexts/ThemeContext';

interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const stats: StatCard[] = [
  { title: 'Total Workouts', value: mockWorkoutStats.totalWorkouts, subtitle: '+3 this week', icon: 'fitness', color: '#4ecdc4' },
  { title: 'Current Streak', value: `${mockWorkoutStats.currentStreak} days`, subtitle: 'Best: 18 days', icon: 'flame', color: '#ff6b6b' },
  { title: 'Total Volume', value: `${mockWorkoutStats.totalVolume.toLocaleString()} kg`, subtitle: '+2,340 kg this week', icon: 'barbell', color: '#ffd93d' },
  { title: 'Active Time', value: `${mockWorkoutStats.activeTime} hrs`, subtitle: 'Avg: 45 min/session', icon: 'time', color: '#a29bfe' },
];

export default function StatsPage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { customColors } = useThemeCustomization();

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

      {/* Stats Grid */}
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

      {/* Weekly Activity */}
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

      {/* Personal Records */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Records</Text>
        <View style={[styles.prCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {mockPersonalRecords.map((record, index) => (
            <React.Fragment key={index}>
              {index > 0 && <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />}
              <View style={styles.prItem}>
                <View style={styles.prLeft}>
                  <Ionicons name="trophy" size={20} color="#ffd700" />
                  <Text style={[styles.prExercise, { color: theme.text }]}>{record.exerciseName}</Text>
                </View>
                <Text style={[styles.prValue, { color: customColors.primaryButton }]}>
                  {record.value} {record.unit}
                </Text>
              </View>
            </React.Fragment>
          ))}
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
});
