import React, { useState, useEffect } from 'react';
import { getMovements, addMovement } from '../lib/firestore';
import { type Movement, type Category } from '../types';
import { Dumbbell, Search, Plus, X, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES: Category[] = ['Legs', 'Back', 'Chest', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Other'];

export const Movements: React.FC = () => {
    const [movements, setMovements] = useState<Movement[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState<Category>('Other');

    const loadMovements = async () => {
        const data = await getMovements();
        setMovements(data);
        setLoading(false);
    };

    useEffect(() => {
        loadMovements();
    }, []);

    const filtered = movements.filter(m => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = selectedCategory === 'All' || m.category === selectedCategory;
        return matchSearch && matchCategory;
    });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;
        await addMovement({ name: newName, category: newCategory, isCustom: true });
        setNewName('');
        setShowAddForm(false);
        loadMovements();
    };

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Movements</h1>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="p-2 text-accent bg-bg-secondary border border-border-color rounded-xl hover:shadow-card active:scale-95 transition-all"
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="space-y-4 sticky top-[env(safe-area-inset-top)] z-10 bg-bg-primary/80 backdrop-blur-md pt-2 pb-4">
                <div className="bg-bg-secondary border border-border-color rounded-xl flex items-center px-4 py-3">
                    <Search size={20} className="text-text-tertiary mr-3" />
                    <input
                        type="text"
                        placeholder="Search exercise library..."
                        className="bg-transparent w-full focus:outline-none text-lg"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide space-x-2 no-scrollbar">
                    <button
                        onClick={() => setSelectedCategory('All')}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                            selectedCategory === 'All' ? "bg-accent text-white" : "bg-bg-tertiary text-text-secondary"
                        )}
                    >
                        All
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                                selectedCategory === cat ? "bg-accent text-white" : "bg-bg-tertiary text-text-secondary"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 w-full skeleton rounded-xl" />)}
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                    {filtered.map(m => (
                        <div key={m.id} className="bg-bg-secondary border border-border-color rounded-xl p-4 flex items-center space-x-4">
                            <div className="bg-bg-tertiary p-2 rounded-lg">
                                <Dumbbell size={20} className="text-text-tertiary" />
                            </div>
                            <div>
                                <h3 className="font-bold">{m.name}</h3>
                                <p className="text-xs text-text-tertiary uppercase tracking-wider">{m.category}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center text-text-tertiary">
                    <p>No exercises found.</p>
                </div>
            )}

            {showAddForm && (
                <div className="fixed inset-0 z-50 bg-bg-primary flex items-center justify-center p-4 animate-modal-in">
                    <div className="w-full max-w-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Add Movement</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-text-tertiary"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-tertiary uppercase tracking-widest">Exercise Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-bg-secondary border border-border-color rounded-xl py-3.5 px-4 text-lg focus:outline-none focus:border-accent"
                                    placeholder="e.g. Incline Bench Press"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-tertiary uppercase tracking-widest">Category</label>
                                <select
                                    className="w-full bg-bg-secondary border border-border-color rounded-xl py-3.5 px-4 text-lg focus:outline-none focus:border-accent appearance-none capitalize"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value as Category)}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-accent text-white font-bold py-4 rounded-xl shadow-btn active:scale-95 transition-all"
                            >
                                CREATE MOVEMENT
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
