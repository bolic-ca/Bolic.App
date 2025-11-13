import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { mockPrograms } from '@/data/mock-data';

const difficultyColors = {
  Beginner: '#4ecdc4',
  Intermediate: '#ffd93d',
  Advanced: '#ff6b6b',
};

export default function ProgramsPage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
      <Text style={[styles.heading, { color: theme.text }]}>Training Programs</Text>
      <Text style={[styles.subheading, { color: theme.textSecondary }]}>
        Choose a program that fits your goals
      </Text>

      {mockPrograms.map((program) => (
        <TouchableOpacity
          key={program.id}
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={() => {
            console.log('Open program', program.title);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${theme.tint}15` }]}>
              <Ionicons name={program.icon as keyof typeof Ionicons.glyphMap} size={24} color={theme.tint} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={[styles.title, { color: theme.text }]}>{program.title}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {program.days} days/week
                </Text>
                <Text style={[styles.metaSeparator, { color: theme.textSecondary }]}>•</Text>
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {program.exercises} exercises
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColors[program.difficulty]}20` }]}>
              <Text style={[styles.difficultyText, { color: difficultyColors[program.difficulty] }]}>
                {program.difficulty}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </View>
        </TouchableOpacity>
      ))}
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
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '400',
  },
  metaSeparator: {
    fontSize: 14,
    marginHorizontal: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
