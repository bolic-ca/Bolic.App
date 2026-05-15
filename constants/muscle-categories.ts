import { MuscleCategory } from '@/types/training';
import type { Ionicons } from '@expo/vector-icons';

export const muscleCategoryIcons: Record<MuscleCategory, keyof typeof Ionicons.glyphMap> = {
  [MuscleCategory.Chest]: 'fitness',
  [MuscleCategory.Delts]: 'triangle',
  [MuscleCategory.Back]: 'git-pull-request',
  [MuscleCategory.Quads]: 'footsteps',
  [MuscleCategory.Glutes]: 'body',
  [MuscleCategory.Hamstrings]: 'walk',
  [MuscleCategory.Adductors]: 'swap-horizontal',
  [MuscleCategory.Calves]: 'footsteps-outline',
  [MuscleCategory.Abs]: 'grid',
  [MuscleCategory.Arms]: 'barbell',
};

/** Vibrant palette used in older/simpler screens */
export const muscleCategoryColors: Record<MuscleCategory, string> = {
  [MuscleCategory.Chest]: '#ff6b6b',
  [MuscleCategory.Delts]: '#ffd93d',
  [MuscleCategory.Back]: '#4ecdc4',
  [MuscleCategory.Quads]: '#a29bfe',
  [MuscleCategory.Glutes]: '#fd79a8',
  [MuscleCategory.Hamstrings]: '#fdcb6e',
  [MuscleCategory.Adductors]: '#55efc4',
  [MuscleCategory.Calves]: '#6c5ce7',
  [MuscleCategory.Abs]: '#00b894',
  [MuscleCategory.Arms]: '#e17055',
};

/** Tailwind-style palette used in wizard/selector screens */
export const muscleCategoryColorsTailwind: Record<MuscleCategory, string> = {
  [MuscleCategory.Chest]: '#EF4444',
  [MuscleCategory.Back]: '#3B82F6',
  [MuscleCategory.Delts]: '#F59E0B',
  [MuscleCategory.Quads]: '#10B981',
  [MuscleCategory.Hamstrings]: '#8B5CF6',
  [MuscleCategory.Glutes]: '#EC4899',
  [MuscleCategory.Adductors]: '#06B6D4',
  [MuscleCategory.Calves]: '#6366F1',
  [MuscleCategory.Abs]: '#F97316',
  [MuscleCategory.Arms]: '#84CC16',
};
