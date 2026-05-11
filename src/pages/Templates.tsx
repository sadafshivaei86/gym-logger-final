import React, { useState, useEffect } from 'react';
import { getTemplates, addTemplate, deleteTemplate, addEntriesToWorkout, getWorkoutByDate, getMovements } from '../lib/firestore';
import { type Template, type WorkoutEntry, type TemplateEntry, type Movement } from '../types';
import { ClipboardList, Plus, Trash2, Play, Check, ChevronUp, ChevronDown, Save, Search, X, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

export const Templates: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutEntry[]>([]);

  const loadTemplates = async () => {
    const data = await getTemplates();
    setTemplates(data);
    setLoading(false);
  };

  const loadCurrentWorkout = async () => {
      const today = new Date().toISOString().split('T')[0];
      const workout = await getWorkoutByDate(today);
      if (workout) setCurrentWorkout(workout.entries);
  };

  useEffect(() => {
    loadTemplates();
    loadCurrentWorkout();
  }, []);

  const handleLoadTemplate = async (template: Template) => {
    setLoadingTemplateId(template.id!);
    const newEntries: WorkoutEntry[] = template.entries.map(e => ({
      ...e,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    }));
    
    await addEntriesToWorkout(new Date().toISOString().split('T')[0], newEntries);
    
    // Feedback
    setTimeout(() => {
      setLoadingTemplateId(null);
      navigate('/');
    }, 1200);
  };

  const handleDeleteTemplate = async (id: string) => {
    await deleteTemplate(id);
    loadTemplates();
  };

  const handleSaveWorkoutAsTemplate = () => {
      if (currentWorkout.length === 0) return;
      const entries: TemplateEntry[] = currentWorkout.map(e => ({
          movementName: e.movementName,
          reps: e.reps,
          weight: e.weight,
          unit: e.unit
      }));
      setEditingTemplate({
          name: `Routine ${new Date().toLocaleDateString()}`,
          entries,
          createdAt: Date.now(),
          order: templates.length + 1
      });
      setShowEditor(true);
  };

  if (showEditor) {
      return (
          <TemplateEditor 
              template={editingTemplate} 
              onSave={() => {
                  setShowEditor(false);
                  setEditingTemplate(null);
                  loadTemplates();
              }}
              onCancel={() => {
                  setShowEditor(false);
                  setEditingTemplate(null);
              }}
          />
      );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Saved Templates</h1>
        <button
          onClick={() => {
              setEditingTemplate({ name: '', entries: [], createdAt: Date.now(), order: templates.length + 1 });
              setShowEditor(true);
          }}
          className="p-2 text-accent bg-bg-secondary border border-border-color rounded-xl hover:shadow-card active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      {currentWorkout.length > 0 && (
          <button
            onClick={handleSaveWorkoutAsTemplate}
            className="w-full bg-bg-accent border border-accent/20 text-accent font-bold py-4 rounded-xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-all"
          >
            <Save size={20} />
            <span>SAVE TODAY AS TEMPLATE</span>
          </button>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-32 w-full skeleton rounded-2xl" />)}
        </div>
      ) : templates.length > 0 ? (
        <div className="space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-bg-secondary border border-border-color rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all card-depth group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">{template.name}</h3>
                  <p className="text-xs text-text-tertiary mt-1">
                    {template.entries.length} exercises · {template.entries.map(e => e.movementName).slice(0, 3).join(', ')}
                    {template.entries.length > 3 && '...'}
                  </p>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                    onClick={() => { setEditingTemplate(template); setShowEditor(true); }}
                    className="p-2 text-text-tertiary hover:text-accent rounded-lg"
                   >
                     <Plus size={18} className="rotate-45" />
                   </button>
                   <button 
                    onClick={() => handleDeleteTemplate(template.id!)}
                    className="p-2 text-text-tertiary hover:text-danger rounded-lg"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              </div>

              <button
                onClick={() => handleLoadTemplate(template)}
                disabled={loadingTemplateId !== null}
                className={cn(
                  "w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all",
                  loadingTemplateId === template.id 
                    ? "bg-success text-white" 
                    : "bg-bg-tertiary text-text-primary hover:bg-accent hover:text-white"
                )}
              >
                {loadingTemplateId === template.id ? (
                  <>
                    <Check size={20} />
                    <span>LOADED!</span>
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    <span>LOAD TEMPLATE</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
            <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList size={32} className="text-text-tertiary" />
            </div>
            <p className="text-text-secondary font-medium">No templates saved.</p>
        </div>
      )}
    </div>
  );
};

interface TemplateEditorProps {
    template: Template | null;
    onSave: () => void;
    onCancel: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave, onCancel }) => {
    const { settings } = useSettings();
    const [name, setName] = useState(template?.name || '');
    const [entries, setEntries] = useState<TemplateEntry[]>(template?.entries || []);
    const [search, setSearch] = useState('');
    const [movements, setMovements] = useState<Movement[]>([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        getMovements().then(setMovements);
    }, []);

    const filtered = movements.filter(m => m.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8);

    const handleAddEntry = (m: Movement) => {
        setEntries([...entries, {
            movementName: m.name,
            reps: 10,
            weight: 0,
            unit: settings.unit
        }]);
        setSearch('');
        setShowResults(false);
    };

    const handleSave = async () => {
        if (!name || entries.length === 0) return;
        const newTemplate: Template = {
            ...template!,
            name,
            entries,
            createdAt: template?.createdAt || Date.now(),
            order: template?.order || 0
        };
        await addTemplate(newTemplate);
        onSave();
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
             <div className="flex justify-between items-center pt-2">
                <button onClick={onCancel} className="p-2 text-text-tertiary"><X size={24} /></button>
                <h2 className="text-xl font-bold">Edit Template</h2>
                <button onClick={handleSave} className="p-2 text-accent font-bold">SAVE</button>
            </div>

            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Routine Name"
                    className="w-full bg-bg-secondary border border-border-color rounded-xl py-3.5 px-4 text-lg font-bold focus:outline-none focus:border-accent"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <div className="relative">
                    <div className="flex items-center bg-bg-tertiary rounded-xl px-4 py-3">
                        <Search size={20} className="text-text-tertiary mr-3" />
                        <input
                            type="text"
                            placeholder="Add exercise..."
                            className="bg-transparent w-full focus:outline-none"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setShowResults(true); }}
                            onFocus={() => setShowResults(true)}
                        />
                    </div>
                    {showResults && search && filtered.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-bg-secondary border border-border-color rounded-xl shadow-card-lg overflow-hidden">
                            {filtered.map(m => (
                                <button
                                    key={m.id}
                                    className="w-full text-left px-4 py-3 hover:bg-bg-tertiary flex items-center space-x-3 transition-colors"
                                    onClick={() => handleAddEntry(m)}
                                >
                                    <Dumbbell size={16} className="text-text-tertiary" />
                                    <span>{m.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {entries.map((entry, idx) => (
                    <div key={idx} className="bg-bg-secondary border border-border-color rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-bold">{entry.movementName}</span>
                            <button 
                                onClick={() => setEntries(entries.filter((_, i) => i !== idx))}
                                className="text-text-tertiary hover:text-danger"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="number"
                                placeholder="Reps"
                                className="bg-bg-tertiary rounded-lg px-3 py-2 focus:outline-none"
                                value={entry.reps}
                                onChange={(e) => {
                                    const newEntries = [...entries];
                                    newEntries[idx].reps = parseInt(e.target.value) || 0;
                                    setEntries(newEntries);
                                }}
                            />
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Weight"
                                    className="w-full bg-bg-tertiary rounded-lg px-3 py-2 focus:outline-none"
                                    value={entry.weight}
                                    onChange={(e) => {
                                        const newEntries = [...entries];
                                        newEntries[idx].weight = parseFloat(e.target.value) || 0;
                                        setEntries(newEntries);
                                    }}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-tertiary uppercase">{entry.unit}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
