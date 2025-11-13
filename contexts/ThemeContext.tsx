import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeCustomization {
  primaryButton: string;
  primaryButtonText: string;
}

interface ThemeContextType {
  customColors: ThemeCustomization;
  setCustomColors: (colors: ThemeCustomization) => void;
  presetColors: { name: string; button: string; text: string }[];
}

const defaultColors: ThemeCustomization = {
  primaryButton: '#0a7ea4',
  primaryButtonText: '#fff',
};

export const presetColors = [
  { name: 'Ocean Blue', button: '#0a7ea4', text: '#fff' },
  { name: 'Crimson Red', button: '#dc2626', text: '#fff' },
  { name: 'Forest Green', button: '#059669', text: '#fff' },
  { name: 'Royal Purple', button: '#7c3aed', text: '#fff' },
  { name: 'Sunset Orange', button: '#ea580c', text: '#fff' },
  { name: 'Pink Pop', button: '#db2777', text: '#fff' },
  { name: 'Slate Gray', button: '#475569', text: '#fff' },
  { name: 'Electric Cyan', button: '#06b6d4', text: '#fff' },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [customColors, setCustomColors] = useState<ThemeCustomization>(defaultColors);

  return (
    <ThemeContext.Provider
      value={{
        customColors,
        setCustomColors,
        presetColors,
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
