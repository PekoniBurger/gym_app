import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  updateDoc,
  serverTimestamp,
  type DocumentData
} from "firebase/firestore";
import { db } from "./firebase";
import { Workout, WorkoutEntry, Movement, Template, UserSettings } from "@/types";

// --- Collection Helpers ---

const getUserRef = (userId: string) => doc(db, "users", userId);
const getWorkoutsRef = (userId: string) => collection(db, "users", userId, "workouts");
const getMovementsRef = (userId: string) => collection(db, "users", userId, "movements");
const getTemplatesRef = (userId: string) => collection(db, "users", userId, "templates");
const getSettingsRef = (userId: string) => doc(db, "users", userId, "settings", "current");

// --- Workout Helpers ---

export const getWorkouts = async (userId: string): Promise<Workout[]> => {
  const q = query(getWorkoutsRef(userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  // Filter out workouts with 0 entries per requirements
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Workout))
    .filter(w => w.entries && w.entries.length > 0);
};

export const saveWorkout = async (userId: string, workout: Workout) => {
  const docRef = doc(getWorkoutsRef(userId), workout.id);
  await setDoc(docRef, {
    ...workout,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const deleteWorkout = async (userId: string, workoutId: string) => {
  await deleteDoc(doc(getWorkoutsRef(userId), workoutId));
};

// --- Entry Helpers ---

/**
 * addEntriesToWorkout takes an array — used by template loading to write all entries 
 * in a single Firestore operation (per requirements).
 */
export const addEntriesToWorkout = async (userId: string, workoutId: string, newEntries: WorkoutEntry[]) => {
  const docRef = doc(getWorkoutsRef(userId), workoutId);
  const docSnap = await getDoc(docRef);
  
  let existingEntries: WorkoutEntry[] = [];
  if (docSnap.exists()) {
    existingEntries = (docSnap.data() as Workout).entries || [];
  }
  
  const updatedEntries = [...existingEntries, ...newEntries];
  
  await setDoc(docRef, {
    id: workoutId,
    date: new Date().toISOString().split('T')[0],
    entries: updatedEntries,
    createdAt: docSnap.exists() ? (docSnap.data() as Workout).createdAt : Date.now(),
    completed: false,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

// --- Movement Helpers ---

export const getMovements = async (userId: string): Promise<Movement[]> => {
  const snapshot = await getDocs(getMovementsRef(userId));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movement));
};

export const seedMovements = async (userId: string, movements: Omit<Movement, 'id'>[]) => {
  const ref = getMovementsRef(userId);
  const snapshots = await getDocs(ref);
  
  // Only seed if empty
  if (snapshots.empty) {
    for (const m of movements) {
      const newDoc = doc(ref);
      await setDoc(newDoc, m);
    }
  }
};

export const saveMovement = async (userId: string, movement: Omit<Movement, 'id'>) => {
  const ref = getMovementsRef(userId);
  const newDoc = doc(ref);
  await setDoc(newDoc, movement);
};

// --- Template Helpers ---

export const getTemplates = async (userId: string): Promise<Template[]> => {
  const q = query(getTemplatesRef(userId), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
};

export const addTemplate = async (userId: string, template: Omit<Template, 'id'>) => {
  const ref = getTemplatesRef(userId);
  const newDoc = doc(ref);
  await setDoc(newDoc, { ...template, createdAt: Date.now() });
};

// --- Settings Helpers ---

export const getSettings = async (userId: string): Promise<UserSettings | null> => {
  const snap = await getDoc(getSettingsRef(userId));
  return snap.exists() ? (snap.data() as UserSettings) : null;
};

export const saveSettings = async (userId: string, settings: UserSettings) => {
  await setDoc(getSettingsRef(userId), settings);
};

export const seedTemplates = async (userId: string, templates: Omit<Template, 'id'>[]) => {
  const ref = getTemplatesRef(userId);
  const snapshots = await getDocs(ref);
  
  if (snapshots.empty) {
    for (const t of templates) {
      const newDoc = doc(ref);
      await setDoc(newDoc, { ...t, createdAt: Date.now() });
    }
  }
};
