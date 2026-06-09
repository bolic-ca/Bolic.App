/**
 * ExerciseCard Component
 * Displays an exercise in the workout with set logging functionality
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet, useColorScheme, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import type { TrainingExercise } from '@/types/training';
import type { SessionExercise, SessionSet, WorkoutSession } from '@/services/storage/session-storage';
import type { PreviousPerformance as PreviousPerformanceData } from '@/utils/workout-helpers';
import PreviousPerformance from './PreviousPerformance';
import SetEditor from './SetEditor';
import SetListItem from './SetListItem';
import ExerciseSwapModal from './ExerciseSwapModal';
import { displayWeight } from '@/utils/weight';
import { muscleCategoryIcons, muscleCategoryColors } from '@/constants/muscle-categories';

interface ExerciseCardProps {
  exercise: TrainingExercise;
  sessionExercise?: SessionExercise;
  previousPerformance: PreviousPerformanceData | null;
  /** The original exercise ID from the training day template (stable key for swap logic). */
  originalExerciseId?: string;
  onAddSet: (exerciseId: string, exerciseName: string, set: Omit<SessionSet, 'completedAt'>) => void;
  onUpdateSet?: (exerciseId: string, setIndex: number, set: Omit<SessionSet, 'completedAt'>) => void;
  onDeleteSet?: (exerciseId: string, setIndex: number) => void;
  onSwapExercise?: (originalExerciseId: string, newExercise: TrainingExercise) => void;
  onUpdateExerciseTargets?: (exerciseId: string, patch: { targetRepetitions?: string | null; targetRepetitionsInReserve?: string | null; notes?: string | null }) => Promise<void>;
  sessionHistory?: WorkoutSession[];
}

export default function ExerciseCard({
  exercise,
  sessionExercise,
  previousPerformance,
  originalExerciseId,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onSwapExercise,
  onUpdateExerciseTargets,
  sessionHistory,
}: ExerciseCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { customColors, preferences } = useThemeCustomization();
  const [isExpanded, setIsExpanded] = useState(false);
  const [defaultWeight, setDefaultWeight] = useState<number | undefined>();

  // Swap modal state
  const [swapModalVisible, setSwapModalVisible] = useState(false);

  // Edit targets modal state
  const [editTargetsVisible, setEditTargetsVisible] = useState(false);
  const [draftTargetReps, setDraftTargetReps] = useState('');
  const [draftTargetRir, setDraftTargetRir] = useState('');
  const [draftNotes, setDraftNotes] = useState('');
  const [savingTargets, setSavingTargets] = useState(false);

  const openEditTargets = () => {
    setDraftTargetReps(exercise.targetRepetitions ?? '');
    setDraftTargetRir(exercise.targetRepetitionsInReserve ?? '');
    setDraftNotes(exercise.notes ?? '');
    setEditTargetsVisible(true);
  };

  const handleSaveTargets = async () => {
    if (!onUpdateExerciseTargets || !exercise.id) return;
    setSavingTargets(true);
    try {
      await onUpdateExerciseTargets(exercise.id, {
        targetRepetitions: draftTargetReps.trim() || null,
        targetRepetitionsInReserve: draftTargetRir.trim() || null,
        notes: draftNotes.trim() || null,
      });
      setEditTargetsVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to save targets');
    } finally {
      setSavingTargets(false);
    }
  };

  const handleSelectSwapExercise = (newExercise: TrainingExercise) => {
    setSwapModalVisible(false);
    if (onSwapExercise && originalExerciseId) {
      onSwapExercise(originalExerciseId, newExercise);
    }
  };

  // SetEditor modal state
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const [editingSetData, setEditingSetData] = useState<SessionSet | undefined>();

  // Calculate if exercise is complete
  const isComplete =
    sessionExercise &&
    exercise.targetNumberOfSets &&
    (sessionExercise.sets?.length ?? 0) >= exercise.targetNumberOfSets;

  // Update default weight from last set or previous performance
  useEffect(() => {
    if (sessionExercise?.sets && sessionExercise.sets.length > 0) {
      const lastSet = sessionExercise.sets[sessionExercise.sets.length - 1];
      setDefaultWeight(lastSet.weight);
    } else if (previousPerformance) {
      setDefaultWeight(previousPerformance.weight);
    }
  }, [sessionExercise, previousPerformance]);

  // Build target suggestions text
  const targetSuggestions = [];
  if (exercise.targetRepetitions) {
    targetSuggestions.push(`${exercise.targetRepetitions} reps`);
  }
  if (exercise.targetRepetitionsInReserve) {
    targetSuggestions.push(`RIR ${exercise.targetRepetitionsInReserve}`);
  }
  const targetText = targetSuggestions.length > 0 ? `Target: ${targetSuggestions.join(', ')}` : '';

  const openAddSetEditor = () => {
    setEditorMode('add');
    setEditingSetIndex(null);
    setEditingSetData(undefined);
    setEditorVisible(true);
  };

  const openEditSetEditor = (index: number, set: SessionSet) => {
    setEditorMode('edit');
    setEditingSetIndex(index);
    setEditingSetData(set);
    setEditorVisible(true);
  };

  const handleEditorSubmit = (setData: Omit<SessionSet, 'completedAt'>) => {
    if (editorMode === 'add') {
      onAddSet(exercise.id!, exercise.name!, setData);
    } else if (editingSetIndex !== null && onUpdateSet) {
      onUpdateSet(exercise.id!, editingSetIndex, setData);
    }
  };

  const handleEditorDelete = () => {
    if (editingSetIndex !== null && onDeleteSet) {
      onDeleteSet(exercise.id!, editingSetIndex);
    }
  };

  // Memoize initialData to prevent unnecessary re-renders
  const editorInitialData = useMemo(() => {
    if (editorMode === 'add') {
      return { weight: defaultWeight };
    }
    return editingSetData;
  }, [editorMode, defaultWeight, editingSetData]);

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      {/* Header - Always visible */}
      <View style={styles.header}>
        {/* Left: icon + info (tappable for expand/collapse) */}
        <TouchableOpacity
          style={styles.headerMain}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          {/* Muscle Category Icon */}
          {exercise.muscleCategory && (
            <View
              style={[
                styles.muscleIconContainer,
                { backgroundColor: `${muscleCategoryColors[exercise.muscleCategory]}20` },
              ]}
            >
              <Ionicons
                name={muscleCategoryIcons[exercise.muscleCategory] || 'fitness'}
                size={24}
                color={muscleCategoryColors[exercise.muscleCategory]}
              />
            </View>
          )}

          {/* Exercise Info */}
          <View style={styles.headerInfo}>
            <View style={styles.headerTopRow}>
              <Text style={[styles.exerciseName, { color: theme.text }]} numberOfLines={1}>
                {exercise.name}
              </Text>
              {isComplete && (
                <View style={[styles.completeBadge, { backgroundColor: '#00b89420' }]}>
                  <Ionicons name="checkmark-circle" size={16} color="#00b894" />
                  <Text style={[styles.completeBadgeText, { color: '#00b894' }]}>Complete</Text>
                </View>
              )}
            </View>

            {targetText && (
              <Text style={[styles.targetText, { color: theme.textSecondary }]}>{targetText}</Text>
            )}

            {exercise.equipment && (
              <Text style={[styles.equipmentText, { color: theme.textSecondary }]}>
                {exercise.equipment}
              </Text>
            )}

            {/* Sets count */}
            <Text style={[styles.setsCount, { color: theme.textSecondary }]}>
              {sessionExercise?.sets.length || 0}
              {exercise.targetNumberOfSets ? `/${exercise.targetNumberOfSets}` : ''} sets
              {previousPerformance && !isExpanded && (
                <Text style={[styles.prevHint, { color: theme.textSecondary }]}>
                  {' · '}Last: {displayWeight(previousPerformance.weight, preferences.weightUnit)}{preferences.weightUnit} × {previousPerformance.reps}
                  {previousPerformance.rir !== undefined && (
                    previousPerformance.rir === 'F' ? ' (F)' :
                    previousPerformance.rir === 'P' ? ' (P)' :
                    ` @${previousPerformance.rir}RIR`
                  )}
                </Text>
              )}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right: action buttons */}
        <View style={styles.headerActions}>
          {onSwapExercise && (
            <TouchableOpacity
              style={[styles.headerIconButton, { backgroundColor: theme.cardBorder + '60' }]}
              onPress={() => setSwapModalVisible(true)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Ionicons name="swap-horizontal" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
          {onUpdateExerciseTargets && (
            <TouchableOpacity
              style={[styles.headerIconButton, { backgroundColor: theme.cardBorder + '60' }]}
              onPress={openEditTargets}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Ionicons name="pencil" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          >
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Previous Performance */}
          <View style={styles.previousPerformanceContainer}>
            <PreviousPerformance
              data={previousPerformance}
              exerciseId={exercise.id}
              exerciseName={exercise.name}
              sessionHistory={sessionHistory}
            />
          </View>

          {/* Add Set Button */}
          <Pressable
            style={({ pressed }) => [
              styles.addSetButton,
              { backgroundColor: customColors.primaryButton },
              pressed && styles.addSetButtonPressed,
            ]}
            onPress={openAddSetEditor}
          >
            <Ionicons name="add-circle" size={22} color={customColors.primaryButtonText} />
            <Text style={[styles.addSetButtonText, { color: customColors.primaryButtonText }]}>
              Add Set
            </Text>
          </Pressable>

          {/* Completed Sets List */}
          {sessionExercise && sessionExercise.sets.length > 0 && (
            <View style={styles.setsListContainer}>
              <Text style={[styles.setsListTitle, { color: theme.text }]}>Completed Sets</Text>
              {sessionExercise.sets.map((set, index) => (
                <SetListItem
                  key={index}
                  set={set}
                  setNumber={index + 1}
                  onPress={() => openEditSetEditor(index, set)}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Set Editor Modal */}
      <SetEditor
        visible={editorVisible}
        onClose={() => setEditorVisible(false)}
        onSubmit={handleEditorSubmit}
        onDelete={editorMode === 'edit' && onDeleteSet ? handleEditorDelete : undefined}
        mode={editorMode}
        setNumber={editingSetIndex !== null ? editingSetIndex + 1 : undefined}
        initialData={editorInitialData}
      />

      {/* Exercise Swap Modal */}
      {onSwapExercise && (
        <ExerciseSwapModal
          visible={swapModalVisible}
          currentExerciseId={exercise.id}
          sessionHistory={sessionHistory}
          onClose={() => setSwapModalVisible(false)}
          onSelectExercise={handleSelectSwapExercise}
        />
      )}

      {/* Edit Targets Modal */}
      <Modal
        visible={editTargetsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditTargetsVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setEditTargetsVisible(false)} />
          <View style={[styles.editSheet, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            {/* Handle */}
            <View style={[styles.sheetHandle, { backgroundColor: theme.cardBorder }]} />

            {/* Title */}
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>Edit Targets</Text>
              <Text style={[styles.sheetSubtitle, { color: theme.textSecondary }]}>
                {exercise.name}
              </Text>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {/* Target Reps */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>TARGET REPS</Text>
                <TextInput
                  style={[styles.fieldInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.cardBorder }]}
                  value={draftTargetReps}
                  onChangeText={setDraftTargetReps}
                  placeholder="e.g. 8-12"
                  placeholderTextColor={theme.textSecondary}
                  returnKeyType="next"
                />
              </View>

              {/* Target RIR */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>TARGET RIR</Text>
                <TextInput
                  style={[styles.fieldInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.cardBorder }]}
                  value={draftTargetRir}
                  onChangeText={setDraftTargetRir}
                  placeholder="e.g. 2-3"
                  placeholderTextColor={theme.textSecondary}
                  returnKeyType="next"
                />
              </View>

              {/* Notes */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>NOTES</Text>
                <TextInput
                  style={[styles.fieldInput, styles.notesInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.cardBorder }]}
                  value={draftNotes}
                  onChangeText={setDraftNotes}
                  placeholder="Cues, setup tips…"
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  returnKeyType="done"
                  blurOnSubmit
                />
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={[styles.sheetCancelBtn, { borderColor: theme.cardBorder }]}
                onPress={() => setEditTargetsVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.sheetCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <Pressable
                style={({ pressed }) => [
                  styles.sheetSaveBtn,
                  { backgroundColor: customColors.primaryButton, opacity: (pressed || savingTargets) ? 0.7 : 1 },
                ]}
                onPress={handleSaveTargets}
                disabled={savingTargets}
              >
                <Text style={[styles.sheetSaveText, { color: customColors.primaryButtonText }]}>
                  {savingTargets ? 'Saving…' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 12,
    gap: 8,
  },
  headerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muscleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  completeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  targetText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  equipmentText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  setsCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  prevHint: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  previousPerformanceContainer: {
    marginBottom: 12,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  addSetButtonPressed: {
    opacity: 0.7,
  },
  addSetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  setsListContainer: {
    marginTop: 16,
  },
  setsListTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  // Edit Targets Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  editSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetHeader: {
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  sheetSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  notesInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  sheetCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  sheetCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sheetSaveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  sheetSaveText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
