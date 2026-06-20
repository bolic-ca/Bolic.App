/**
 * SessionStartOptions
 * Bottom-sheet shown before starting a session when the last session for this training
 * day used a different exercise layout than the current template.
 *
 * Three choices:
 *   - Use template (ignore changes from last time)
 *   - Repeat last session's layout (use it for this session only)
 *   - Repeat last layout + save as template (permanent update)
 */

import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { TrainingDay } from '@/types/training';
import type { SessionExercisePlan } from '@/services/storage/session-storage';
import { useThemeCustomization } from '@/contexts/ThemeContext';

export type SessionStartChoice = 'template' | 'last' | 'lastAndSave';

interface Props {
  visible: boolean;
  trainingDay: TrainingDay;
  lastPlan: SessionExercisePlan[];
  onChoose: (choice: SessionStartChoice) => void;
  onDismiss: () => void;
}

interface Diff {
  added: SessionExercisePlan[];
  removed: SessionExercisePlan[];
  reordered: boolean;
}

function computeDiff(template: TrainingDay, lastPlan: SessionExercisePlan[]): Diff {
  const templateIds = (template.exercises ?? []).map(e => e.id!);
  const lastIds = lastPlan.map(e => e.exerciseId);

  const templateSet = new Set(templateIds);
  const lastSet = new Set(lastIds);

  const added = lastPlan.filter(e => !templateSet.has(e.exerciseId));
  const removed = (template.exercises ?? [])
    .filter(e => !lastSet.has(e.id!))
    .map(e => ({ exerciseId: e.id!, exerciseName: e.name! }));

  // Reordered: shared items in different relative order
  const sharedTemplate = templateIds.filter(id => lastSet.has(id));
  const sharedLast = lastIds.filter(id => templateSet.has(id));
  const reordered =
    added.length === 0 &&
    removed.length === 0 &&
    sharedTemplate.some((id, i) => sharedLast[i] !== id);

  return { added, removed, reordered };
}

export default function SessionStartOptions({ visible, trainingDay, lastPlan, onChoose, onDismiss }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { customColors } = useThemeCustomization();

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const accent = customColors.primaryButton;
  const palette = {
    bg: isDark ? '#0A0A0B' : '#FAFAF9',
    cardBg: isDark ? '#141416' : '#FFFFFF',
    cardBorder: isDark ? '#2A2A2E' : '#E8E8E6',
    text: isDark ? '#FAFAFA' : '#0A0A0B',
    textMuted: isDark ? '#71717A' : '#71717A',
    accent,
    accentGlow: isDark ? hexToRgba(accent, 0.15) : hexToRgba(accent, 0.1),
    destructive: '#EF4444',
    success: '#22C55E',
    amber: '#F59E0B',
  };

  const diff = useMemo(() => computeDiff(trainingDay, lastPlan), [trainingDay, lastPlan]);

  const hasDiff = diff.added.length > 0 || diff.removed.length > 0 || diff.reordered;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top', 'bottom']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: palette.cardBorder }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerLabel, { color: palette.textMuted }]}>LAST SESSION DIFFERS</Text>
            <Text style={[styles.headerTitle, { color: palette.text }]}>Start {trainingDay.name ?? 'Workout'}?</Text>
          </View>
          <TouchableOpacity
            onPress={onDismiss}
            style={[styles.closeButton, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}
          >
            <Ionicons name="close" size={22} color={palette.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Diff summary */}
          {hasDiff && (
            <View style={[styles.diffCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
              <Text style={[styles.diffTitle, { color: palette.text }]}>Changes from last time</Text>

              {diff.added.map(ex => (
                <View key={ex.exerciseId} style={styles.diffRow}>
                  <View style={[styles.diffDot, { backgroundColor: palette.success }]} />
                  <Text style={[styles.diffText, { color: palette.text }]} numberOfLines={1}>
                    <Text style={{ color: palette.success }}>Added  </Text>{ex.exerciseName}
                  </Text>
                </View>
              ))}

              {diff.removed.map(ex => (
                <View key={ex.exerciseId} style={styles.diffRow}>
                  <View style={[styles.diffDot, { backgroundColor: palette.destructive }]} />
                  <Text style={[styles.diffText, { color: palette.text }]} numberOfLines={1}>
                    <Text style={{ color: palette.destructive }}>Removed  </Text>{ex.exerciseName}
                  </Text>
                </View>
              ))}

              {diff.reordered && (
                <View style={styles.diffRow}>
                  <View style={[styles.diffDot, { backgroundColor: palette.amber }]} />
                  <Text style={[styles.diffText, { color: palette.text }]}>
                    <Text style={{ color: palette.amber }}>Reordered  </Text>exercises
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Choice: Use template */}
          <ChoiceButton
            icon="refresh-outline"
            label="Use template"
            description="Start fresh with your original training day layout"
            onPress={() => onChoose('template')}
            palette={palette}
            iconColor={palette.textMuted}
            borderColor={palette.cardBorder}
          />

          {/* Choice: Repeat last */}
          <ChoiceButton
            icon="repeat-outline"
            label="Repeat last session"
            description="Use the same exercise layout as last time (this session only)"
            onPress={() => onChoose('last')}
            palette={palette}
            iconColor={palette.accent}
            borderColor={palette.accent}
            highlighted
          />

          {/* Choice: Repeat last + save */}
          <ChoiceButton
            icon="save-outline"
            label="Repeat last + update template"
            description="Use last session's layout and save it as the new default"
            onPress={() => onChoose('lastAndSave')}
            palette={palette}
            iconColor={palette.amber}
            borderColor={palette.cardBorder}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

type PaletteType = {
  bg: string; cardBg: string; cardBorder: string; text: string;
  textMuted: string; accent: string; accentGlow: string;
  destructive: string; success: string; amber: string;
};

interface ChoiceButtonProps {
  icon: string;
  label: string;
  description: string;
  onPress: () => void;
  palette: PaletteType;
  iconColor: string;
  borderColor: string;
  highlighted?: boolean;
}

function ChoiceButton({ icon, label, description, onPress, palette, iconColor, borderColor, highlighted }: ChoiceButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.choiceButton,
        {
          backgroundColor: highlighted ? `${palette.accent}15` : palette.cardBg,
          borderColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.choiceIcon, { backgroundColor: `${iconColor}18` }]}>
        <Ionicons name={icon as never} size={24} color={iconColor} />
      </View>
      <View style={styles.choiceText}>
        <Text style={[styles.choiceLabel, { color: palette.text }]}>{label}</Text>
        <Text style={[styles.choiceDescription, { color: palette.textMuted }]}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={palette.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: { flex: 1 },
  headerLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  closeButton: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 12, paddingBottom: 40 },

  diffCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    marginBottom: 4,
  },
  diffTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 0.2, marginBottom: 4 },
  diffRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  diffDot: { width: 8, height: 8, borderRadius: 4 },
  diffText: { fontSize: 14, flex: 1 },

  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  choiceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceText: { flex: 1 },
  choiceLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2, marginBottom: 3 },
  choiceDescription: { fontSize: 13, lineHeight: 18 },
});
