/**
 * Mock data for development
 * Structured according to the API schema
 */

import {
  TrainingDay,
  TrainingExercise,
  MuscleCategory,
  WorkoutStats,
  PersonalRecord,
  ProgramSummary,
  Program,
  Mesocycle,
  Microcycle
} from '@/types/training';

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
      trainingDayIds: ['123e4567-e89b-12d3-a456-426614174000'],
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
      trainingDayIds: ['123e4567-e89b-12d3-a456-426614174000'],
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
      trainingDayIds: ['123e4567-e89b-12d3-a456-426614174000'],
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

// ===== FULL PROGRAM OBJECTS =====

// Simple Program: Push/Pull/Legs (most users)
export const mockSimpleProgram: Program = {
  id: 'simple-ppl-1',
  userId: MOCK_USER_ID,
  name: 'Push/Pull/Legs',
  description: 'Classic 3-day rotating split',
  type: 'simple',
  schedule: 'rotating', // Just rotate through these 3 days
  isActive: true,
  tags: ['Intermediate', '3x/week', 'Hypertrophy'],
  trainingDays: [
    {
      id: 'ppl-push',
      userId: MOCK_USER_ID,
      name: 'Push Day',
      description: 'Chest, shoulders, triceps',
      exercises: [
        {
          id: 'ex-1',
          userId: MOCK_USER_ID,
          trainingDayIds: ['ppl-push'],
          name: 'Bench Press',
          muscleCategory: MuscleCategory.Chest,
          targetRepetitions: '6-8',
          targetRepetitionsInReserve: '2',
          equipment: 'Barbell',
          sets: [],
        },
        {
          id: 'ex-2',
          userId: MOCK_USER_ID,
          trainingDayIds: ['ppl-push'],
          name: 'Overhead Press',
          muscleCategory: MuscleCategory.Delts,
          targetRepetitions: '8-10',
          targetRepetitionsInReserve: '2',
          equipment: 'Barbell',
          sets: [],
        },
      ],
    },
    {
      id: 'ppl-pull',
      userId: MOCK_USER_ID,
      name: 'Pull Day',
      description: 'Back, biceps',
      exercises: [
        {
          id: 'ex-3',
          userId: MOCK_USER_ID,
          trainingDayIds: ['ppl-pull'],
          name: 'Pull-ups',
          muscleCategory: MuscleCategory.Back,
          muscleSubcategory: 'Upper Lats',
          targetRepetitions: '6-10',
          targetRepetitionsInReserve: '1-2',
          equipment: 'Bodyweight',
          sets: [],
        },
      ],
    },
    {
      id: 'ppl-legs',
      userId: MOCK_USER_ID,
      name: 'Leg Day',
      description: 'Quads, hamstrings, glutes',
      exercises: [
        {
          id: 'ex-4',
          userId: MOCK_USER_ID,
          trainingDayIds: ['ppl-legs'],
          name: 'Squat',
          muscleCategory: MuscleCategory.Quads,
          targetRepetitions: '6-8',
          targetRepetitionsInReserve: '2',
          equipment: 'Barbell',
          sets: [],
        },
      ],
    },
  ],
};

// Periodized Program: 12-Week Hypertrophy (advanced users)
export const mockPeriodizedProgram: Program = {
  id: 'periodized-hyp-1',
  userId: MOCK_USER_ID,
  name: '12-Week Hypertrophy Block',
  description: 'Progressive hypertrophy program with accumulation, intensification, and deload phases',
  type: 'periodized',
  isActive: false,
  tags: ['Advanced', '4x/week', 'Periodization', 'Hypertrophy'],
  mesocycles: [
    {
      id: 'meso-1',
      userId: MOCK_USER_ID,
      name: 'Accumulation Phase',
      description: 'High volume, moderate intensity',
      goal: 'Hypertrophy',
      durationWeeks: 4,
      microcycles: [
        {
          id: 'micro-1',
          userId: MOCK_USER_ID,
          mesocycleId: 'meso-1',
          weekNumber: 1,
          name: 'Week 1',
          volumeTarget: 'high',
          intensityTarget: 'moderate',
          trainingDays: [
            {
              id: 'w1-upper',
              userId: MOCK_USER_ID,
              microcycleId: 'micro-1',
              name: 'Upper Body',
              exercises: [
                {
                  id: 'w1-ex-1',
                  userId: MOCK_USER_ID,
                  trainingDayIds: ['w1-upper'],
                  name: 'Incline Bench Press',
                  muscleCategory: MuscleCategory.Chest,
                  muscleSubcategory: 'Upper',
                  targetRepetitions: '8-12',
                  targetRepetitionsInReserve: '2-3',
                  equipment: 'Barbell',
                  sets: [],
                },
              ],
            },
            {
              id: 'w1-lower',
              userId: MOCK_USER_ID,
              microcycleId: 'micro-1',
              name: 'Lower Body',
              exercises: [
                {
                  id: 'w1-ex-2',
                  userId: MOCK_USER_ID,
                  trainingDayIds: ['w1-lower'],
                  name: 'Squat',
                  muscleCategory: MuscleCategory.Quads,
                  targetRepetitions: '8-10',
                  targetRepetitionsInReserve: '2',
                  equipment: 'Barbell',
                  sets: [],
                },
              ],
            },
          ],
        },
        {
          id: 'micro-2',
          userId: MOCK_USER_ID,
          mesocycleId: 'meso-1',
          weekNumber: 2,
          name: 'Week 2',
          volumeTarget: 'high',
          intensityTarget: 'moderate',
          trainingDays: [], // Simplified for brevity
        },
      ],
    },
    {
      id: 'meso-2',
      userId: MOCK_USER_ID,
      name: 'Intensification Phase',
      description: 'Moderate volume, higher intensity',
      goal: 'Strength',
      durationWeeks: 3,
      microcycles: [], // Simplified for brevity
    },
    {
      id: 'meso-3',
      userId: MOCK_USER_ID,
      name: 'Deload',
      description: 'Recovery week',
      goal: 'Deload',
      durationWeeks: 1,
      microcycles: [], // Simplified for brevity
    },
  ],
};

// Combined list for the UI
export const mockFullPrograms: Program[] = [
  mockSimpleProgram,
  mockPeriodizedProgram,
];

// Previous Sessions
export const mockLastSession: TrainingDay = {
  id: 'last-session-1',
  userId: MOCK_USER_ID,
  name: 'Pull Day',
  description: 'Back, biceps',
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
  exercises: [
    {
      id: 'last-ex-1',
      userId: MOCK_USER_ID,
      trainingDayIds: ['last-session-1'],
      name: 'Pull-ups',
      muscleCategory: MuscleCategory.Back,
      muscleSubcategory: 'Upper Lats',
      sets: [
        {
          id: 'set-1',
          userId: MOCK_USER_ID,
          weight: 0,
          weightType: 'bodyweight',
          repetitions: 10,
          repetitionsInReserve: 2,
          rateOfPerceivedExertion: 7.5,
        },
      ],
    },
  ],
};

export const mockPreviousInstanceOfToday: TrainingDay = {
  id: 'prev-instance-1',
  userId: MOCK_USER_ID,
  name: 'Upper Body Push',
  description: 'Chest, shoulders, and triceps focus',
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last week
  exercises: [
    {
      id: 'prev-ex-1',
      userId: MOCK_USER_ID,
      trainingDayIds: ['prev-instance-1'],
      name: 'Incline Barbell Press',
      muscleCategory: MuscleCategory.Chest,
      muscleSubcategory: 'Upper',
      sets: [
        {
          id: 'prev-set-1',
          userId: MOCK_USER_ID,
          weight: 180,
          weightType: 'lbs',
          repetitions: 10,
          repetitionsInReserve: 2,
          rateOfPerceivedExertion: 8,
        },
        {
          id: 'prev-set-2',
          userId: MOCK_USER_ID,
          weight: 180,
          weightType: 'lbs',
          repetitions: 9,
          repetitionsInReserve: 2,
          rateOfPerceivedExertion: 8.5,
        },
      ],
    },
  ],
};
