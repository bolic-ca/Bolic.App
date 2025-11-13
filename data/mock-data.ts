/**
 * Mock data for development
 * Structured according to the API schema
 */

import { TrainingDay, TrainingExercise, MuscleCategory, WorkoutStats, PersonalRecord, ProgramSummary } from '@/types/training';

const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174001';

// Mock Training Days / Programs
export const mockPrograms: ProgramSummary[] = [
  {
    id: '1',
    title: 'Full Body Beginner',
    days: 3,
    exercises: 12,
    difficulty: 'Beginner',
    icon: 'fitness'
  },
  {
    id: '2',
    title: 'Upper/Lower Split',
    days: 4,
    exercises: 16,
    difficulty: 'Intermediate',
    icon: 'barbell'
  },
  {
    id: '3',
    title: 'Push/Pull/Legs',
    days: 5,
    exercises: 20,
    difficulty: 'Intermediate',
    icon: 'body'
  },
  {
    id: '4',
    title: 'Strength Builder',
    days: 4,
    exercises: 18,
    difficulty: 'Advanced',
    icon: 'flash'
  },
];

// Mock Training Day with exercises
export const mockTrainingDay: TrainingDay = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  userId: MOCK_USER_ID,
  name: 'Upper Body Push',
  description: 'Chest, shoulders, and triceps focus',
  number: 1,
  createdDate: new Date().toISOString(),
  exercises: [
    {
      id: '123e4567-e89b-12d3-a456-426614174002',
      userId: MOCK_USER_ID,
      trainingDayId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Incline Barbell Press',
      muscleCategory: MuscleCategory.Chest,
      muscleSubcategory: 'Upper',
      targetRepetitions: '8-12',
      targetRepetitionsInReserve: '2-3',
      targetPosition: 'lengthened',
      equipment: 'Barbell',
      sets: [
        {
          id: '1',
          userId: MOCK_USER_ID,
          trainingExerciseId: '123e4567-e89b-12d3-a456-426614174002',
          type: 'working',
          weight: 185,
          weightType: 'lbs',
          repetitions: 10,
          repetitionsInReserve: 2,
          rateOfPerceivedExertion: 8,
        },
        {
          id: '2',
          userId: MOCK_USER_ID,
          trainingExerciseId: '123e4567-e89b-12d3-a456-426614174002',
          type: 'working',
          weight: 185,
          weightType: 'lbs',
          repetitions: 9,
          repetitionsInReserve: 2,
          rateOfPerceivedExertion: 8.5,
        },
      ],
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174003',
      userId: MOCK_USER_ID,
      trainingDayId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Dumbbell Lateral Raise',
      muscleCategory: MuscleCategory.Delts,
      muscleSubcategory: 'Lateral',
      targetRepetitions: '12-15',
      targetRepetitionsInReserve: '2',
      equipment: 'Dumbbells',
      sets: [
        {
          id: '3',
          userId: MOCK_USER_ID,
          trainingExerciseId: '123e4567-e89b-12d3-a456-426614174003',
          type: 'working',
          weight: 25,
          weightType: 'lbs',
          repetitions: 14,
          repetitionsInReserve: 2,
          rateOfPerceivedExertion: 7.5,
        },
      ],
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174004',
      userId: MOCK_USER_ID,
      trainingDayId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Cable Tricep Pushdown',
      muscleCategory: MuscleCategory.Back,
      targetRepetitions: '10-12',
      targetRepetitionsInReserve: '1-2',
      equipment: 'Cable Machine',
      sets: [],
    },
  ],
};

// Mock Workout Stats
export const mockWorkoutStats: WorkoutStats = {
  totalWorkouts: 47,
  currentStreak: 12,
  totalVolume: 42580,
  activeTime: 28.5,
};

// Mock Personal Records
export const mockPersonalRecords: PersonalRecord[] = [
  { exerciseName: 'Bench Press', value: 85, unit: 'kg', date: '2024-01-15' },
  { exerciseName: 'Squat', value: 120, unit: 'kg', date: '2024-01-12' },
  { exerciseName: 'Deadlift', value: 140, unit: 'kg', date: '2024-01-10' },
];

// Mock weekly activity
export const mockWeeklyActivity = [
  { day: 'Mon', completed: true },
  { day: 'Tue', completed: true },
  { day: 'Wed', completed: false },
  { day: 'Thu', completed: true },
  { day: 'Fri', completed: true },
  { day: 'Sat', completed: false },
  { day: 'Sun', completed: false },
];
