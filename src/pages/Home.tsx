import React, { useState, useEffect, useCallback } from 'react';
import { WorkoutForm } from '../components/WorkoutForm';
import { WorkoutList } from '../components/WorkoutList';
import { getWorkoutByDate, deleteWorkoutMovement, addEntriesToWorkout, finishWorkout } from '../lib/firestore';
import { type Workout, type WorkoutEntry } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Undo2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const Home: React.FC = () => {
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [loading, setLoading] = useState(true);
    const [undoItem, setUndoItem] = useState<{ movementName: string; entries: WorkoutEntry[]; timer: NodeJS.Timeout } | null>(null);
    const [finishConfirm, setFinishConfirm] = useState(false);
    const [finishTimer, setFinishTimer] = useState<NodeJS.Timeout | null>(null);

    const loadWorkout = useCallback(async () => {
        const date = new Date().toISOString().split('T')[0];
        const data = await getWorkoutByDate(date);
        setWorkout(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadWorkout();
    }, [loadWorkout]);

    const handleDeleteMovement = async (movementName: string) => {
        if (!workout?.id) return;
        
        const removedEntries = await deleteWorkoutMovement(workout.id, movementName);
        
        // Setup Undo
        if (undoItem) clearTimeout(undoItem.timer);
        
        const timer = setTimeout(() => {
            setUndoItem(null);
        }, 5000);
        
        setUndoItem({ movementName, entries: removedEntries, timer });
        loadWorkout();
    };

    const handleUndo = async () => {
        if (!undoItem) return;
        clearTimeout(undoItem.timer);
        await addEntriesToWorkout(new Date().toISOString().split('T')[0], undoItem.entries);
        setUndoItem(null);
        loadWorkout();
    };

    const handleFinish = async () => {
        if (!finishConfirm) {
            setFinishConfirm(true);
            const timer = setTimeout(() => setFinishConfirm(false), 3000);
            setFinishTimer(timer);
            return;
        }

        if (workout?.id) {
            await finishWorkout(workout.id);
            if (finishTimer) clearTimeout(finishTimer);
            setFinishConfirm(false);
            setWorkout(prev => prev ? { ...prev, completed: true } : null);
        }
    };

    const totalVolume = workout?.entries.reduce((sum, e) => sum + (e.reps * e.weight), 0) || 0;
    const totalSets = workout?.entries.length || 0;

    return (
        <div className="space-y-8 animate-fade-in">
            <section className="space-y-4">
                <h1 className="text-2xl font-bold tracking-tight">Today's Session</h1>
                <WorkoutForm onEntryAdded={loadWorkout} lastEntry={workout?.entries[workout.entries.length - 1]} />
            </section>

            {loading ? (
                <div className="space-y-4">
                    <div className="h-6 w-32 skeleton rounded" />
                    <div className="space-y-2">
                        <div className="h-16 w-full skeleton rounded-xl" />
                        <div className="h-16 w-full skeleton rounded-xl" />
                    </div>
                </div>
            ) : workout && workout.entries.length > 0 ? (
                <section className="space-y-4">
                    <div className="flex justify-between items-baseline">
                        <h2 className="text-lg font-bold">Logged Sets</h2>
                        <span className="text-sm font-medium text-text-tertiary">
                            {totalSets} sets · {totalVolume.toLocaleString()} {workout.entries[0].unit}
                        </span>
                    </div>

                    <WorkoutList
                        workoutId={workout.id!}
                        date={workout.date}
                        entries={workout.entries}
                        onUpdate={loadWorkout}
                        onDeleteMovement={handleDeleteMovement}
                    />

                    {!workout.completed && (
                        <button
                            onClick={handleFinish}
                            className={cn(
                                "w-full py-4 rounded-xl font-bold transition-all duration-300",
                                finishConfirm 
                                    ? "bg-warning text-text-primary animate-pulse-ring" 
                                    : "bg-bg-tertiary text-text-primary hover:bg-border-color"
                            )}
                        >
                            {finishConfirm ? "TAP AGAIN TO CONFIRM" : "FINISH WORKOUT"}
                        </button>
                    )}
                    
                    {workout.completed && (
                        <div className="flex items-center justify-center space-x-2 py-4 text-success font-bold bg-success/10 rounded-xl">
                            <Check size={20} />
                            <span>WORKOUT COMPLETED</span>
                        </div>
                    )}
                </section>
            ) : (
                <div className="py-12 text-center space-y-2">
                   <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                       <Dumbbell size={32} className="text-text-tertiary" />
                   </div>
                   <p className="text-text-secondary font-medium">No sets logged yet.</p>
                   <p className="text-text-tertiary text-sm">Start by searching an exercise above.</p>
                </div>
            )}

            <AnimatePresence>
                {undoItem && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-20 left-4 right-4 z-50 flex items-center justify-between bg-text-primary text-bg-primary px-4 py-3 rounded-xl shadow-card-lg"
                    >
                        <span className="text-sm font-medium">Deleted {undoItem.movementName}</span>
                        <button
                            onClick={handleUndo}
                            className="flex items-center space-x-1 text-accent font-bold text-sm px-2 py-1"
                        >
                            <Undo2 size={16} />
                            <span>UNDO</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Dumbbell = ({ size, className }: { size: number; className?: string }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="m6.5 6.5 11 11" />
        <path d="m21 21-1-1" />
        <path d="m3 3 1 1" />
        <path d="m18 22 4-4" />
        <path d="m2 6 4-4" />
        <path d="m3 10 7-7" />
        <path d="m14 21 7-7" />
    </svg>
);
