/**
 * WorkoutUIContext
 * Manages UI state for workout interface (expanded/minimized)
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WorkoutUIContextType {
  isExpanded: boolean;
  expand: () => void;
  minimize: () => void;
}

const WorkoutUIContext = createContext<WorkoutUIContextType | undefined>(undefined);

export function WorkoutUIProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const expand = () => setIsExpanded(true);
  const minimize = () => setIsExpanded(false);

  return (
    <WorkoutUIContext.Provider value={{ isExpanded, expand, minimize }}>
      {children}
    </WorkoutUIContext.Provider>
  );
}

export function useWorkoutUI() {
  const context = useContext(WorkoutUIContext);
  if (context === undefined) {
    throw new Error('useWorkoutUI must be used within a WorkoutUIProvider');
  }
  return context;
}
