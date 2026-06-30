import { MuscleCategory } from '@/types/training';
import type { Ionicons } from '@expo/vector-icons';

export const muscleCategoryIcons: Record<MuscleCategory, keyof typeof Ionicons.glyphMap> = {
  [MuscleCategory.Chest]: 'fitness',
  [MuscleCategory.Delts]: 'triangle',
  [MuscleCategory.Back]: 'git-pull-request',
  [MuscleCategory.Arms]: 'barbell',
  [MuscleCategory.Legs]: 'walk',
  [MuscleCategory.Core]: 'ellipse',
};

/** Vibrant palette used in older/simpler screens */
export const muscleCategoryColors: Record<MuscleCategory, string> = {
  [MuscleCategory.Chest]: '#ff6b6b',
  [MuscleCategory.Delts]: '#ffd93d',
  [MuscleCategory.Back]: '#4ecdc4',
  [MuscleCategory.Arms]: '#e17055',
  [MuscleCategory.Legs]: '#a29bfe',
  [MuscleCategory.Core]: '#00b894',
};

/** Tailwind-style palette used in wizard/selector screens */
export const muscleCategoryColorsTailwind: Record<MuscleCategory, string> = {
  [MuscleCategory.Chest]: '#EF4444',
  [MuscleCategory.Back]: '#3B82F6',
  [MuscleCategory.Delts]: '#F59E0B',
  [MuscleCategory.Arms]: '#84CC16',
  [MuscleCategory.Legs]: '#8B5CF6',
  [MuscleCategory.Core]: '#F97316',
};
