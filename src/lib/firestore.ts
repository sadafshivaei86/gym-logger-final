import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  type DocumentData
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { type Workout, type WorkoutEntry, type Movement, type Template, type UserSettings } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Movements
export async function getMovements(): Promise<Movement[]> {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];
  const path = `users/${userId}/movements`;
  try {
    const q = query(collection(db, path), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movement));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function addMovement(movement: Movement): Promise<string> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Unauthenticated');
  const path = `users/${userId}/movements`;
  try {
    const newDocRef = doc(collection(db, path));
    await setDoc(newDocRef, movement);
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
}

// Workouts
export async function getWorkoutByDate(date: string): Promise<Workout | null> {
  const userId = auth.currentUser?.uid;
  if (!userId) return null;
  const path = `users/${userId}/workouts`;
  try {
    const q = query(collection(db, path), where('date', '==', date), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Workout;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function addEntriesToWorkout(date: string, newEntries: WorkoutEntry[]): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Unauthenticated');
  const path = `users/${userId}/workouts`;
  try {
    let workout = await getWorkoutByDate(date);
    if (!workout) {
      const workoutId = doc(collection(db, path)).id;
      const newWorkout: Workout = {
        date,
        entries: newEntries,
        createdAt: Date.now(),
        completed: false
      };
      await setDoc(doc(db, path, workoutId), newWorkout);
    } else {
      const updatedEntries = [...workout.entries, ...newEntries];
      await updateDoc(doc(db, path, workout.id!), { entries: updatedEntries });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteWorkoutEntry(workoutId: string, entryId: string): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Unauthenticated');
  const path = `users/${userId}/workouts/${workoutId}`;
  try {
    const docRef = doc(db, `users/${userId}/workouts`, workoutId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return;
    const workout = snapshot.data() as Workout;
    const updatedEntries = workout.entries.filter(e => e.id !== entryId);
    if (updatedEntries.length === 0) {
      await deleteDoc(docRef);
    } else {
      await updateDoc(docRef, { entries: updatedEntries });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteWorkoutMovement(workoutId: string, movementName: string): Promise<WorkoutEntry[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Unauthenticated');
    const path = `users/${userId}/workouts/${workoutId}`;
    try {
      const docRef = doc(db, `users/${userId}/workouts`, workoutId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return [];
      const workout = snapshot.data() as Workout;
      const removedEntries = workout.entries.filter(e => e.movementName === movementName);
      const updatedEntries = workout.entries.filter(e => e.movementName !== movementName);
      if (updatedEntries.length === 0) {
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, { entries: updatedEntries });
      }
      return removedEntries;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return [];
    }
}

export async function updateWorkoutEntry(workoutId: string, updatedEntry: WorkoutEntry): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Unauthenticated');
  const path = `users/${userId}/workouts/${workoutId}`;
  try {
    const docRef = doc(db, `users/${userId}/workouts`, workoutId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return;
    const workout = snapshot.data() as Workout;
    const updatedEntries = workout.entries.map(e => e.id === updatedEntry.id ? updatedEntry : e);
    await updateDoc(docRef, { entries: updatedEntries });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function finishWorkout(workoutId: string): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Unauthenticated');
    const path = `users/${userId}/workouts/${workoutId}`;
    try {
      await updateDoc(doc(db, `users/${userId}/workouts`, workoutId), { completed: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
}

export async function getWorkouts(): Promise<Workout[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    const path = `users/${userId}/workouts`;
    try {
      const q = query(collection(db, path), orderBy('date', 'desc'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Workout))
        .filter(w => w.entries.length > 0);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
}

// Templates
export async function getTemplates(): Promise<Template[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    const path = `users/${userId}/templates`;
    try {
      const q = query(collection(db, path), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
}

export async function addTemplate(template: Template): Promise<string> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Unauthenticated');
    const path = `users/${userId}/templates`;
    try {
      const newDocRef = doc(collection(db, path));
      await setDoc(newDocRef, template);
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return '';
    }
}

export async function deleteTemplate(templateId: string): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Unauthenticated');
    const path = `users/${userId}/templates/${templateId}`;
    try {
      await deleteDoc(doc(db, `users/${userId}/templates`, templateId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
}

// Settings
export async function getSettings(): Promise<UserSettings | null> {
    const userId = auth.currentUser?.uid;
    if (!userId) return null;
    const path = `users/${userId}/settings/current`;
    try {
      const snapshot = await getDoc(doc(db, path));
      if (!snapshot.exists()) return null;
      return snapshot.data() as UserSettings;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
}

export async function updateSettings(settings: Partial<UserSettings>): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Unauthenticated');
    const path = `users/${userId}/settings/current`;
    try {
      await setDoc(doc(db, path), settings, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
}
