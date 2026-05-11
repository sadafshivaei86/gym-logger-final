import React, { useState } from 'react';
import { Trash2, Copy, Pencil, Check, X } from 'lucide-react';
import { type WorkoutEntry } from '../types';
import { deleteWorkoutEntry, updateWorkoutEntry, addEntriesToWorkout, deleteWorkoutMovement } from '../lib/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface WorkoutListProps {
  workoutId: string;
  entries: WorkoutEntry[];
  date: string;
  onUpdate: () => void;
  onDeleteMovement?: (movementName: string) => void;
}

export const WorkoutList: React.FC<WorkoutListProps> = ({ workoutId, entries, date, onUpdate, onDeleteMovement }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editReps, setEditReps] = useState('');
  const [editWeight, setEditWeight] = useState('');

  // Group by movement
  const groups = entries.reduce((acc: Record<string, WorkoutEntry[]>, entry) => {
    if (!acc[entry.movementName]) acc[entry.movementName] = [];
    acc[entry.movementName].push(entry);
    return acc;
  }, {} as Record<string, WorkoutEntry[]>);

  const handleDuplicate = async (entry: WorkoutEntry) => {
    const newEntry: WorkoutEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    await addEntriesToWorkout(date, [newEntry]);
    onUpdate();
  };

  const handleStartEdit = (entry: WorkoutEntry) => {
    setEditingId(entry.id);
    setEditReps(entry.reps.toString());
    setEditWeight(entry.weight.toString());
  };

  const handleSaveEdit = async (entry: WorkoutEntry) => {
    const updated: WorkoutEntry = {
      ...entry,
      reps: parseInt(editReps),
      weight: parseFloat(editWeight)
    };
    await updateWorkoutEntry(workoutId, updated);
    setEditingId(null);
    onUpdate();
  };

  const handleDeleteEntry = async (entryId: string) => {
    await deleteWorkoutEntry(workoutId, entryId);
    onUpdate();
  };

  const handleDeleteGroupName = async (movementName: string) => {
    if (onDeleteMovement) {
      onDeleteMovement(movementName);
    } else {
      await deleteWorkoutMovement(workoutId, movementName);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence initial={false}>
        {(Object.entries(groups) as [string, WorkoutEntry[]][]).map(([name, groupEntries]) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-center px-1">
              <div className="flex items-baseline space-x-2">
                <h3 className="text-base font-bold text-text-primary">{name}</h3>
                <span className="text-xs text-text-tertiary">{groupEntries.length} sets</span>
              </div>
              <button
                onClick={() => handleDeleteGroupName(name)}
                className="p-1.5 text-text-tertiary hover:text-danger active:scale-90 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-1">
              {groupEntries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="bg-bg-secondary border border-border-color rounded-xl p-3 flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-bold text-text-tertiary w-4">{idx + 1}</span>
                    {editingId === entry.id ? (
                      <div className="flex items-center space-x-2 animate-fade-in">
                        <input
                          type="number"
                          className="w-16 bg-bg-tertiary border border-border-color rounded-md px-2 py-1 text-sm focus:outline-none"
                          value={editReps}
                          onChange={(e) => setEditReps(e.target.value)}
                          autoFocus
                        />
                        <span className="text-text-tertiary">×</span>
                        <input
                          type="number"
                          step="0.5"
                          className="w-16 bg-bg-tertiary border border-border-color rounded-md px-2 py-1 text-sm focus:outline-none"
                          value={editWeight}
                          onChange={(e) => setEditWeight(e.target.value)}
                        />
                        <span className="text-xs text-text-tertiary">{entry.unit}</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline space-x-1">
                        <span className="text-lg font-medium">{entry.reps}</span>
                        <span className="text-text-tertiary text-sm">×</span>
                        <span className="text-lg font-medium">{entry.weight}</span>
                        <span className="text-text-tertiary text-xs">{entry.unit}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    {editingId === entry.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(entry)}
                          className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-text-tertiary hover:bg-bg-tertiary rounded-lg transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDuplicate(entry)}
                          className="p-2 text-text-tertiary hover:text-accent hover:bg-bg-tertiary rounded-lg transition-colors overflow-hidden"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => handleStartEdit(entry)}
                          className="p-2 text-text-tertiary hover:text-accent hover:bg-bg-tertiary rounded-lg transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-2 text-text-tertiary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
