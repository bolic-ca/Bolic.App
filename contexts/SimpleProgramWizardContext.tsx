import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrainingExercise, Program, TrainingDay } from '@/types/training';
import { usePrograms } from '@/hooks/usePrograms';
import { useStorage } from '@/contexts/StorageContext';

const SIMPLE_WIZARD_DRAFT_KEY = 'simple_program_wizard_draft';

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export interface WizardTrainingDay {
  tempId: string;
  name: string;
  description: string;
  exercises: TrainingExercise[];
}

export interface SimpleProgramWizardState {
  // Program info
  name: string;
  description: string;
  schedule: 'rotating' | 'weekly';

  // Training days
  trainingDays: WizardTrainingDay[];

  // Navigation state
  currentDayIndex: number | null;

  // Edit mode
  editProgramId?: string;
}

interface SimpleProgramWizardContextType {
  state: SimpleProgramWizardState;

  // Program info
  setProgramInfo: (info: Partial<Pick<SimpleProgramWizardState, 'name' | 'description' | 'schedule'>>) => void;

  // Training days
  addTrainingDay: () => void;
  updateTrainingDay: (index: number, data: Partial<Omit<WizardTrainingDay, 'tempId'>>) => void;
  deleteTrainingDay: (index: number) => void;
  duplicateTrainingDay: (index: number) => void;
  reorderTrainingDays: (fromIndex: number, toIndex: number) => void;

  // Exercises
  addExercise: (dayIndex: number, exercise: TrainingExercise) => void;
  updateExercise: (dayIndex: number, exerciseIndex: number, data: Partial<TrainingExercise>) => void;
  removeExercise: (dayIndex: number, exerciseIndex: number) => void;
  reorderExercises: (dayIndex: number, fromIndex: number, toIndex: number) => void;

  // Navigation
  setCurrentDay: (index: number | null) => void;

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

const initialState: SimpleProgramWizardState = {
  name: '',
  description: '',
  schedule: 'rotating',
  trainingDays: [],
  currentDayIndex: null,
};

const SimpleProgramWizardContext = createContext<SimpleProgramWizardContextType | undefined>(undefined);

export function SimpleProgramWizardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { userId } = useStorage();
  const { createProgram, updateProgram, programs, loading: programsLoading } = usePrograms();

  const [state, setState] = useState<SimpleProgramWizardState>(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.name || state.trainingDays.length > 0) {
        saveDraft();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [state]);

  const loadDraft = async () => {
    try {
      const draft = await AsyncStorage.getItem(SIMPLE_WIZARD_DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        setState(parsed);
        setHasDraft(true);
      }
    } catch (err) {
      console.error('Error loading draft:', err);
    }
  };

  const saveDraft = async () => {
    try {
      await AsyncStorage.setItem(SIMPLE_WIZARD_DRAFT_KEY, JSON.stringify(state));
      setHasDraft(true);
    } catch (err) {
      console.error('Error saving draft:', err);
    }
  };

  const discardDraft = async () => {
    try {
      await AsyncStorage.removeItem(SIMPLE_WIZARD_DRAFT_KEY);
      setHasDraft(false);
      setState(initialState);
    } catch (err) {
      console.error('Error discarding draft:', err);
    }
  };

  const setProgramInfo = useCallback((info: Partial<Pick<SimpleProgramWizardState, 'name' | 'description' | 'schedule'>>) => {
    setState(prev => ({ ...prev, ...info }));
  }, []);

  const addTrainingDay = useCallback(() => {
    const newDay: WizardTrainingDay = {
      tempId: generateId(),
      name: `Day ${state.trainingDays.length + 1}`,
      description: '',
      exercises: [],
    };
    setState(prev => ({
      ...prev,
      trainingDays: [...prev.trainingDays, newDay],
    }));
  }, [state.trainingDays.length]);

  const updateTrainingDay = useCallback((index: number, data: Partial<Omit<WizardTrainingDay, 'tempId'>>) => {
    setState(prev => {
      const updated = [...prev.trainingDays];
      updated[index] = { ...updated[index], ...data };
      return { ...prev, trainingDays: updated };
    });
  }, []);

  const deleteTrainingDay = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      trainingDays: prev.trainingDays.filter((_, i) => i !== index),
      currentDayIndex: prev.currentDayIndex === index ? null : prev.currentDayIndex,
    }));
  }, []);

  const duplicateTrainingDay = useCallback((index: number) => {
    setState(prev => {
      const dayToDuplicate = prev.trainingDays[index];
      const duplicated: WizardTrainingDay = {
        ...dayToDuplicate,
        tempId: generateId(),
        name: `${dayToDuplicate.name} (Copy)`,
        exercises: dayToDuplicate.exercises.map(ex => ({ ...ex })),
      };
      const updated = [...prev.trainingDays];
      updated.splice(index + 1, 0, duplicated);
      return { ...prev, trainingDays: updated };
    });
  }, []);

  const reorderTrainingDays = useCallback((fromIndex: number, toIndex: number) => {
    setState(prev => {
      const updated = [...prev.trainingDays];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return { ...prev, trainingDays: updated };
    });
  }, []);

  const addExercise = useCallback((dayIndex: number, exercise: TrainingExercise) => {
    setState(prev => {
      const updated = [...prev.trainingDays];
      updated[dayIndex] = {
        ...updated[dayIndex],
        exercises: [...updated[dayIndex].exercises, exercise],
      };
      return { ...prev, trainingDays: updated };
    });
  }, []);

  const updateExercise = useCallback((dayIndex: number, exerciseIndex: number, data: Partial<TrainingExercise>) => {
    setState(prev => {
      const updated = [...prev.trainingDays];
      const exercises = [...updated[dayIndex].exercises];
      exercises[exerciseIndex] = { ...exercises[exerciseIndex], ...data };
      updated[dayIndex] = { ...updated[dayIndex], exercises };
      return { ...prev, trainingDays: updated };
    });
  }, []);

  const removeExercise = useCallback((dayIndex: number, exerciseIndex: number) => {
    setState(prev => {
      const updated = [...prev.trainingDays];
      updated[dayIndex] = {
        ...updated[dayIndex],
        exercises: updated[dayIndex].exercises.filter((_, i) => i !== exerciseIndex),
      };
      return { ...prev, trainingDays: updated };
    });
  }, []);

  const reorderExercises = useCallback((dayIndex: number, fromIndex: number, toIndex: number) => {
    setState(prev => {
      const updated = [...prev.trainingDays];
      const exercises = [...updated[dayIndex].exercises];
      const [removed] = exercises.splice(fromIndex, 1);
      exercises.splice(toIndex, 0, removed);
      updated[dayIndex] = { ...updated[dayIndex], exercises };
      return { ...prev, trainingDays: updated };
    });
  }, []);

  const setCurrentDay = useCallback((index: number | null) => {
    setState(prev => ({ ...prev, currentDayIndex: index }));
  }, []);

  const canProceedFromStep1 = useCallback(() => {
    return state.name.trim().length > 0;
  }, [state.name]);

  const canSave = useCallback(() => {
    return state.name.trim().length > 0 && state.trainingDays.length > 0;
  }, [state.name, state.trainingDays.length]);

  const saveProgram = useCallback(async (): Promise<boolean> => {
    if (!canSave()) {
      Alert.alert('Validation Error', 'Please provide a program name and at least one training day.');
      return false;
    }

    try {
      setIsSaving(true);

      // Convert wizard state to Program format
      const trainingDays: TrainingDay[] = state.trainingDays.map((day, index) => ({
        id: generateId(),
        userId,
        name: day.name,
        description: day.description || undefined,
        number: index + 1,
        exercises: day.exercises.map(ex => ({
          ...ex,
          id: ex.id || generateId(),
          userId,
          trainingDayIds: [],
        })),
      }));

      const program: Omit<Program, 'id'> = {
        userId,
        name: state.name,
        description: state.description || undefined,
        type: 'simple',
        schedule: state.schedule,
        trainingDays,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      if (state.editProgramId) {
        await updateProgram({ ...program, id: state.editProgramId });
        Alert.alert('Success', 'Program updated successfully!');
      } else {
        await createProgram(program);
        Alert.alert('Success', 'Program created successfully!');
      }

      // Clear draft
      await discardDraft();

      // Reset wizard
      setState(initialState);

      // Navigate back to programs tab (exit wizard completely)
      router.dismissAll();
      router.replace('/(tabs)/programs');

      return true;
    } catch (err) {
      console.error('Error saving program:', err);
      Alert.alert('Error', 'Failed to save program. Please try again.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [state, userId, canSave, createProgram, updateProgram, router, discardDraft]);

  const resetWizard = useCallback(() => {
    setState(initialState);
  }, []);

  const loadProgramForEdit = useCallback(async (programId: string) => {
    // Don't try to load if programs are still loading
    if (programsLoading) {
      return;
    }

    try {
      setIsLoading(true);
      const program = programs.find(p => p.id === programId);

      if (!program || program.type !== 'simple') {
        Alert.alert('Error', 'Program not found or is not a simple program');
        return;
      }

      const wizardState: SimpleProgramWizardState = {
        name: program.name,
        description: program.description || '',
        schedule: program.schedule || 'rotating',
        trainingDays: (program.trainingDays || []).map((day: TrainingDay) => ({
          tempId: generateId(),
          name: day.name || '',
          description: day.description || '',
          exercises: day.exercises || [],
        })),
        currentDayIndex: null,
        editProgramId: programId,
      };

      setState(wizardState);
    } catch (err) {
      console.error('Error loading program for edit:', err);
      Alert.alert('Error', 'Failed to load program');
    } finally {
      setIsLoading(false);
    }
  }, [programs, programsLoading]);

  const value: SimpleProgramWizardContextType = {
    state,
    setProgramInfo,
    addTrainingDay,
    updateTrainingDay,
    deleteTrainingDay,
    duplicateTrainingDay,
    reorderTrainingDays,
    addExercise,
    updateExercise,
    removeExercise,
    reorderExercises,
    setCurrentDay,
    saveProgram,
    resetWizard,
    discardDraft,
    loadProgramForEdit,
    canProceedFromStep1,
    canSave,
    isSaving,
    isLoading,
    hasDraft,
    isEditMode: !!state.editProgramId,
  };

  return (
    <SimpleProgramWizardContext.Provider value={value}>
      {children}
    </SimpleProgramWizardContext.Provider>
  );
}

export function useSimpleProgramWizard() {
  const context = useContext(SimpleProgramWizardContext);
  if (!context) {
    throw new Error('useSimpleProgramWizard must be used within SimpleProgramWizardProvider');
  }
  return context;
}
