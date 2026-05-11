import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { LogOut, Sun, Moon, Monitor, RotateCcw, Download, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { type Theme, type Unit } from '../types';

export const Settings: React.FC = () => {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { settings, updateUnit } = useSettings();

    const handleExportCSV = () => {
        // Feature to be implemented: fetch all workouts and export
        console.log('Export CSV requested');
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

            {/* Profile Section */}
            <section className="space-y-4">
                <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest">Profile</h2>
                <div className="bg-bg-secondary border border-border-color rounded-2xl p-4 flex items-center justify-between shadow-card card-depth">
                    <div className="flex items-center space-x-3">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                        ) : (
                            <div className="w-10 h-10 bg-accent/20 text-accent flex items-center justify-center rounded-full font-bold">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-sm font-bold font-sans">{user?.displayName || 'User'}</span>
                            <span className="text-xs text-text-tertiary line-clamp-1">{user?.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 text-danger hover:bg-danger/10 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </section>

            {/* Appearance */}
            <section className="space-y-4">
                <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest">Appearance</h2>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'system', icon: Monitor, label: 'Auto' },
                        { id: 'light', icon: Sun, label: 'Light' },
                        { id: 'dark', icon: Moon, label: 'Dark' }
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setTheme(opt.id as Theme)}
                            className={cn(
                                "flex flex-col items-center justify-center space-y-2 p-4 rounded-2xl border transition-all card-depth",
                                theme === opt.id 
                                    ? "bg-bg-accent border-accent/20 text-accent shadow-card" 
                                    : "bg-bg-secondary border-border-color text-text-secondary"
                            )}
                        >
                            <opt.icon size={20} />
                            <span className="text-xs font-bold">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Units */}
            <section className="space-y-4">
                <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest">Weight Units</h2>
                <div className="grid grid-cols-2 gap-2">
                    {(['kg', 'lbs'] as Unit[]).map((u) => (
                        <button
                            key={u}
                            onClick={() => updateUnit(u)}
                            className={cn(
                                "py-3 rounded-2xl border font-bold transition-all card-depth focus:outline-none",
                                settings.unit === u 
                                    ? "bg-bg-accent border-accent/20 text-accent shadow-card" 
                                    : "bg-bg-secondary border-border-color text-text-secondary"
                            )}
                        >
                            {u.toUpperCase()}
                        </button>
                    ))}
                </div>
            </section>

            {/* Data */}
            <section className="space-y-4">
                <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest">Data</h2>
                <button
                    onClick={handleExportCSV}
                    className="w-full bg-bg-secondary border border-border-color rounded-2xl p-4 flex items-center justify-between shadow-card hover:shadow-card-hover transition-all group"
                >
                    <div className="flex items-center space-x-3">
                        <Download size={20} className="text-text-tertiary group-hover:text-accent transition-colors" />
                        <span className="font-bold">Export All Data as CSV</span>
                    </div>
                </button>
            </section>

            <footer className="pt-8 text-center space-y-1">
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Gym Logger · V1.0</p>
                <p className="text-[10px] font-medium text-text-tertiary/60">Built with React & Firebase</p>
            </footer>
        </div>
    );
};
