/**
 * Training API Types
 * Generated from OpenAPI specification
 */

// Enums
export enum MuscleCategory {
  Quads = 'Quads',
  Glutes = 'Glutes',
  Hamstrings = 'Hamstrings',
  Calves = 'Calves',
  Abs = 'Abs',
  Chest = 'Chest',
  Delts = 'Delts',
  Back = 'Back',
}

export enum ChestSubcategory {
  Upper = 'Upper',
  Middle = 'Middle',
  Lower = 'Lower',
}

export enum DeltsSubcategory {
  Front = 'Front',
  Lateral = 'Lateral',
  Rear = 'Rear',
}

export enum BackSubcategory {
  UpperTraps = 'Upper Traps',
  MidTraps = 'Mid Traps',
  LowerTraps = 'Lower Traps',
  UpperLats = 'Upper Lats',
  MidLats = 'Mid Lats',
  LowerLats = 'Lower Lats',
}

export type MuscleSubcategory = ChestSubcategory | DeltsSubcategory | BackSubcategory;

// Training Set
export interface TrainingSet {
  id?: string;
  userId: string;
  trainingExerciseId?: string | null;
  type?: string | null;
  weight?: number;
  weightType?: string | null;
  repetitions?: number;
  repetitionsInReserve?: number;
  rateOfPerceivedExertion?: number;
  quality?: number;
  averageRepetitionTime?: number;
  notes?: string | null;
}

// Training Exercise
export interface TrainingExercise {
  id?: string;
  userId: string;
  trainingDayId: string;
  name?: string | null;
  targetRepetitions?: string | null;
  targetRepetitionsInReserve?: string | null;
  targetPosition?: string | null;
  muscleCategory?: MuscleCategory | null;
  muscleSubcategory?: string | null;
  equipment?: string | null;
  notes?: string | null;
  sets?: TrainingSet[];
}

// Training Day
export interface TrainingDay {
  id?: string;
  userId: string;
  microcycleId?: string | null;
  trainingDayId?: string | null;
  number?: number | null;
  createdDate?: string | null;
  name?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  exercises?: TrainingExercise[];
}

// Training Session (extends TrainingDay for now based on API)
export type TrainingSession = TrainingDay;

// UI-specific types (for display purposes)
export interface ProgramSummary {
  id: string;
  title: string;
  days: number;
  exercises: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
}

export interface WorkoutStats {
  totalWorkouts: number;
  currentStreak: number;
  totalVolume: number;
  activeTime: number;
}

export interface PersonalRecord {
  exerciseName: string;
  value: number;
  unit: string;
  date?: string;
}
