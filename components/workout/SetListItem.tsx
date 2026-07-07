/**
 * SetListItem Component
 * Displays a completed set in the workout
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import type { SessionSet } from '@/services/storage/session-storage';
import { formatRirShort } from '@/services/storage/session-storage';
import { displayWeight } from '@/utils/weight';

interface SetListItemProps {
  set: SessionSet;
  setNumber: number;
  onPress?: () => void;
}

export default function SetListItem({ set, setNumber, onPress }: SetListItemProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { preferences, customColors } = useThemeCustomization();

  const weightDisplay = displayWeight(set.weight, preferences.weightUnit);
  let setText = `${weightDisplay} ${preferences.weightUnit} × ${set.reps} reps`;

  if (preferences.showRir) {
    if (set.numberOfPartials !== undefined) {
      setText += ` (+${set.numberOfPartials} partials)`;
    } else if (set.rir !== undefined) {
      if (set.rir === 'F') {
        setText += ' (Failure)';
      } else {
        setText += ` (RIR ${formatRirShort(set.rir)})`;
      }
    }
  }

  if (preferences.showRpe && set.rpe !== undefined) {
    setText += ` · RPE ${set.rpe}`;
  }

  if (preferences.showQuality && set.quality !== undefined) {
    setText += ` · Q${set.quality}/5`;
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
      <View style={[styles.setNumberBadge, { backgroundColor: `${customColors.primaryButton}20` }]}>
        <Text style={[styles.setNumberText, { color: customColors.primaryButton }]}>{setNumber}</Text>
      </View>
      <View style={styles.setContent}>
        <Text style={[styles.setText, { color: theme.text }]}>{setText}</Text>
        {preferences.showNotes && set.notes && (
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
  setNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: {
    fontSize: 12,
    fontWeight: '700',
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
