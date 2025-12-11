import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@bolic_theme_customization';

interface ThemeCustomization {
  primaryButton: string;
  primaryButtonText: string;
}

interface ThemeContextType {
  customColors: ThemeCustomization;
  setCustomColors: (colors: ThemeCustomization) => void;
  presetColors: { name: string; button: string; text: string }[];
  isLoaded: boolean;
}

const defaultColors: ThemeCustomization = {
  primaryButton: '#F97316', // Vibrant orange (matching Athletic design)
  primaryButtonText: '#fff',
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved colors on mount
  useEffect(() => {
    const loadSavedColors = async () => {
      try {
        const savedColors = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedColors) {
          const parsed = JSON.parse(savedColors) as ThemeCustomization;
          setCustomColorsState(parsed);
        }
      } catch (error) {
        console.error('Error loading theme colors:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSavedColors();
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

  return (
    <ThemeContext.Provider
      value={{
        customColors,
        setCustomColors,
        presetColors,
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
