"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getWorkouts, saveWorkout } from "@/lib/firestore";
import { Workout, WorkoutEntry } from "@/types";
import WorkoutForm from "@/components/WorkoutForm";
import WorkoutList from "@/components/WorkoutList";
import { Plus, Check } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) return;
    
    // In a real app, we'd use a listener, but for now we'll just poll or periodic refresh
    const load = async () => {
      const workouts = await getWorkouts(user.uid);
      const found = workouts.find(w => w.date === todayStr) || null;
      setTodayWorkout(found);
      setLoading(false);
    };

    load();
  }, [user, todayStr]);

  const [confirmFinish, setConfirmFinish] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<{ entry: WorkoutEntry, index: number } | null>(null);

  const handleFinish = async () => {
    if (!user || !todayWorkout) return;
    
    if (!confirmFinish) {
      setConfirmFinish(true);
      setTimeout(() => setConfirmFinish(false), 3000);
      return;
    }

    const updated = { ...todayWorkout, completed: true };
    await saveWorkout(user.uid, updated);
    setConfirmFinish(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const totalVolume = todayWorkout?.entries.reduce((sum, e) => sum + (e.weight * e.reps), 0) || 0;
  const setCount = todayWorkout?.entries.length || 0;

  return (
    <main className="animate-fade-in">
      <header className="mb-8 pt-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-4xl font-black text-text-primary tracking-tight">Today</h1>
          <span className="text-text-tertiary font-bold uppercase text-[10px] tracking-widest">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
        {setCount > 0 && (
          <div className="mt-2 text-sm font-medium text-text-tertiary">
            <span className="text-accent">{setCount} sets</span> · {totalVolume.toLocaleString()} <span className="text-[10px] uppercase">kg</span> total
          </div>
        )}
      </header>

      <WorkoutForm />
      
      {loading ? (
        <div className="space-y-4">
          <div className="h-24 skeleton" />
          <div className="h-24 skeleton" />
        </div>
      ) : (
        <>
          <WorkoutList 
            entries={todayWorkout?.entries || []} 
            onDelete={async (id) => {
              if (!todayWorkout || !user) return;
              const index = todayWorkout.entries.findIndex(e => e.id === id);
              if (index === -1) return;

              const entry = todayWorkout.entries[index];
              const updatedEntries = todayWorkout.entries.filter(e => e.id !== id);
              
              // Optimistic update
              const updatedWorkout = { ...todayWorkout, entries: updatedEntries };
              setTodayWorkout(updatedWorkout);
              setLastDeleted({ entry, index });

              // Sync to Firestore
              await saveWorkout(user.uid, updatedWorkout);

              // Auto-clear undo after 5 seconds
              setTimeout(() => setLastDeleted(prev => prev?.entry.id === id ? null : prev), 5000);
            }}
            onDuplicate={async (id) => {
              if (!todayWorkout || !user) return;
              const entry = todayWorkout.entries.find(e => e.id === id);
              if (!entry) return;

              const newEntry: WorkoutEntry = {
                ...entry,
                id: crypto.randomUUID(),
                createdAt: Date.now()
              };

              const updatedWorkout = { 
                ...todayWorkout, 
                entries: [...todayWorkout.entries, newEntry] 
              };
              
              setTodayWorkout(updatedWorkout);
              await saveWorkout(user.uid, updatedWorkout);
            }}
          />

          {lastDeleted && (
            <div className="fixed bottom-24 left-4 right-4 z-50">
              <div className="bg-bg-secondary border border-border-color p-4 rounded-2xl shadow-card-lg flex items-center justify-between animate-modal-in">
                <div className="text-sm font-medium text-text-primary">
                  Deleted <span className="font-bold">{lastDeleted.entry.movementName}</span> set
                </div>
                <button 
                  onClick={async () => {
                    if (!todayWorkout || !user || !lastDeleted) return;
                    const newEntries = [...todayWorkout.entries];
                    newEntries.splice(lastDeleted.index, 0, lastDeleted.entry);
                    
                    const restoredWorkout = { ...todayWorkout, entries: newEntries };
                    setTodayWorkout(restoredWorkout);
                    setLastDeleted(null);
                    
                    await saveWorkout(user.uid, restoredWorkout);
                  }}
                  className="text-accent font-black uppercase text-xs tracking-widest px-4 py-2 hover:bg-bg-accent rounded-lg transition-colors"
                >
                  Undo
                </button>
              </div>
            </div>
          )}
          
          {setCount > 0 && (
            <div className="space-y-4 mt-12 pb-12">
              <button
                onClick={handleFinish}
                className={`w-full py-4 rounded-xl font-bold shadow-card transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  confirmFinish 
                    ? "bg-danger text-white border-none animate-pulse" 
                    : "bg-bg-secondary border border-border-color text-text-primary hover:bg-bg-accent"
                }`}
              >
                {confirmFinish ? (
                  "Tap again to confirm"
                ) : (
                  <>
                    <Check className="w-5 h-5 text-success" />
                    Finish Workout
                  </>
                )}
              </button>

              {showSuccess && (
                <div className="bg-success/10 border border-success/20 p-4 rounded-xl animate-modal-in flex items-center gap-3">
                  <div className="bg-success text-white p-2 rounded-full">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-success text-sm">Workout Logged!</div>
                    <div className="text-xs text-text-tertiary">{setCount} sets · {totalVolume.toLocaleString()} kg total</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
