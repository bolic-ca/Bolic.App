import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrainingExercise, Program, Mesocycle, Microcycle, TrainingDay } from '@/types/training';
import { usePrograms } from '@/hooks/usePrograms';
import { useStorage } from '@/contexts/StorageContext';

const WIZARD_DRAFT_KEY = 'program_wizard_draft';

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Types for wizard state
export type MesocycleGoal = 'Hypertrophy' | 'Strength' | 'Deload' | 'Peaking' | '';
export type VolumeIntensityTarget = 'low' | 'moderate' | 'high';

export interface WizardTrainingDay {
  tempId: string;
  name: string;
  description: string;
  exercises: TrainingExercise[];
}

export interface WizardMicrocycle {
  tempId: string;
  weekNumber: number;
  name: string;
  volumeTarget?: VolumeIntensityTarget;
  intensityTarget?: VolumeIntensityTarget;
  trainingDays: WizardTrainingDay[];
}

export interface WizardState {
  // Mesocycle info
  name: string;
  description: string;
  goal: MesocycleGoal;
  durationWeeks: number;

  // Structure
  microcycles: WizardMicrocycle[];

  // Navigation state
  currentMicrocycleIndex: number | null;
  currentTrainingDayIndex: number | null;

  // Edit mode
  editProgramId?: string;
}

interface ProgramWizardContextType {
  state: WizardState;

  // Step 1: Mesocycle info
  setMesocycleInfo: (info: Partial<Pick<WizardState, 'name' | 'description' | 'goal' | 'durationWeeks'>>) => void;

  // Step 2: Microcycles
  addMicrocycle: () => void;
  updateMicrocycle: (index: number, data: Partial<Omit<WizardMicrocycle, 'tempId'>>) => void;
  deleteMicrocycle: (index: number) => void;
  duplicateMicrocycle: (index: number) => void;

  // Step 3: Training Days
  addTrainingDay: (microcycleIndex: number) => void;
  updateTrainingDay: (microcycleIndex: number, dayIndex: number, data: Partial<Omit<WizardTrainingDay, 'tempId'>>) => void;
  deleteTrainingDay: (microcycleIndex: number, dayIndex: number) => void;

  // Step 4: Exercises
  addExercise: (microcycleIndex: number, dayIndex: number, exercise: TrainingExercise) => void;
  updateExercise: (microcycleIndex: number, dayIndex: number, exerciseIndex: number, data: Partial<TrainingExercise>) => void;
  removeExercise: (microcycleIndex: number, dayIndex: number, exerciseIndex: number) => void;
  reorderExercises: (microcycleIndex: number, dayIndex: number, fromIndex: number, toIndex: number) => void;

  // Navigation
  setCurrentMicrocycle: (index: number | null) => void;
  setCurrentTrainingDay: (index: number | null) => void;

  // Final actions
  saveProgram: () => Promise<boolean>;
  resetWizard: () => void;
  discardDraft: () => Promise<void>;
  loadProgramForEdit: (programId: string) => Promise<void>;

  // Validation
  canProceedFromStep1: () => boolean;
  canSave: () => boolean;

  // Loading/draft state
  isSaving: boolean;
  isLoading: boolean;
  hasDraft: boolean;
  isEditMode: boolean;
}

const initialState: WizardState = {
  name: '',
  description: '',
  goal: '',
  durationWeeks: 4,
  microcycles: [],
  currentMicrocycleIndex: null,
  currentTrainingDayIndex: null,
};

const ProgramWizardContext = createContext<ProgramWizardContextType | null>(null);

export function ProgramWizardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WizardState>(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDraft, setHasDraft] = useState(false);
  const { createProgram, updateProgram, programs } = usePrograms();
  const { userId } = useStorage();
  const router = useRouter();
  const isInitialMount = useRef(true);
  const isEditMode = !!state.editProgramId;

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draftJson = await AsyncStorage.getItem(WIZARD_DRAFT_KEY);
        if (draftJson) {
          const draft = JSON.parse(draftJson) as WizardState;
          // Only load if there's actual content
          if (draft.name || draft.microcycles.some(m => m.trainingDays.length > 0)) {
            setState(draft);
            setHasDraft(true);
          }
        }
      } catch (error) {
        console.error('Failed to load wizard draft:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDraft();
  }, []);

  // Save draft on state changes (debounced)
  useEffect(() => {
    // Skip saving on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Skip saving if still loading
    if (isLoading) return;

    const saveDraft = async () => {
      try {
        // Only save if there's actual content worth saving
        const hasContent = state.name || state.microcycles.some(m => m.trainingDays.length > 0);
        if (hasContent) {
          await AsyncStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(state));
          setHasDraft(true);
        }
      } catch (error) {
        console.error('Failed to save wizard draft:', error);
      }
    };

    // Debounce saves
    const timeoutId = setTimeout(saveDraft, 500);
    return () => clearTimeout(timeoutId);
  }, [state, isLoading]);

  // Clear draft from storage
  const clearDraft = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(WIZARD_DRAFT_KEY);
      setHasDraft(false);
    } catch (error) {
      console.error('Failed to clear wizard draft:', error);
    }
  }, []);

  // Step 1: Mesocycle info
  const setMesocycleInfo = useCallback((info: Partial<Pick<WizardState, 'name' | 'description' | 'goal' | 'durationWeeks'>>) => {
    setState(prev => {
      const newState = { ...prev, ...info };

      // Auto-generate microcycles if duration changed and we have no microcycles yet
      if (info.durationWeeks !== undefined && info.durationWeeks !== prev.durationWeeks) {
        if (prev.microcycles.length === 0 ||
            (prev.microcycles.length === prev.durationWeeks &&
             prev.microcycles.every(m => m.trainingDays.length === 0))) {
          // Generate new microcycles
          newState.microcycles = Array.from({ length: info.durationWeeks }, (_, i) => ({
            tempId: generateId(),
            weekNumber: i + 1,
            name: `Week ${i + 1}`,
            trainingDays: [],
          }));
        }
      }

      return newState;
    });
  }, []);

  // Step 2: Microcycles
  const addMicrocycle = useCallback(() => {
    setState(prev => {
      const nextWeekNumber = prev.microcycles.length > 0
        ? Math.max(...prev.microcycles.map(m => m.weekNumber)) + 1
        : 1;
      return {
        ...prev,
        microcycles: [
          ...prev.microcycles,
          {
            tempId: generateId(),
            weekNumber: nextWeekNumber,
            name: `Week ${nextWeekNumber}`,
            trainingDays: [],
          },
        ],
        durationWeeks: prev.durationWeeks + 1,
      };
    });
  }, []);

  const updateMicrocycle = useCallback((index: number, data: Partial<Omit<WizardMicrocycle, 'tempId'>>) => {
    setState(prev => ({
      ...prev,
      microcycles: prev.microcycles.map((m, i) =>
        i === index ? { ...m, ...data } : m
      ),
    }));
  }, []);

  const deleteMicrocycle = useCallback((index: number) => {
    setState(prev => {
      const newMicrocycles = prev.microcycles.filter((_, i) => i !== index);
      // Renumber weeks
      const renumbered = newMicrocycles.map((m, i) => ({
        ...m,
        weekNumber: i + 1,
        name: m.name.startsWith('Week ') ? `Week ${i + 1}` : m.name,
      }));
      return {
        ...prev,
        microcycles: renumbered,
        durationWeeks: renumbered.length,
      };
    });
  }, []);

  const duplicateMicrocycle = useCallback((index: number) => {
    setState(prev => {
      const source = prev.microcycles[index];
      if (!source) return prev;

      const duplicate: WizardMicrocycle = {
        ...source,
        tempId: generateId(),
        weekNumber: prev.microcycles.length + 1,
        name: `Week ${prev.microcycles.length + 1}`,
        trainingDays: source.trainingDays.map(day => ({
          ...day,
          tempId: generateId(),
          exercises: day.exercises.map(ex => ({ ...ex })),
        })),
      };

      return {
        ...prev,
        microcycles: [...prev.microcycles, duplicate],
        durationWeeks: prev.durationWeeks + 1,
      };
    });
  }, []);

  // Step 3: Training Days
  const addTrainingDay = useCallback((microcycleIndex: number) => {
    setState(prev => {
      const microcycle = prev.microcycles[microcycleIndex];
      if (!microcycle) return prev;

      const dayNumber = microcycle.trainingDays.length + 1;
      const newDay: WizardTrainingDay = {
        tempId: generateId(),
        name: `Day ${dayNumber}`,
        description: '',
        exercises: [],
      };

      return {
        ...prev,
        microcycles: prev.microcycles.map((m, i) =>
          i === microcycleIndex
            ? { ...m, trainingDays: [...m.trainingDays, newDay] }
            : m
        ),
      };
    });
  }, []);

  const updateTrainingDay = useCallback((microcycleIndex: number, dayIndex: number, data: Partial<Omit<WizardTrainingDay, 'tempId'>>) => {
    setState(prev => ({
      ...prev,
      microcycles: prev.microcycles.map((m, mi) =>
        mi === microcycleIndex
          ? {
              ...m,
              trainingDays: m.trainingDays.map((d, di) =>
                di === dayIndex ? { ...d, ...data } : d
              ),
            }
          : m
      ),
    }));
  }, []);

  const deleteTrainingDay = useCallback((microcycleIndex: number, dayIndex: number) => {
    setState(prev => ({
      ...prev,
      microcycles: prev.microcycles.map((m, mi) =>
        mi === microcycleIndex
          ? {
              ...m,
              trainingDays: m.trainingDays.filter((_, di) => di !== dayIndex),
            }
          : m
      ),
    }));
  }, []);

  // Step 4: Exercises
  const addExercise = useCallback((microcycleIndex: number, dayIndex: number, exercise: TrainingExercise) => {
    setState(prev => ({
      ...prev,
      microcycles: prev.microcycles.map((m, mi) =>
        mi === microcycleIndex
          ? {
              ...m,
              trainingDays: m.trainingDays.map((d, di) =>
                di === dayIndex
                  ? { ...d, exercises: [...d.exercises, { ...exercise, id: generateId() }] }
                  : d
              ),
            }
          : m
      ),
    }));
  }, []);

  const updateExercise = useCallback((microcycleIndex: number, dayIndex: number, exerciseIndex: number, data: Partial<TrainingExercise>) => {
    setState(prev => ({
      ...prev,
      microcycles: prev.microcycles.map((m, mi) =>
        mi === microcycleIndex
          ? {
              ...m,
              trainingDays: m.trainingDays.map((d, di) =>
                di === dayIndex
                  ? {
                      ...d,
                      exercises: d.exercises.map((ex, ei) =>
                        ei === exerciseIndex ? { ...ex, ...data } : ex
                      ),
                    }
                  : d
              ),
            }
          : m
      ),
    }));
  }, []);

  const removeExercise = useCallback((microcycleIndex: number, dayIndex: number, exerciseIndex: number) => {
    setState(prev => ({
      ...prev,
      microcycles: prev.microcycles.map((m, mi) =>
        mi === microcycleIndex
          ? {
              ...m,
              trainingDays: m.trainingDays.map((d, di) =>
                di === dayIndex
                  ? { ...d, exercises: d.exercises.filter((_, ei) => ei !== exerciseIndex) }
                  : d
              ),
            }
          : m
      ),
    }));
  }, []);

  const reorderExercises = useCallback((microcycleIndex: number, dayIndex: number, fromIndex: number, toIndex: number) => {
    setState(prev => {
      const microcycle = prev.microcycles[microcycleIndex];
      if (!microcycle) return prev;
      const day = microcycle.trainingDays[dayIndex];
      if (!day) return prev;

      const exercises = [...day.exercises];
      const [removed] = exercises.splice(fromIndex, 1);
      exercises.splice(toIndex, 0, removed);

      return {
        ...prev,
        microcycles: prev.microcycles.map((m, mi) =>
          mi === microcycleIndex
            ? {
                ...m,
                trainingDays: m.trainingDays.map((d, di) =>
                  di === dayIndex ? { ...d, exercises } : d
                ),
              }
            : m
        ),
      };
    });
  }, []);

  // Navigation
  const setCurrentMicrocycle = useCallback((index: number | null) => {
    setState(prev => ({ ...prev, currentMicrocycleIndex: index }));
  }, []);

  const setCurrentTrainingDay = useCallback((index: number | null) => {
    setState(prev => ({ ...prev, currentTrainingDayIndex: index }));
  }, []);

  // Validation
  const canProceedFromStep1 = useCallback(() => {
    return state.name.trim().length > 0;
  }, [state.name]);

  const canSave = useCallback(() => {
    if (!state.name.trim()) return false;
    if (state.microcycles.length === 0) return false;
    // At least one training day across all microcycles
    const totalDays = state.microcycles.reduce((sum, m) => sum + m.trainingDays.length, 0);
    return totalDays > 0;
  }, [state.name, state.microcycles]);

  // Load program for editing
  const loadProgramForEdit = useCallback(async (programId: string) => {
    const program = programs.find(p => p.id === programId);
    if (!program || program.type !== 'periodized' || !program.mesocycles?.[0]) {
      Alert.alert('Error', 'Program not found or not periodized');
      return;
    }

    const mesocycle = program.mesocycles[0];

    // Transform Program to WizardState
    const wizardMicrocycles: WizardMicrocycle[] = mesocycle.microcycles.map((micro: Microcycle) => ({
      tempId: micro.id,
      weekNumber: micro.weekNumber,
      name: micro.name || `Week ${micro.weekNumber}`,
      volumeTarget: micro.volumeTarget,
      intensityTarget: micro.intensityTarget,
      trainingDays: micro.trainingDays.map((day: TrainingDay) => ({
        tempId: day.id || generateId(),
        name: day.name || '',
        description: day.description || '',
        exercises: day.exercises || [],
      })),
    }));

    setState({
      name: mesocycle.name,
      description: mesocycle.description || '',
      goal: (mesocycle.goal as MesocycleGoal) || '',
      durationWeeks: mesocycle.durationWeeks || wizardMicrocycles.length,
      microcycles: wizardMicrocycles,
      currentMicrocycleIndex: null,
      currentTrainingDayIndex: null,
      editProgramId: programId,
    });
  }, [programs]);

  // Transform wizard state to Program
  const transformToProgram = useCallback((): Program => {
    const programId = state.editProgramId || generateId();
    const mesocycleId = state.editProgramId
      ? programs.find(p => p.id === state.editProgramId)?.mesocycles?.[0]?.id || generateId()
      : generateId();

    const microcycles: Microcycle[] = state.microcycles.map(micro => {
      // In edit mode, preserve existing IDs; in create mode, generate new ones
      const microcycleId = state.editProgramId && micro.tempId ? micro.tempId : generateId();

      const trainingDays: TrainingDay[] = micro.trainingDays.map((day, dayIndex) => ({
        id: state.editProgramId && day.tempId ? day.tempId : generateId(),
        userId: userId || '',
        microcycleId,
        number: dayIndex + 1,
        name: day.name,
        description: day.description || undefined,
        exercises: day.exercises.map(ex => ({
          ...ex,
          id: ex.id || generateId(),
          userId: userId || '',
          trainingDayIds: [],
        })),
      }));

      return {
        id: microcycleId,
        userId: userId || '',
        mesocycleId,
        weekNumber: micro.weekNumber,
        name: micro.name,
        volumeTarget: micro.volumeTarget,
        intensityTarget: micro.intensityTarget,
        trainingDays,
      };
    });

    const mesocycle: Mesocycle = {
      id: mesocycleId,
      userId: userId || '',
      programId,
      name: state.name,
      description: state.description || undefined,
      goal: state.goal || undefined,
      durationWeeks: state.durationWeeks,
      microcycles,
    };

    const existingProgram = state.editProgramId
      ? programs.find(p => p.id === state.editProgramId)
      : null;

    return {
      id: programId,
      userId: userId || '',
      name: state.name,
      description: state.description || undefined,
      type: 'periodized',
      mesocycles: [mesocycle],
      createdDate: existingProgram?.createdDate || new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
  }, [state, userId, programs]);

  // Save program
  const saveProgram = useCallback(async (): Promise<boolean> => {
    if (!canSave()) {
      Alert.alert('Cannot Save', 'Please add a program name and at least one training day.');
      return false;
    }

    setIsSaving(true);
    try {
      const program = transformToProgram();
      if (state.editProgramId) {
        await updateProgram(program);
        Alert.alert('Success', 'Program updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setState(initialState);
              router.dismissAll();
              router.replace('/(tabs)/programs');
            },
          },
        ]);
      } else {
        await createProgram(program);
        await clearDraft();
        Alert.alert('Success', 'Program created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setState(initialState);
              router.dismissAll();
              router.replace('/(tabs)/programs');
            },
          },
        ]);
      }
      return true;
    } catch (error) {
      Alert.alert('Error', `Failed to ${state.editProgramId ? 'update' : 'create'} program. Please try again.`);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [canSave, transformToProgram, createProgram, updateProgram, router, clearDraft, state.editProgramId]);

  // Reset wizard and clear draft
  const resetWizard = useCallback(async () => {
    setState(initialState);
    await clearDraft();
  }, [clearDraft]);

  // Discard draft (same as reset but with confirmation already done)
  const discardDraft = useCallback(async () => {
    setState(initialState);
    await clearDraft();
  }, [clearDraft]);

  const value = useMemo<ProgramWizardContextType>(() => ({
    state,
    setMesocycleInfo,
    addMicrocycle,
    updateMicrocycle,
    deleteMicrocycle,
    duplicateMicrocycle,
    addTrainingDay,
    updateTrainingDay,
    deleteTrainingDay,
    addExercise,
    updateExercise,
    removeExercise,
    reorderExercises,
    setCurrentMicrocycle,
    setCurrentTrainingDay,
    saveProgram,
    resetWizard,
    discardDraft,
    loadProgramForEdit,
    canProceedFromStep1,
    canSave,
    isSaving,
    isLoading,
    hasDraft,
    isEditMode,
  }), [
    state,
    setMesocycleInfo,
    addMicrocycle,
    updateMicrocycle,
    deleteMicrocycle,
    duplicateMicrocycle,
    addTrainingDay,
    updateTrainingDay,
    deleteTrainingDay,
    addExercise,
    updateExercise,
    removeExercise,
    reorderExercises,
    setCurrentMicrocycle,
    setCurrentTrainingDay,
    saveProgram,
    resetWizard,
    discardDraft,
    loadProgramForEdit,
    canProceedFromStep1,
    canSave,
    isSaving,
    isLoading,
    hasDraft,
    isEditMode,
  ]);

  return (
    <ProgramWizardContext.Provider value={value}>
      {children}
    </ProgramWizardContext.Provider>
  );
}

export function useProgramWizard() {
  const context = useContext(ProgramWizardContext);
  if (!context) {
    throw new Error('useProgramWizard must be used within a ProgramWizardProvider');
  }
  return context;
}
