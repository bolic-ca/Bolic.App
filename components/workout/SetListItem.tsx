/**
 * SetListItem Component
 * Displays a completed set in the workout
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import type { SessionSet } from '@/services/storage/session-storage';

interface SetListItemProps {
  set: SessionSet;
  setNumber: number;
}

export default function SetListItem({ set, setNumber }: SetListItemProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // Build set text: "Set 1: 100 kg × 10 reps"
  let setText = `Set ${setNumber}: ${set.weight} kg × ${set.reps} reps`;

  // Add RIR/RPE if available
  if (set.rir !== undefined || set.rpe !== undefined) {
    const extras = [];
    if (set.rir !== undefined) extras.push(`RIR ${set.rir}`);
    if (set.rpe !== undefined) extras.push(`RPE ${set.rpe}`);
    setText += ` (${extras.join(', ')})`;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <Text style={[styles.setText, { color: theme.text }]}>
        {setText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  setText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
