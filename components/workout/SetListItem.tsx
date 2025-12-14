/**
 * SetListItem Component
 * Displays a completed set in the workout
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import type { SessionSet } from '@/services/storage/session-storage';

interface SetListItemProps {
  set: SessionSet;
  setNumber: number;
  onPress?: () => void;
}

export default function SetListItem({ set, setNumber, onPress }: SetListItemProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // Build set text: "Set 1: 100 kg × 10 reps"
  let setText = `Set ${setNumber}: ${set.weight} kg × ${set.reps} reps`;

  // Add RIR if available
  if (set.rir !== undefined) {
    setText += ` (RIR ${set.rir})`;
  }

  const isEditable = !!onPress;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
        pressed && isEditable && styles.pressed,
      ]}
      onPress={onPress}
      disabled={!isEditable}
    >
      <View style={styles.setContent}>
        <Text style={[styles.setText, { color: theme.text }]}>{setText}</Text>
        {set.notes && (
          <Text style={[styles.notesText, { color: theme.textSecondary }]} numberOfLines={1}>
            {set.notes}
          </Text>
        )}
      </View>
      {isEditable && (
        <Ionicons name="pencil" size={18} color={theme.textSecondary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  setContent: {
    flex: 1,
    gap: 4,
  },
  setText: {
    fontSize: 15,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});
