/**
 * PreviousPerformance Component
 * Displays previous performance data for an exercise
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, Pressable, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import type { PreviousPerformance as PreviousPerformanceData } from '@/utils/workout-helpers';
import { formatRirShort } from '@/services/storage/session-storage';
import { displayWeight } from '@/utils/weight';

interface PreviousPerformanceProps {
  data: PreviousPerformanceData | null;
}

export default function PreviousPerformance({ data }: PreviousPerformanceProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { preferences } = useThemeCustomization();
  const [notePopup, setNotePopup] = useState<string | null>(null);

  if (!data) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
        <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          First time doing this exercise
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
      <View style={styles.headerRow}>
        <Ionicons name="arrow-undo-outline" size={14} color={theme.textSecondary} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>Previous</Text>
      </View>
      <View style={styles.setsContainer}>
        {data.sets.map((set, idx) => (
          <View key={idx} style={styles.setRow}>
            <Text style={[styles.setIndex, { color: theme.textSecondary }]}>{idx + 1}</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {displayWeight(set.weight, preferences.weightUnit)}{preferences.weightUnit} × {set.reps}
            </Text>
            {preferences.showRir && (
              set.numberOfPartials !== undefined ? (
                <Text style={[styles.setMeta, { color: theme.textSecondary }]}>
                  +{set.numberOfPartials}P
                </Text>
              ) : set.rir !== undefined ? (
                <Text style={[styles.setMeta, { color: theme.textSecondary }]}>
                  {set.rir === 'F' ? 'F' : `${formatRirShort(set.rir)}RIR`}
                </Text>
              ) : null
            )}
            {preferences.showRpe && set.rpe !== undefined && (
              <Text style={[styles.setMeta, { color: theme.textSecondary }]}>
                RPE{set.rpe}
              </Text>
            )}
            {preferences.showNotes && set.notes && (
              <Pressable onPress={() => setNotePopup(set.notes!)} style={styles.notesChip}>
                <Ionicons name="document-text-outline" size={11} color={theme.textSecondary} />
                <Text style={[styles.setNotes, { color: theme.textSecondary }]} numberOfLines={1}>
                  {set.notes.length > 12 ? `${set.notes.slice(0, 12)}…` : set.notes}
                </Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>

      {/* Note popup */}
      <Modal
        visible={notePopup !== null}
        transparent
        animationType="none"
        onRequestClose={() => setNotePopup(null)}
      >
        <Pressable style={styles.popupOverlay} onPress={() => setNotePopup(null)}>
          <Pressable style={[styles.popupCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.popupHeader}>
              <Ionicons name="document-text-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.popupTitle, { color: theme.textSecondary }]}>Set Note</Text>
              <TouchableOpacity onPress={() => setNotePopup(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.popupBody, { color: theme.text }]}>{notePopup}</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  setsContainer: {
    gap: 4,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  setIndex: {
    fontSize: 11,
    fontWeight: '600',
    width: 14,
    textAlign: 'right',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  setMeta: {
    fontSize: 11,
    fontWeight: '500',
  },
  notesChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  setNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    flex: 1,
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  popupCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  popupTitle: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.5,
  },
  popupBody: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
});
