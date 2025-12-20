/**
 * Weight Conversion Utilities
 *
 * All weights are stored in kg (canonical unit).
 * This module provides conversion utilities for display and input.
 */

export type WeightUnit = 'kg' | 'lbs';

// Canonical storage unit
export const STORAGE_UNIT: WeightUnit = 'kg';

// Conversion factor: 1 kg = 2.20462 lbs
const KG_TO_LBS = 2.20462;
const LBS_TO_KG = 1 / KG_TO_LBS;

/**
 * Convert weight between units
 */
export function convertWeight(value: number, fromUnit: WeightUnit, toUnit: WeightUnit): number {
  if (fromUnit === toUnit) return value;

  if (fromUnit === 'kg' && toUnit === 'lbs') {
    return value * KG_TO_LBS;
  }

  if (fromUnit === 'lbs' && toUnit === 'kg') {
    return value * LBS_TO_KG;
  }

  return value;
}

/**
 * Convert weight from storage unit (kg) to display unit
 * Returns the converted value (number)
 */
export function displayWeight(valueInKg: number | undefined | null, displayUnit: WeightUnit): number {
  if (valueInKg === undefined || valueInKg === null) return 0;

  const converted = convertWeight(valueInKg, STORAGE_UNIT, displayUnit);
  // Round to 1 decimal place for clean display
  return Math.round(converted * 10) / 10;
}

/**
 * Format weight for display with unit label
 * Returns string like "100 lbs" or "45.5 kg"
 */
export function formatWeight(valueInKg: number | undefined | null, displayUnit: WeightUnit): string {
  const converted = displayWeight(valueInKg, displayUnit);
  return `${converted} ${displayUnit}`;
}

/**
 * Convert user input weight to storage unit (kg)
 * Call this when saving weight entered by user
 */
export function toStorageUnit(value: number, inputUnit: WeightUnit): number {
  return convertWeight(value, inputUnit, STORAGE_UNIT);
}

/**
 * Parse weight input string and convert to storage unit
 * Returns the value in kg, or null if invalid
 */
export function parseWeightInput(input: string, inputUnit: WeightUnit): number | null {
  const parsed = parseFloat(input);
  if (isNaN(parsed) || parsed < 0) return null;
  return toStorageUnit(parsed, inputUnit);
}
