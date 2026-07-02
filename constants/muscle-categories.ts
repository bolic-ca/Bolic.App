import { MuscleCategory } from '@/types/training';
import type { Ionicons } from '@expo/vector-icons';
import { ImageSourcePropType } from 'react-native';

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

export const muscleBodyImages: Record<string, ImageSourcePropType> = {
  // Main categories
  [MuscleCategory.Chest]: require('@/muscle-bodies/muscle-bodies-chest.png'),
  [MuscleCategory.Delts]: require('@/muscle-bodies/muscle-bodies-delts.png'),
  [MuscleCategory.Back]: require('@/muscle-bodies/muscle-bodies-back.png'),
  [MuscleCategory.Arms]: require('@/muscle-bodies/muscle-bodies-arms.png'),
  [MuscleCategory.Legs]: require('@/muscle-bodies/muscle-bodies-legs.png'),
  [MuscleCategory.Core]: require('@/muscle-bodies/muscle-bodies-core.png'),
  // Subcategories — Arms
  Biceps: require('@/muscle-bodies/muscle-bodies-arms-biceps.png'),
  Triceps: require('@/muscle-bodies/muscle-bodies-arms-triceps.png'),
  // Subcategories — Back
  Lats: require('@/muscle-bodies/muscle-bodies-back-lats-lower.png'),
  'Lower Back': require('@/muscle-bodies/muscle-bodies-back-lats-lower.png'),
  'Mid Back': require('@/muscle-bodies/muscle-bodies-back-mid.png'),
  'Upper Traps': require('@/muscle-bodies/muscle-bodies-back-upper-traps.png'),
  // Subcategories — Delts
  Rear: require('@/muscle-bodies/muscle-bodies-delts-rear.png'),
  // Subcategories — Legs
  Quads: require('@/muscle-bodies/muscle-bodies-legs-quads.png'),
  Hamstrings: require('@/muscle-bodies/muscle-bodies-legs-hamstrings.png'),
  Glutes: require('@/muscle-bodies/muscle-bodies-legs-glutes.png'),
  Calves: require('@/muscle-bodies/muscle-bodies-legs-calves.png'),
  Adductors: require('@/muscle-bodies/muscle-bodies-legs-adductors.png'),
  // Subcategories — Core
  Abs: require('@/muscle-bodies/muscle-bodies-core-abs.png'),
  Obliques: require('@/muscle-bodies/muscle-bodies-core-obliques.png'),
};

export function getMuscleBodyImage(
  category?: MuscleCategory | null,
  subcategory?: string | null
): ImageSourcePropType | null {
  if (subcategory && muscleBodyImages[subcategory]) {
    return muscleBodyImages[subcategory];
  }
  if (category && muscleBodyImages[category]) {
    return muscleBodyImages[category];
  }
  return null;
}

/** Tailwind-style palette used in wizard/selector screens */
export const muscleCategoryColorsTailwind: Record<MuscleCategory, string> = {
  [MuscleCategory.Chest]: '#EF4444',
  [MuscleCategory.Back]: '#3B82F6',
  [MuscleCategory.Delts]: '#F59E0B',
  [MuscleCategory.Arms]: '#84CC16',
  [MuscleCategory.Legs]: '#8B5CF6',
  [MuscleCategory.Core]: '#F97316',
};
