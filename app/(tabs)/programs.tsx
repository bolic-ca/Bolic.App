import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

interface Program {
  id: string;
  title: string;
  days: number;
  exercises: number;
}

const programs: Program[] = [
  { id: '1', title: 'Full Body Beginner', days: 3, exercises: 12 },
  { id: '2', title: 'Upper/Lower Split', days: 4, exercises: 16 },
  { id: '3', title: 'Push/Pull/Legs', days: 5, exercises: 20 },
];

export default function ProgramsPage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.heading, { color: theme.text }]}>Programs</Text>

      {programs.map((program) => (
        <TouchableOpacity
          key={program.id}
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={() => {
            // navigate to program details later
            console.log('Open program', program.title);
          }}
        >
          <Text style={[styles.title, { color: theme.text }]}>{program.title}</Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>
            {program.days} days • {program.exercises} exercises
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  heading: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#888',
  },
});
