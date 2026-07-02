import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@bolic_theme_customization';
const PREFERENCES_STORAGE_KEY = '@bolic_preferences';

export type WeightUnit = 'kg' | 'lbs';

interface ThemeCustomization {
  primaryButton: string;
  primaryButtonText: string;
}

interface UserPreferences {
  weightUnit: WeightUnit;
  showRir: boolean;
  showRpe: boolean;
  showNotes: boolean;
  showQuality: boolean;
}

interface ThemeContextType {
  customColors: ThemeCustomization;
  setCustomColors: (colors: ThemeCustomization) => void;
  presetColors: { name: string; button: string; text: string }[];
  preferences: UserPreferences;
  setWeightUnit: (unit: WeightUnit) => void;
  setShowRir: (value: boolean) => void;
  setShowRpe: (value: boolean) => void;
  setShowNotes: (value: boolean) => void;
  setShowQuality: (value: boolean) => void;
  isLoaded: boolean;
}

const defaultColors: ThemeCustomization = {
  primaryButton: '#dc2626',
  primaryButtonText: '#fff',
};

const defaultPreferences: UserPreferences = {
  weightUnit: 'lbs',
  showRir: true,
  showRpe: true,
  showNotes: true,
  showQuality: false,
};

export const presetColors = [
  { name: 'Crimson Red', button: '#dc2626', text: '#fff' },
  { name: 'Ocean Blue', button: '#0a7ea4', text: '#fff' },
  { name: 'Sunset Orange', button: '#F97316', text: '#fff' },
  { name: 'Forest Green', button: '#059669', text: '#fff' },
  { name: 'Royal Purple', button: '#7c3aed', text: '#fff' },
  { name: 'Pink Pop', button: '#db2777', text: '#fff' },
  { name: 'Slate Gray', button: '#475569', text: '#fff' },
  { name: 'Electric Cyan', button: '#06b6d4', text: '#fff' },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [customColors, setCustomColorsState] = useState<ThemeCustomization>(defaultColors);
  const [preferences, setPreferencesState] = useState<UserPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved colors and preferences on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const [savedColors, savedPreferences] = await Promise.all([
          AsyncStorage.getItem(THEME_STORAGE_KEY),
          AsyncStorage.getItem(PREFERENCES_STORAGE_KEY),
        ]);

        if (savedColors) {
          const parsed = JSON.parse(savedColors) as ThemeCustomization;
          setCustomColorsState(parsed);
        }

        if (savedPreferences) {
          const parsed = JSON.parse(savedPreferences) as UserPreferences;
          setPreferencesState(parsed);
        }
      } catch (error) {
        console.error('Error loading theme/preferences:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSavedData();
  }, []);

  // Save colors when they change
  const setCustomColors = async (colors: ThemeCustomization) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(colors));
      setCustomColorsState(colors);
    } catch (error) {
      console.error('Error saving theme colors:', error);
    }
  };

  const savePreferences = async (updated: UserPreferences) => {
    await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
    setPreferencesState(updated);
  };

  const setWeightUnit = async (unit: WeightUnit) => {
    try {
      await savePreferences({ ...preferences, weightUnit: unit });
    } catch (error) {
      console.error('Error saving weight unit:', error);
    }
  };

  const setShowRir = async (value: boolean) => {
    try {
      await savePreferences({ ...preferences, showRir: value });
    } catch (error) {
      console.error('Error saving showRir:', error);
    }
  };

  const setShowRpe = async (value: boolean) => {
    try {
      await savePreferences({ ...preferences, showRpe: value });
    } catch (error) {
      console.error('Error saving showRpe:', error);
    }
  };

  const setShowNotes = async (value: boolean) => {
    try {
      await savePreferences({ ...preferences, showNotes: value });
    } catch (error) {
      console.error('Error saving showNotes:', error);
    }
  };

  const setShowQuality = async (value: boolean) => {
    try {
      await savePreferences({ ...preferences, showQuality: value });
    } catch (error) {
      console.error('Error saving showQuality:', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        customColors,
        setCustomColors,
        presetColors,
        preferences,
        setWeightUnit,
        setShowRir,
        setShowRpe,
        setShowNotes,
        setShowQuality,
        isLoaded,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeCustomization() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeCustomization must be used within ThemeProvider');
  }
  return context;
}
