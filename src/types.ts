/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'Legs' | 'Back' | 'Chest' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio' | 'Other';
export type Unit = 'kg' | 'lbs';
export type Theme = 'system' | 'light' | 'dark';

export interface Movement {
  id?: string;
  name: string;
  category: Category;
  isCustom?: boolean;
}

export interface WorkoutEntry {
  id: string;
  movementName: string;
  reps: number;
  weight: number;
  unit: Unit;
  notes?: string;
  createdAt: number;
}

export interface Workout {
  id?: string;
  date: string; // YYYY-MM-DD
  entries: WorkoutEntry[];
  createdAt: number;
  completed: boolean;
}

export interface TemplateEntry {
  movementName: string;
  reps: number;
  weight: number;
  unit: Unit;
}

export interface Template {
  id?: string;
  name: string;
  entries: TemplateEntry[];
  createdAt: number;
  order: number;
}

export interface UserSettings {
  unit: Unit;
  theme: Theme;
}
