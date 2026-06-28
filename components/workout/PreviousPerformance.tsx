/**
 * PreviousPerformance Component
 * Displays previous performance data for an exercise.
 * Tapping the header opens a full history modal grouped by session date.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Pressable,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import type { PreviousPerformance as PreviousPerformanceData } from '@/utils/workout-helpers';
import { getAllPreviousPerformances } from '@/utils/workout-helpers';
import type { WorkoutSession } from '@/services/storage/session-storage';
import { formatRirShort } from '@/services/storage/session-storage';
import { displayWeight } from '@/utils/weight';

interface PreviousPerformanceProps {
  data: PreviousPerformanceData | null;
  exerciseId?: string;
  exerciseName?: string;
  sessionHistory?: WorkoutSession[];
}

function formatFullDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PreviousPerformance({
  data,
  exerciseId,
  exerciseName,
  sessionHistory,
}: PreviousPerformanceProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { preferences } = useThemeCustomization();
  const [notePopup, setNotePopup] = useState<string | null>(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const allHistory = useMemo(() => {
    if (!exerciseId || !sessionHistory) return [];
    return getAllPreviousPerformances(exerciseId, sessionHistory);
  }, [exerciseId, sessionHistory]);

  const canExpand = allHistory.length > 0;

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
    <>
      <View style={[styles.container, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
        <Pressable
          onPress={canExpand ? () => setHistoryModalVisible(true) : undefined}
          style={styles.headerRow}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Ionicons name="arrow-undo-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.label, { color: theme.textSecondary }]}>Previous</Text>
          {canExpand && (
            <View style={styles.historyBadge}>
              <Text style={[styles.historyBadgeText, { color: theme.textSecondary }]}>
                {allHistory.length} session{allHistory.length !== 1 ? 's' : ''}
              </Text>
              <Ionicons name="chevron-forward" size={12} color={theme.textSecondary} />
            </View>
          )}
        </Pressable>

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

      {/* Full history modal */}
      <Modal
        visible={historyModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <SafeAreaView
          style={[styles.historyModal, { backgroundColor: theme.background }]}
          edges={['top']}
        >
          {/* Header */}
          <View style={[styles.historyHeader, { borderBottomColor: theme.cardBorder }]}>
            <View>
              <Text style={[styles.historyHeaderLabel, { color: theme.textSecondary }]}>HISTORY</Text>
              <Text style={[styles.historyHeaderTitle, { color: theme.text }]} numberOfLines={1}>
                {exerciseName ?? 'Exercise'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setHistoryModalVisible(false)}
              style={[styles.closeButton, { backgroundColor: theme.cardBorder + '60' }]}
            >
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.historyScroll}
            contentContainerStyle={styles.historyContent}
            showsVerticalScrollIndicator={false}
          >
            {allHistory.map((entry, entryIdx) => (
              <View
                key={entry.sessionId}
                style={[styles.sessionGroup, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              >
                {/* Session date */}
                <View style={styles.sessionDateRow}>
                  <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
                  <Text style={[styles.sessionDate, { color: theme.textSecondary }]}>
                    {formatFullDate(entry.date)}
                  </Text>
                  {entryIdx === 0 && (
                    <View style={[styles.latestBadge, { backgroundColor: theme.cardBorder + '80' }]}>
                      <Text style={[styles.latestBadgeText, { color: theme.textSecondary }]}>Latest</Text>
                    </View>
                  )}
                </View>

                {entry.sessionName && (
                  <Text style={[styles.sessionName, { color: theme.textSecondary }]}>
                    {entry.sessionName}
                  </Text>
                )}

                {/* Sets */}
                <View style={styles.historySetsContainer}>
                  {entry.performance.sets.map((set, setIdx) => (
                    <View key={setIdx} style={[styles.historySetRow, { borderTopColor: theme.cardBorder }]}>
                      <Text style={[styles.historySetIndex, { color: theme.textSecondary }]}>
                        {setIdx + 1}
                      </Text>
                      <Text style={[styles.historySetValue, { color: theme.text }]}>
                        {displayWeight(set.weight, preferences.weightUnit)}{preferences.weightUnit} × {set.reps}
                      </Text>
                      <View style={styles.historySetMetas}>
                        {set.numberOfPartials !== undefined && (
                          <Text style={[styles.historySetMeta, { color: theme.textSecondary }]}>
                            +{set.numberOfPartials}P
                          </Text>
                        )}
                        {set.numberOfPartials === undefined && set.rir !== undefined && (
                          <Text style={[styles.historySetMeta, { color: theme.textSecondary }]}>
                            {set.rir === 'F' ? 'Failure' : set.rir === 'P' ? 'Partials' : `${set.rir} RIR`}
                          </Text>
                        )}
                        {set.rpe !== undefined && (
                          <Text style={[styles.historySetMeta, { color: theme.textSecondary }]}>
                            RPE {set.rpe}
                          </Text>
                        )}
                      </View>
                      {set.notes && (
                        <Text style={[styles.historySetNotes, { color: theme.textSecondary }]} numberOfLines={2}>
                          {set.notes}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
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
  historyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 'auto',
  },
  historyBadgeText: {
    fontSize: 11,
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

  // History modal
  historyModal: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  historyHeaderLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  historyHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyScroll: {
    flex: 1,
  },
  historyContent: {
    padding: 16,
    gap: 12,
  },
  sessionGroup: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sessionDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sessionDate: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  latestBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  latestBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sessionName: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 14,
    paddingBottom: 8,
    marginTop: -4,
  },
  historySetsContainer: {
    gap: 0,
  },
  historySetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderTopWidth: 1,
    flexWrap: 'wrap',
  },
  historySetIndex: {
    fontSize: 12,
    fontWeight: '600',
    width: 18,
    textAlign: 'right',
  },
  historySetValue: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 100,
  },
  historySetMetas: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  historySetMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  historySetNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    width: '100%',
    paddingLeft: 28,
  },
});
