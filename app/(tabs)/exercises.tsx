import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { useExercises } from '@/hooks/useExercises';
import { router } from 'expo-router';

import { muscleCategoryIcons, muscleCategoryColors } from '@/constants/muscle-categories';

export default function ExercisesPage() {
  const colorScheme = useColorScheme();
  const { customColors } = useThemeCustomization();
  const { exercises, loading: exercisesLoading, refetch, deleteExercise } = useExercises();
  const isDark = colorScheme === 'dark';

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

  useFocusEffect(
    useCallback(() => {
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleDelete = (exerciseId: string, exerciseName: string) => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exerciseName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExercise(exerciseId);
            } catch {
              Alert.alert('Error', 'Failed to delete exercise');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerLabel, { color: palette.textMuted }]}>LIBRARY</Text>
          <Text style={[styles.headerTitle, { color: palette.text }]}>Exercises</Text>
        </View>

        {/* Stats Badge */}
        <View style={[styles.statsBadge, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
          <View style={[styles.statIconBg, { backgroundColor: palette.accentGlow }]}>
            <Ionicons name="barbell" size={18} color={palette.accent} />
          </View>
          <Text style={[styles.statsText, { color: palette.text }]}>
            <Text style={styles.statsValue}>{exercises.length}</Text> exercises in library
          </Text>
        </View>

        {/* Add Exercise Button */}
        <TouchableOpacity
          style={[styles.addButton, { shadowColor: palette.accent }]}
          onPress={() => router.push('/exercise-form')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[palette.accent, hexToRgba(palette.accent, 0.85)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <View style={styles.addButtonIcon}>
              <Ionicons name="add" size={24} color="#FFF" />
            </View>
            <Text style={styles.addButtonText}>Add Exercise</Text>
            <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>

        {exercisesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={palette.accent} />
          </View>
        ) : exercises.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
            <View style={[styles.emptyIconContainer, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}>
              <Ionicons name="barbell-outline" size={32} color={palette.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: palette.text }]}>No Exercises Yet</Text>
            <Text style={[styles.emptyDescription, { color: palette.textMuted }]}>
              Add your first exercise to build your library
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>All Exercises</Text>
            </View>

            <View style={styles.exercisesList}>
              {exercises.map((exercise) => {
                const categoryColor = exercise.muscleCategory
                  ? muscleCategoryColors[exercise.muscleCategory]
                  : palette.accent;

                return (
                  <TouchableOpacity
                    key={exercise.id}
                    style={[styles.exerciseCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}
                    activeOpacity={0.8}
                    onPress={() => router.push({ pathname: '/exercise-form', params: { exerciseId: exercise.id } })}
                  >
                    <View style={[styles.exerciseIcon, { backgroundColor: `${categoryColor}15` }]}>
                      <Ionicons
                        name={exercise.muscleCategory ? muscleCategoryIcons[exercise.muscleCategory] || 'fitness' : 'fitness'}
                        size={22}
                        color={categoryColor}
                      />
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text style={[styles.exerciseName, { color: palette.text }]} numberOfLines={1}>
                        {exercise.name}
                      </Text>
                      <View style={styles.exerciseMeta}>
                        {exercise.muscleCategory && (
                          <Text style={[styles.exerciseCategory, { color: categoryColor }]}>
                            {exercise.muscleCategory}
                          </Text>
                        )}
                        {exercise.muscleCategory && exercise.muscleSubcategory && (
                          <Text style={[styles.exerciseDot, { color: palette.textMuted }]}>·</Text>
                        )}
                        {exercise.muscleSubcategory && (
                          <Text style={[styles.exerciseSubcategory, { color: palette.textMuted }]}>
                            {exercise.muscleSubcategory}
                          </Text>
                        )}
                      </View>
                      {exercise.equipment && (
                        <View style={[styles.equipmentTag, { backgroundColor: palette.accentGlow }]}>
                          <Ionicons name="barbell-outline" size={12} color={palette.accent} />
                          <Text style={[styles.equipmentText, { color: palette.accent }]}>{exercise.equipment}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.exerciseActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}
                        onPress={() => router.push({ pathname: '/exercise-form', params: { exerciseId: exercise.id } })}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="pencil" size={16} color={palette.accent} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDelete(exercise.id!, exercise.name || 'this exercise');
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  contentContainer: { paddingHorizontal: 20, paddingBottom: 100 },

  // Header
  header: { paddingTop: 8, paddingBottom: 20 },
  headerLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1.2, marginBottom: 4 },
  headerTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },

  // Stats Badge
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 20,
  },
  statIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statsText: { fontSize: 14, fontWeight: '500' },
  statsValue: { fontWeight: '700', fontSize: 16 },

  // Add Button
  addButton: {
    marginBottom: 28,
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  addButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  addButtonText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.3,
  },

  // Loading
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },

  // Empty State
  emptyCard: { borderRadius: 20, borderWidth: 1, padding: 32, alignItems: 'center' },
  emptyIconContainer: { width: 72, height: 72, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3, marginBottom: 6 },
  emptyDescription: { fontSize: 14, textAlign: 'center' },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },

  // Exercise List
  exercisesList: { gap: 10 },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2, marginBottom: 4 },
  exerciseMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  exerciseCategory: { fontSize: 13, fontWeight: '600' },
  exerciseDot: { marginHorizontal: 6 },
  exerciseSubcategory: { fontSize: 13, fontWeight: '500' },
  equipmentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  equipmentText: { fontSize: 11, fontWeight: '600' },
  exerciseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
