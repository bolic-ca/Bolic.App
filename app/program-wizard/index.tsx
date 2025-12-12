import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { useProgramWizard, MesocycleGoal } from '@/contexts/ProgramWizardContext';

const goalOptions: MesocycleGoal[] = ['Hypertrophy', 'Strength', 'Deload', 'Peaking'];
const durationPresets = [4, 6, 8, 12];

export default function MesocycleInfoScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { customColors } = useThemeCustomization();
  const { state, setMesocycleInfo, canProceedFromStep1, discardDraft, isLoading, hasDraft } = useProgramWizard();

  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  // Show draft restored banner
  useEffect(() => {
    if (!isLoading && hasDraft && state.name) {
      setShowDraftBanner(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShowDraftBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, hasDraft, state.name]);

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
  };

  const handleClose = () => {
    const hasContent = state.name || state.microcycles.some(m => m.trainingDays.length > 0);
    if (hasContent) {
      Alert.alert(
        'Save Draft?',
        'Your progress will be saved and you can continue later.',
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: async () => {
              await discardDraft();
              router.back();
            },
          },
          {
            text: 'Save Draft',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleStartFresh = () => {
    Alert.alert(
      'Start Fresh?',
      'This will discard your current draft and start a new program.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Fresh',
          style: 'destructive',
          onPress: () => discardDraft(),
        },
      ]
    );
  };

  const handleNext = () => {
    if (canProceedFromStep1()) {
      router.push('/program-wizard/microcycles');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={[styles.loadingText, { color: palette.textMuted }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: palette.cardBorder }]}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <View style={[styles.closeButtonInner, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}>
            <Ionicons name="close" size={22} color={palette.text} />
          </View>
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerLabel, { color: palette.textMuted }]}>CREATE</Text>
          <Text style={[styles.headerTitle, { color: palette.text }]}>Periodized Program</Text>
        </View>
        <View style={styles.closeButton} />
      </View>

      {/* Draft Restored Banner */}
      {showDraftBanner && (
        <View style={[styles.draftBanner, { backgroundColor: hexToRgba(palette.accent, 0.15) }]}>
          <Ionicons name="document-text" size={18} color={palette.accent} />
          <Text style={[styles.draftBannerText, { color: palette.accent }]}>
            Draft restored - continue where you left off
          </Text>
          <TouchableOpacity onPress={handleStartFresh} style={styles.draftBannerButton}>
            <Text style={[styles.draftBannerButtonText, { color: palette.accent }]}>Start Fresh</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, { backgroundColor: palette.accent }]} />
        <View style={[styles.stepLine, { backgroundColor: palette.cardBorder }]} />
        <View style={[styles.stepDot, { backgroundColor: palette.cardBorder }]} />
        <View style={[styles.stepLine, { backgroundColor: palette.cardBorder }]} />
        <View style={[styles.stepDot, { backgroundColor: palette.cardBorder }]} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Program Name */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: palette.text }]}>Program Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: palette.cardBg, color: palette.text, borderColor: palette.cardBorder }]}
            placeholder="e.g., 8-Week Hypertrophy Block"
            placeholderTextColor={palette.textMuted}
            value={state.name}
            onChangeText={(text) => setMesocycleInfo({ name: text })}
          />
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: palette.text }]}>Description</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: palette.cardBg, color: palette.text, borderColor: palette.cardBorder }]}
            placeholder="Describe your program's focus and goals"
            placeholderTextColor={palette.textMuted}
            value={state.description}
            onChangeText={(text) => setMesocycleInfo({ description: text })}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Goal */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: palette.text }]}>Training Goal</Text>
          <TouchableOpacity
            style={[styles.picker, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}
            onPress={() => setShowGoalPicker(!showGoalPicker)}
            activeOpacity={0.8}
          >
            <Text style={[styles.pickerText, { color: state.goal ? palette.text : palette.textMuted }]}>
              {state.goal || 'Select goal (optional)'}
            </Text>
            <Ionicons name={showGoalPicker ? 'chevron-up' : 'chevron-down'} size={20} color={palette.textMuted} />
          </TouchableOpacity>
          {showGoalPicker && (
            <View style={[styles.pickerOptions, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
              {goalOptions.map((option, index) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.pickerOption,
                    index < goalOptions.length - 1 && { borderBottomWidth: 1, borderBottomColor: palette.cardBorder },
                  ]}
                  onPress={() => {
                    setMesocycleInfo({ goal: option });
                    setShowGoalPicker(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pickerOptionText, { color: palette.text }]}>{option}</Text>
                  {state.goal === option && <Ionicons name="checkmark" size={18} color={palette.accent} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Duration */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: palette.text }]}>Duration (Weeks)</Text>
          <View style={styles.durationContainer}>
            {durationPresets.map((weeks) => (
              <TouchableOpacity
                key={weeks}
                style={[
                  styles.durationButton,
                  {
                    backgroundColor: state.durationWeeks === weeks ? palette.accent : palette.cardBg,
                    borderColor: state.durationWeeks === weeks ? palette.accent : palette.cardBorder,
                  },
                ]}
                onPress={() => setMesocycleInfo({ durationWeeks: weeks })}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.durationButtonText,
                    { color: state.durationWeeks === weeks ? '#FFFFFF' : palette.text }
                  ]}
                >
                  {weeks}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customDurationContainer}>
            <Text style={[styles.customDurationLabel, { color: palette.textMuted }]}>or custom:</Text>
            <TextInput
              style={[styles.customDurationInput, { backgroundColor: palette.cardBg, color: palette.text, borderColor: palette.cardBorder }]}
              placeholder="0"
              placeholderTextColor={palette.textMuted}
              value={durationPresets.includes(state.durationWeeks) ? '' : state.durationWeeks.toString()}
              onChangeText={(text) => {
                const num = parseInt(text, 10);
                if (!isNaN(num) && num > 0 && num <= 52) {
                  setMesocycleInfo({ durationWeeks: num });
                } else if (text === '') {
                  setMesocycleInfo({ durationWeeks: 4 });
                }
              }}
              keyboardType="number-pad"
              maxLength={2}
            />
            <Text style={[styles.customDurationLabel, { color: palette.textMuted }]}>weeks</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: palette.accentGlow, borderColor: hexToRgba(palette.accent, 0.3) }]}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="information-circle" size={20} color={palette.accent} />
            <Text style={[styles.infoCardTitle, { color: palette.text }]}>What happens next?</Text>
          </View>
          <Text style={[styles.infoCardText, { color: palette.textMuted }]}>
            You will be able to add training days to each week (microcycle) and assign exercises to each day.
          </Text>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { shadowColor: palette.accent },
            !canProceedFromStep1() && styles.submitButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceedFromStep1()}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={canProceedFromStep1()
              ? [palette.accent, hexToRgba(palette.accent, 0.85)]
              : [palette.cardBorder, palette.cardBorder]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitButtonGradient}
          >
            <View style={styles.submitButtonIcon}>
              <Ionicons name="calendar-outline" size={22} color="#FFF" />
            </View>
            <Text style={styles.submitButtonText}>Next: Add Weeks</Text>
            <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  draftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  draftBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  draftBannerButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  draftBannerButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonInner: {
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  pickerText: {
    fontSize: 16,
  },
  pickerOptions: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  pickerOptionText: {
    fontSize: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  durationButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  customDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  customDurationLabel: {
    fontSize: 14,
  },
  customDurationInput: {
    width: 60,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCardText: {
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    marginTop: 4,
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
});
