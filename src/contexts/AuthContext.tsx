import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut, type User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { type Movement, type Category, type Template } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_MOVEMENTS: { name: string; category: Category }[] = [
  { name: 'Squat', category: 'Legs' }, { name: 'Front Squat', category: 'Legs' }, { name: 'Leg Press', category: 'Legs' }, { name: 'Walking Lunge', category: 'Legs' },
  { name: 'Deadlift', category: 'Back' }, { name: 'Barbell Row', category: 'Back' }, { name: 'Pull-Up', category: 'Back' }, { name: 'Lat Pulldown', category: 'Back' },
  { name: 'Bench Press', category: 'Chest' }, { name: 'Incline Bench', category: 'Chest' }, { name: 'Push-Up', category: 'Chest' }, { name: 'Dips', category: 'Chest' },
  { name: 'Overhead Press', category: 'Shoulders' }, { name: 'Lateral Raise', category: 'Shoulders' }, { name: 'Face Pull', category: 'Shoulders' },
  { name: 'Barbell Curl', category: 'Arms' }, { name: 'Tricep Pushdown', category: 'Arms' }, { name: 'Skull Crusher', category: 'Arms' },
  { name: 'Plank', category: 'Core' }, { name: 'Russian Twist', category: 'Core' }, { name: 'Hanging Leg Raise', category: 'Core' },
  { name: 'Running', category: 'Cardio' }, { name: 'Rowing', category: 'Cardio' }, { name: 'Cycling', category: 'Cardio' }
];

const INITIAL_TEMPLATES: Template[] = [
    {
      name: 'Full Body A',
      entries: [
        { movementName: 'Squat', reps: 8, weight: 60, unit: 'kg' },
        { movementName: 'Bench Press', reps: 8, weight: 40, unit: 'kg' },
        { movementName: 'Barbell Row', reps: 8, weight: 40, unit: 'kg' }
      ],
      createdAt: Date.now(),
      order: 1
    }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Check if seeded
        const movementsRef = collection(db, `users/${u.uid}/movements`);
        const snapshot = await getDocs(movementsRef);
        if (snapshot.empty) {
          const batch = writeBatch(db);
          DEFAULT_MOVEMENTS.forEach((m) => {
             const ref = doc(movementsRef);
             batch.set(ref, { ...m, isCustom: false });
          });
          
          const templatesRef = collection(db, `users/${u.uid}/templates`);
          INITIAL_TEMPLATES.forEach((t) => {
             const ref = doc(templatesRef);
             batch.set(ref, t);
          });

          await batch.commit();
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Popup blocked or failed, falling back to redirect', error);
      await signInWithRedirect(auth, provider);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
