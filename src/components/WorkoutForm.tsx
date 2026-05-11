import React, { useState, useEffect, useRef } from 'react';
import { Dumbbell, Plus, Repeat } from 'lucide-react';
import { getMovements, addEntriesToWorkout } from '../lib/firestore';
import { type Movement, type WorkoutEntry, type Unit } from '../types';
import { cn } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';

interface WorkoutFormProps {
  onEntryAdded: () => void;
  lastEntry?: WorkoutEntry;
}

export const WorkoutForm: React.FC<WorkoutFormProps> = ({ onEntryAdded, lastEntry }) => {
  const { settings } = useSettings();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [movementName, setMovementName] = useState('');
  const [reps, setReps] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMovements().then(setMovements);
  }, []);

  const filteredMovements = movements
    .filter(m => m.name.toLowerCase().includes(movementName.toLowerCase()))
    .slice(0, 8);

  const handleLogSet = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!movementName || !reps || !weight) return;

    setIsLoading(true);
    const entry: WorkoutEntry = {
      id: crypto.randomUUID(),
      movementName,
      reps: parseInt(reps),
      weight: parseFloat(weight),
      unit: settings.unit,
      createdAt: Date.now()
    };

    await addEntriesToWorkout(new Date().toISOString().split('T')[0], [entry]);
    
    // Success feedback (optimistic UI is handled by parent re-fetching)
    setReps(entry.reps.toString());
    setWeight(entry.weight.toString());
    onEntryAdded();
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleRepeatLast = () => {
    if (!lastEntry) return;
    setMovementName(lastEntry.movementName);
    setReps(lastEntry.reps.toString());
    setWeight(lastEntry.weight.toString());
    // Auto log? The prompt says "shortcut", let's just prefill.
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleLogSet} className="space-y-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search exercises..."
            className="w-full bg-bg-secondary border border-border-color rounded-xl py-3.5 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            value={movementName}
            onChange={(e) => {
              setMovementName(e.target.value);
              setShowAutocomplete(true);
            }}
            onFocus={() => setShowAutocomplete(true)}
          />
          {showAutocomplete && movementName && filteredMovements.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-bg-secondary border border-border-color rounded-xl shadow-card-lg overflow-hidden animate-fade-in">
              {filteredMovements.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-bg-tertiary active:bg-accent-active transition-colors flex items-center space-x-3"
                  onClick={() => {
                    setMovementName(m.name);
                    setShowAutocomplete(false);
                  }}
                >
                  <Dumbbell size={16} className="text-text-tertiary" />
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input
              type="number"
              placeholder="Reps"
              className="w-full bg-bg-secondary border border-border-color rounded-xl py-3.5 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary text-sm font-medium">REPS</span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.5"
              placeholder="Weight"
              className="w-full bg-bg-secondary border border-border-color rounded-xl py-3.5 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary text-sm font-medium">{settings.unit.toUpperCase()}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !movementName || !reps || !weight}
          className="w-full bg-accent hover:bg-accent-hover active:bg-accent-active text-text-on-accent font-bold py-4 rounded-xl shadow-btn active:shadow-btn-pressed transform active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:active:scale-100"
        >
          <Plus size={20} />
          <span>LOG SET</span>
        </button>
      </form>

      {lastEntry && (
        <button
          onClick={handleRepeatLast}
          className="w-full bg-bg-secondary border border-border-color text-text-secondary font-medium py-3 rounded-xl hover:bg-bg-tertiary active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
        >
          <Repeat size={16} />
          <span>Repeat Last: {lastEntry.movementName} ({lastEntry.reps} × {lastEntry.weight}{lastEntry.unit})</span>
        </button>
      )}
    </div>
  );
};
