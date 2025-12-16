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
}

interface ThemeContextType {
  customColors: ThemeCustomization;
  setCustomColors: (colors: ThemeCustomization) => void;
  presetColors: { name: string; button: string; text: string }[];
  preferences: UserPreferences;
  setWeightUnit: (unit: WeightUnit) => void;
  isLoaded: boolean;
}

const defaultColors: ThemeCustomization = {
  primaryButton: '#F97316', // Vibrant orange (matching Athletic design)
  primaryButtonText: '#fff',
};

const defaultPreferences: UserPreferences = {
  weightUnit: 'lbs',
};

export const presetColors = [
  { name: 'Sunset Orange', button: '#F97316', text: '#fff' },
  { name: 'Ocean Blue', button: '#0a7ea4', text: '#fff' },
  { name: 'Crimson Red', button: '#dc2626', text: '#fff' },
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

  // Save weight unit preference
  const setWeightUnit = async (unit: WeightUnit) => {
    try {
      const newPreferences = { ...preferences, weightUnit: unit };
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(newPreferences));
      setPreferencesState(newPreferences);
    } catch (error) {
      console.error('Error saving weight unit:', error);
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
