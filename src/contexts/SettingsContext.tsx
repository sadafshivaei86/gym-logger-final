import React, { createContext, useContext, useEffect, useState } from 'react';
import { type UserSettings, type Unit } from '../types';
import { getSettings, updateSettings as saveSettings } from '../lib/firestore';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: UserSettings;
  updateUnit: (unit: Unit) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: UserSettings = {
  unit: 'kg',
  theme: 'system'
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      setLoading(true);
      const data = await getSettings();
      if (data) {
        setSettings(data);
      }
      setLoading(false);
    };

    fetchSettings();
  }, [user]);

  const updateUnit = async (unit: Unit) => {
    setSettings(prev => ({ ...prev, unit }));
    if (user) {
      await saveSettings({ unit });
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateUnit, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
