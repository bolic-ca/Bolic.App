/**
 * Template Loader
 * Functions to load program templates into user storage
 */

import { programStorage } from './program-storage';
import { programTemplates } from '@/data/program-templates';
import type { Program } from '@/types/training';
import { generateId, getCurrentTimestamp } from '@/utils/storage-helpers';

/**
 * Load a template program into storage for a user
 * @param userId - User ID
 * @param templateIndex - Index of template to load (0 = simple, 1 = periodized)
 * @returns The created program
 */
export async function loadTemplate(userId: string, templateIndex: number): Promise<Program> {
  const template = programTemplates[templateIndex];

  if (!template) {
    throw new Error(`Template ${templateIndex} not found`);
  }

  // Create program with user ID and generated IDs
  const program: Program = {
    ...template,
    id: generateId(),
    userId,
    isActive: false,
    createdDate: getCurrentTimestamp(),
    lastModified: getCurrentTimestamp(),
  };

  // Update all nested user IDs
  if (program.trainingDays) {
    program.trainingDays = program.trainingDays.map(day => ({
      ...day,
      id: generateId(),
      userId,
      exercises: day.exercises?.map(ex => ({
        ...ex,
        id: generateId(),
        userId,
      })),
    }));
  }

  if (program.mesocycles) {
    program.mesocycles = program.mesocycles.map(meso => ({
      ...meso,
      id: generateId(),
      userId,
      microcycles: meso.microcycles.map(micro => ({
        ...micro,
        id: generateId(),
        userId,
        trainingDays: micro.trainingDays.map(day => ({
          ...day,
          id: generateId(),
          userId,
          exercises: day.exercises?.map(ex => ({
            ...ex,
            id: generateId(),
            userId,
          })),
        })),
      })),
    }));
  }

  // Save to storage
  await programStorage.save(userId, program, program.id);

  return program;
}

/**
 * Load all templates for a user
 * @param userId - User ID
 * @returns Array of created programs
 */
export async function loadAllTemplates(userId: string): Promise<Program[]> {
  const programs: Program[] = [];

  for (let i = 0; i < programTemplates.length; i++) {
    const program = await loadTemplate(userId, i);
    programs.push(program);
  }

  return programs;
}

/**
 * Get template info without loading
 * @returns Array of template metadata
 */
export function getTemplateInfo() {
  return programTemplates.map((template, index) => ({
    index,
    name: template.name,
    description: template.description,
    type: template.type,
    tags: template.tags,
  }));
}
