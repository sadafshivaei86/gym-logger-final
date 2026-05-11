import React, { useState, useEffect } from 'react';
import { getWorkouts, deleteWorkoutEntry, deleteWorkoutMovement } from '../lib/firestore';
import { type Workout, type WorkoutEntry } from '../types';
import { WorkoutList } from '../components/WorkoutList';
import { format, startOfWeek, endOfWeek, isSameWeek, isSameDay, isYesterday, parseISO } from 'date-fns';
import { ChevronDown, ChevronUp, Calendar, Trash2, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const History: React.FC = () => {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const loadWorkouts = async () => {
        const data = await getWorkouts();
        setWorkouts(data);
        setLoading(false);
    };

    useEffect(() => {
        loadWorkouts();
    }, []);

    const getDateLabel = (dateStr: string) => {
        const date = parseISO(dateStr);
        if (isSameDay(date, new Date())) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        if (isSameWeek(date, new Date())) return format(date, 'eeee');
        return format(date, 'MMM do');
    };

    // Group workouts by week
    const weeks = workouts.reduce((acc: Record<string, Workout[]>, workout) => {
        const date = parseISO(workout.date);
        const start = startOfWeek(date);
        const weekKey = format(start, 'yyyy-MM-dd');
        if (!acc[weekKey]) acc[weekKey] = [];
        acc[weekKey].push(workout);
        return acc;
    }, {} as Record<string, Workout[]>);

    return (
        <div className="space-y-8 animate-fade-in pb-8">
            <h1 className="text-2xl font-bold tracking-tight">Workout History</h1>

            {loading ? (
                <div className="space-y-6">
                    {[1, 2].map(i => (
                        <div key={i} className="space-y-3">
                            <div className="h-4 w-40 skeleton rounded" />
                            <div className="h-24 w-full skeleton rounded-2xl" />
                        </div>
                    ))}
                </div>
            ) : Object.keys(weeks).length > 0 ? (
                (Object.entries(weeks) as [string, Workout[]][]).sort((a, b) => b[0].localeCompare(a[0])).map(([weekKey, weekWorkouts]) => (
                    <div key={weekKey} className="space-y-4">
                        <div className="px-1 flex items-center space-x-2">
                             <Calendar size={14} className="text-accent" />
                             <h2 className="text-xs font-bold uppercase tracking-widest text-accent">
                                Week of {format(parseISO(weekKey), 'MMM d')}
                             </h2>
                        </div>
                        
                        <div className="space-y-3">
                            {weekWorkouts.map((workout) => (
                                <WorkoutCard
                                    key={workout.id}
                                    workout={workout}
                                    isExpanded={expandedId === workout.id}
                                    onToggle={() => setExpandedId(expandedId === workout.id ? null : workout.id!)}
                                    onUpdate={loadWorkouts}
                                    dateLabel={getDateLabel(workout.date)}
                                />
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar size={32} className="text-text-tertiary" />
                    </div>
                    <p className="text-text-secondary font-medium">No history yet.</p>
                </div>
            )}
        </div>
    );
};

interface WorkoutCardProps {
    workout: Workout;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: () => void;
    dateLabel: string;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, isExpanded, onToggle, onUpdate, dateLabel }) => {
    const totalSets = workout.entries.length;
    const movements = Array.from(new Set(workout.entries.map(e => e.movementName)));
    
    return (
        <div className={cn(
            "bg-bg-secondary rounded-2xl border transition-all duration-300 card-depth",
            isExpanded ? "border-accent/30 shadow-card-lg" : "border-border-color shadow-card hover:shadow-card-hover"
        )}>
            <div 
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={onToggle}
            >
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-1">
                        {dateLabel} · {format(parseISO(workout.date), 'MMM d, yyyy')}
                    </span>
                    <h3 className="text-sm font-bold text-text-primary line-clamp-1">
                        {movements.join(', ')}
                    </h3>
                </div>
                
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5 bg-bg-tertiary px-2 py-1 rounded-lg">
                        <Hash size={12} className="text-text-tertiary" />
                        <span className="text-xs font-bold">{totalSets}</span>
                    </div>
                    {isExpanded ? <ChevronUp size={20} className="text-text-tertiary" /> : <ChevronDown size={20} className="text-text-tertiary" />}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0 border-t border-border-color mt-2 space-y-4">
                            <WorkoutList
                                workoutId={workout.id!}
                                entries={workout.entries}
                                date={workout.date}
                                onUpdate={onUpdate}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
