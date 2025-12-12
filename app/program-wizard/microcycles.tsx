import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { useProgramWizard, VolumeIntensityTarget } from '@/contexts/ProgramWizardContext';

const volumeIntensityOptions: VolumeIntensityTarget[] = ['low', 'moderate', 'high'];

export default function MicrocyclesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { customColors } = useThemeCustomization();
  const {
    state,
    addMicrocycle,
    updateMicrocycle,
    deleteMicrocycle,
    duplicateMicrocycle,
    addTrainingDay,
    deleteTrainingDay,
    setCurrentMicrocycle,
    setCurrentTrainingDay,
  } = useProgramWizard();

  const [expandedMicrocycle, setExpandedMicrocycle] = useState<string | null>(null);
  const [editingMicrocycle, setEditingMicrocycle] = useState<number | null>(null);

  // Athletic color palette
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
    accentGlow: isDark ? hexToRgba(accent, 0.15) : hexToRgba(accent, 0.08),
    danger: '#EF4444',
  };

  const handleTrainingDayPress = (microcycleIndex: number, dayIndex: number) => {
    setCurrentMicrocycle(microcycleIndex);
    setCurrentTrainingDay(dayIndex);
    router.push('/program-wizard/training-days');
  };

  const handleDeleteMicrocycle = (index: number) => {
    Alert.alert(
      'Delete Week',
      `Are you sure you want to delete Week ${state.microcycles[index].weekNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMicrocycle(index) },
      ]
    );
  };

  const handleDeleteTrainingDay = (microcycleIndex: number, dayIndex: number) => {
    Alert.alert(
      'Delete Training Day',
      'Are you sure you want to delete this training day?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTrainingDay(microcycleIndex, dayIndex) },
      ]
    );
  };

  const hasTrainingDays = state.microcycles.some(m => m.trainingDays.length > 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: palette.cardBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={[styles.backButtonInner, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}>
            <Ionicons name="chevron-back" size={22} color={palette.text} />
          </View>
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerLabel, { color: palette.textMuted }]}>STEP 2</Text>
          <Text style={[styles.headerTitle, { color: palette.text }]}>Weeks & Days</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, { backgroundColor: palette.accent }]} />
        <View style={[styles.stepLine, { backgroundColor: palette.accent }]} />
        <View style={[styles.stepDot, { backgroundColor: palette.accent }]} />
        <View style={[styles.stepLine, { backgroundColor: palette.cardBorder }]} />
        <View style={[styles.stepDot, { backgroundColor: palette.cardBorder }]} />
      </View>

      {/* Program Summary */}
      <View style={[styles.summaryCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
        <Text style={[styles.summaryTitle, { color: palette.text }]} numberOfLines={1}>
          {state.name || 'Untitled Program'}
        </Text>
        {state.goal && (
          <View style={[styles.goalBadge, { backgroundColor: palette.accentGlow }]}>
            <Text style={[styles.goalBadgeText, { color: palette.accent }]}>{state.goal}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Microcycles List */}
        {state.microcycles.map((microcycle, microIndex) => {
          const isExpanded = expandedMicrocycle === microcycle.tempId;
          const isEditing = editingMicrocycle === microIndex;

          return (
            <View key={microcycle.tempId} style={[styles.microcycleCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
              {/* Microcycle Header */}
              <TouchableOpacity
                style={styles.microcycleHeader}
                onPress={() => setExpandedMicrocycle(isExpanded ? null : microcycle.tempId)}
                activeOpacity={0.8}
              >
                <View style={styles.microcycleHeaderLeft}>
                  <View style={[styles.weekBadge, { backgroundColor: palette.accentGlow }]}>
                    <Text style={[styles.weekBadgeText, { color: palette.accent }]}>W{microcycle.weekNumber}</Text>
                  </View>
                  <View>
                    {isEditing ? (
                      <TextInput
                        style={[styles.weekNameInput, { color: palette.text, borderColor: palette.accent }]}
                        value={microcycle.name}
                        onChangeText={(text) => updateMicrocycle(microIndex, { name: text })}
                        onBlur={() => setEditingMicrocycle(null)}
                        autoFocus
                      />
                    ) : (
                      <TouchableOpacity onPress={() => setEditingMicrocycle(microIndex)}>
                        <Text style={[styles.weekName, { color: palette.text }]}>{microcycle.name}</Text>
                      </TouchableOpacity>
                    )}
                    <Text style={[styles.weekMeta, { color: palette.textMuted }]}>
                      {microcycle.trainingDays.length} training day{microcycle.trainingDays.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                <View style={styles.microcycleHeaderRight}>
                  {/* Volume/Intensity badges */}
                  {microcycle.volumeTarget && (
                    <View style={[styles.targetBadge, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}>
                      <Ionicons name="trending-up" size={12} color={palette.textMuted} />
                      <Text style={[styles.targetBadgeText, { color: palette.textMuted }]}>{microcycle.volumeTarget}</Text>
                    </View>
                  )}
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={palette.textMuted} />
                </View>
              </TouchableOpacity>

              {/* Expanded Content */}
              {isExpanded && (
                <View style={[styles.expandedContent, { borderTopColor: palette.cardBorder }]}>
                  {/* Volume/Intensity Settings */}
                  <View style={styles.targetSettings}>
                    <Text style={[styles.targetLabel, { color: palette.textMuted }]}>Volume:</Text>
                    <View style={styles.targetButtons}>
                      {volumeIntensityOptions.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.targetButton,
                            {
                              backgroundColor: microcycle.volumeTarget === option ? palette.accent : 'transparent',
                              borderColor: microcycle.volumeTarget === option ? palette.accent : palette.cardBorder,
                            },
                          ]}
                          onPress={() => updateMicrocycle(microIndex, { volumeTarget: option })}
                        >
                          <Text style={[styles.targetButtonText, { color: microcycle.volumeTarget === option ? '#FFF' : palette.text }]}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.targetSettings}>
                    <Text style={[styles.targetLabel, { color: palette.textMuted }]}>Intensity:</Text>
                    <View style={styles.targetButtons}>
                      {volumeIntensityOptions.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.targetButton,
                            {
                              backgroundColor: microcycle.intensityTarget === option ? palette.accent : 'transparent',
                              borderColor: microcycle.intensityTarget === option ? palette.accent : palette.cardBorder,
                            },
                          ]}
                          onPress={() => updateMicrocycle(microIndex, { intensityTarget: option })}
                        >
                          <Text style={[styles.targetButtonText, { color: microcycle.intensityTarget === option ? '#FFF' : palette.text }]}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Training Days */}
                  <View style={styles.trainingDaysSection}>
                    <Text style={[styles.sectionLabel, { color: palette.text }]}>Training Days</Text>
                    {microcycle.trainingDays.map((day, dayIndex) => (
                      <TouchableOpacity
                        key={day.tempId}
                        style={[styles.trainingDayCard, { backgroundColor: isDark ? '#1A1A1D' : '#F9F9F8', borderColor: palette.cardBorder }]}
                        onPress={() => handleTrainingDayPress(microIndex, dayIndex)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.trainingDayLeft}>
                          <View style={[styles.dayIcon, { backgroundColor: palette.accentGlow }]}>
                            <Ionicons name="barbell-outline" size={16} color={palette.accent} />
                          </View>
                          <View>
                            <Text style={[styles.dayName, { color: palette.text }]}>{day.name}</Text>
                            <Text style={[styles.dayMeta, { color: palette.textMuted }]}>
                              {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.trainingDayRight}>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteTrainingDay(microIndex, dayIndex)}
                          >
                            <Ionicons name="trash-outline" size={18} color={palette.danger} />
                          </TouchableOpacity>
                          <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
                        </View>
                      </TouchableOpacity>
                    ))}

                    {/* Add Training Day Button */}
                    <TouchableOpacity
                      style={[styles.addDayButton, { borderColor: palette.cardBorder }]}
                      onPress={() => addTrainingDay(microIndex)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add-circle-outline" size={20} color={palette.accent} />
                      <Text style={[styles.addDayButtonText, { color: palette.accent }]}>Add Training Day</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Microcycle Actions */}
                  <View style={styles.microcycleActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}
                      onPress={() => duplicateMicrocycle(microIndex)}
                    >
                      <Ionicons name="copy-outline" size={16} color={palette.text} />
                      <Text style={[styles.actionButtonText, { color: palette.text }]}>Duplicate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: hexToRgba(palette.danger, 0.1) }]}
                      onPress={() => handleDeleteMicrocycle(microIndex)}
                    >
                      <Ionicons name="trash-outline" size={16} color={palette.danger} />
                      <Text style={[styles.actionButtonText, { color: palette.danger }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Add Week Button */}
        <TouchableOpacity
          style={[styles.addWeekButton, { borderColor: palette.cardBorder }]}
          onPress={addMicrocycle}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={24} color={palette.accent} />
          <Text style={[styles.addWeekButtonText, { color: palette.accent }]}>Add Week</Text>
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { shadowColor: palette.accent },
            !hasTrainingDays && styles.submitButtonDisabled,
          ]}
          onPress={() => router.push('/program-wizard/preview')}
          disabled={!hasTrainingDays}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={hasTrainingDays
              ? [palette.accent, hexToRgba(palette.accent, 0.85)]
              : [palette.cardBorder, palette.cardBorder]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitButtonGradient}
          >
            <View style={styles.submitButtonIcon}>
              <Ionicons name="eye-outline" size={22} color="#FFF" />
            </View>
            <Text style={styles.submitButtonText}>Preview & Save</Text>
            <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>

        {!hasTrainingDays && (
          <Text style={[styles.helperText, { color: palette.textMuted }]}>
            Add at least one training day to continue
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepLine: {
    width: 32,
    height: 2,
    borderRadius: 1,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  goalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  goalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  microcycleCard: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  microcycleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  microcycleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weekBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  weekName: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekNameInput: {
    fontSize: 16,
    fontWeight: '600',
    borderBottomWidth: 2,
    paddingVertical: 2,
    minWidth: 100,
  },
  weekMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  microcycleHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  expandedContent: {
    borderTopWidth: 1,
    padding: 16,
  },
  targetSettings: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  targetLabel: {
    fontSize: 13,
    fontWeight: '500',
    width: 70,
  },
  targetButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  targetButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  targetButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  trainingDaysSection: {
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  trainingDayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  trainingDayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dayIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  trainingDayRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  addDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  addDayButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  microcycleActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addWeekButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderWidth: 2,
    borderRadius: 14,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  addWeekButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  submitButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  submitButtonText: {
    flex: 1,
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  helperText: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 12,
  },
});
