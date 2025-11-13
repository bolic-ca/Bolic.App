import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function HomePage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

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
          style={[styles.primaryButton, { backgroundColor: theme.tint }]}
          onPress={() => console.log('Start workout')}
        >
          <Ionicons name="play-circle" size={28} color="white" />
          <Text style={styles.primaryButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Program */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Program</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="barbell" size={24} color={theme.tint} />
            <View style={styles.cardHeaderText}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Upper Body Strength</Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>6 exercises • 45 min</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.cardButton, { backgroundColor: theme.background }]}>
            <Text style={[styles.cardButtonText, { color: theme.tint }]}>View Details</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.tint} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
        <View style={[styles.statsGrid]}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="flame" size={28} color="#ff6b6b" />
            <Text style={[styles.statValue, { color: theme.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Workouts</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Ionicons name="calendar" size={28} color="#4ecdc4" />
            <Text style={[styles.statValue, { color: theme.text }]}>5</Text>
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
    color: 'white',
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
});