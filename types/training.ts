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
// Can be used as a template (empty sets) or in a session (populated sets)
export interface TrainingExercise {
  id?: string;
  userId: string;
  trainingDayIds: string[]; // Can belong to multiple training days
  name?: string | null;
  targetRepetitions?: string | null;
  targetRepetitionsInReserve?: string | null;
  targetNumberOfSets?: number | null; // Target number of sets to perform
  targetPosition?: string | null;
  muscleCategory?: MuscleCategory | null;
  muscleSubcategory?: string | null;
  equipment?: string | null;
  notes?: string | null;
  sets?: TrainingSet[]; // Populated in training sessions, empty in templates
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

// Microcycle (Week)
export interface Microcycle {
  id: string;
  userId: string;
  mesocycleId: string;
  weekNumber: number;
  name?: string;
  description?: string;
  trainingDays: TrainingDay[];
  volumeTarget?: 'low' | 'moderate' | 'high';
  intensityTarget?: 'low' | 'moderate' | 'high';
}

// Mesocycle (Block/Phase)
export interface Mesocycle {
  id: string;
  userId: string;
  programId?: string;
  name: string;
  description?: string;
  goal?: string; // "Hypertrophy", "Strength", "Deload", "Peaking"
  startDate?: string;
  endDate?: string;
  durationWeeks?: number;
  microcycles: Microcycle[];
}

// Program (Top Level)
export interface Program {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: 'simple' | 'periodized';

  // Simple mode: just a rotating list of training days
  trainingDays?: TrainingDay[];
  schedule?: 'rotating' | 'weekly'; // rotating = Day 1,2,3 repeat; weekly = specific days

  // Periodized mode: full meso/micro structure
  mesocycles?: Mesocycle[];

  // Metadata
  tags?: string[]; // "Beginner", "3x/week", "Upper/Lower"
  isActive?: boolean;
  createdDate?: string;
  lastModified?: string;
}

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
