"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect, 
  GoogleAuthProvider, 
  signOut, 
  type User 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { seedMovements, seedTemplates } from "@/lib/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // On first login, seed default data if needed
        // (Moved some logic here for seeding ~60 movements)
        await handleInitialSeed(user.uid);
      }
      
      setLoading(loading => false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, provider);
      } else {
        console.error("Login error", error);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const handleInitialSeed = async (userId: string) => {
    // Full list of ~60 exercises categorized
    const defaultMovements = [
      // Legs
      { name: 'Squat', category: 'Legs', isCustom: false },
      { name: 'Front Squat', category: 'Legs', isCustom: false },
      { name: 'Hack Squat', category: 'Legs', isCustom: false },
      { name: 'Leg Press', category: 'Legs', isCustom: false },
      { name: 'Romanian Deadlift', category: 'Legs', isCustom: false },
      { name: 'Walking Lunge', category: 'Legs', isCustom: false },
      { name: 'Bulgarian Split Squat', category: 'Legs', isCustom: false },
      { name: 'Leg Extension', category: 'Legs', isCustom: false },
      { name: 'Leg Curl', category: 'Legs', isCustom: false },
      { name: 'Hip Thrust', category: 'Legs', isCustom: false },
      { name: 'Calf Raise', category: 'Legs', isCustom: false },
      { name: 'Goblet Squat', category: 'Legs', isCustom: false },
      // Back
      { name: 'Deadlift', category: 'Back', isCustom: false },
      { name: 'Barbell Row', category: 'Back', isCustom: false },
      { name: 'Dumbbell Row', category: 'Back', isCustom: false },
      { name: 'Seated Cable Row', category: 'Back', isCustom: false },
      { name: 'T-Bar Row', category: 'Back', isCustom: false },
      { name: 'Pull-Up', category: 'Back', isCustom: false },
      { name: 'Chin-Up', category: 'Back', isCustom: false },
      { name: 'Lat Pulldown', category: 'Back', isCustom: false },
      { name: 'Face Pull', category: 'Back', isCustom: false },
      { name: 'Shrug', category: 'Back', isCustom: false },
      // Chest
      { name: 'Bench Press', category: 'Chest', isCustom: false },
      { name: 'Incline Bench Press', category: 'Chest', isCustom: false },
      { name: 'Dumbbell Bench Press', category: 'Chest', isCustom: false },
      { name: 'Incline Dumbbell Press', category: 'Chest', isCustom: false },
      { name: 'Cable Fly', category: 'Chest', isCustom: false },
      { name: 'Dumbbell Fly', category: 'Chest', isCustom: false },
      { name: 'Chest Dip', category: 'Chest', isCustom: false },
      { name: 'Push-Up', category: 'Chest', isCustom: false },
      { name: 'Machine Chest Press', category: 'Chest', isCustom: false },
      // Shoulders
      { name: 'Overhead Press', category: 'Shoulders', isCustom: false },
      { name: 'Dumbbell Shoulder Press', category: 'Shoulders', isCustom: false },
      { name: 'Arnold Press', category: 'Shoulders', isCustom: false },
      { name: 'Lateral Raise', category: 'Shoulders', isCustom: false },
      { name: 'Front Raise', category: 'Shoulders', isCustom: false },
      { name: 'Reverse Fly', category: 'Shoulders', isCustom: false },
      { name: 'Upright Row', category: 'Shoulders', isCustom: false },
      // Arms
      { name: 'Barbell Curl', category: 'Arms', isCustom: false },
      { name: 'Dumbbell Curl', category: 'Arms', isCustom: false },
      { name: 'Hammer Curl', category: 'Arms', isCustom: false },
      { name: 'Preacher Curl', category: 'Arms', isCustom: false },
      { name: 'Cable Curl', category: 'Arms', isCustom: false },
      { name: 'Tricep Pushdown', category: 'Arms', isCustom: false },
      { name: 'Overhead Tricep Extension', category: 'Arms', isCustom: false },
      { name: 'Skull Crusher', category: 'Arms', isCustom: false },
      { name: 'Close-Grip Bench Press', category: 'Arms', isCustom: false },
      { name: 'Tricep Dip', category: 'Arms', isCustom: false },
      // Core
      { name: 'Plank', category: 'Core', isCustom: false },
      { name: 'Hanging Leg Raise', category: 'Core', isCustom: false },
      { name: 'Cable Crunch', category: 'Core', isCustom: false },
      { name: 'Ab Wheel Rollout', category: 'Core', isCustom: false },
      { name: 'Dead Bug', category: 'Core', isCustom: false },
      { name: 'Russian Twist', category: 'Core', isCustom: false },
      { name: 'Decline Sit-Up', category: 'Core', isCustom: false },
      // Cardio
      { name: 'Running', category: 'Cardio', isCustom: false },
      { name: 'Rowing Machine', category: 'Cardio', isCustom: false },
      { name: 'Stationary Bike', category: 'Cardio', isCustom: false },
      { name: 'Jump Rope', category: 'Cardio', isCustom: false },
      { name: 'Stair Climber', category: 'Cardio', isCustom: false },
    ];
    await seedMovements(userId, defaultMovements as any[]);

    const defaultTemplates: any[] = [
      {
        name: "Majestic Full Body A",
        order: 0,
        entries: [
          { movementName: "Squat", reps: 8, weight: 80, unit: "kg" },
          { movementName: "Bench Press", reps: 8, weight: 60, unit: "kg" },
          { movementName: "Barbell Row", reps: 10, weight: 50, unit: "kg" },
          { movementName: "Overhead Press", reps: 10, weight: 30, unit: "kg" }
        ]
      },
      {
        name: "Majestic Full Body B",
        order: 1,
        entries: [
          { movementName: "Deadlift", reps: 5, weight: 100, unit: "kg" },
          { movementName: "Incline Bench Press", reps: 10, weight: 50, unit: "kg" },
          { movementName: "Lat Pulldown", reps: 12, weight: 60, unit: "kg" },
          { movementName: "Bulgarian Split Squat", reps: 10, weight: 20, unit: "kg" }
        ]
      },
      {
        name: "Majestic Core & Cardio",
        order: 2,
        entries: [
          { movementName: "Plank", reps: 1, weight: 0, unit: "kg" },
          { movementName: "Hanging Leg Raise", reps: 15, weight: 0, unit: "kg" },
          { movementName: "Running", reps: 1, weight: 0, unit: "kg" }
        ]
      }
    ];
    await seedTemplates(userId, defaultTemplates);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
