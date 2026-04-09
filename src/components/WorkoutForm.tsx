"use client";

import { useState, useEffect, useRef } from "react";
import { Dumbbell, Plus, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { Movement, WorkoutEntry } from "@/types";
import { getMovements, addEntriesToWorkout } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";

export default function WorkoutForm() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [search, setSearch] = useState("");
  const [reps, setReps] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      getMovements(user.uid).then(setMovements);
    }
  }, [user]);

  const filteredMovements = movements
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 8);

  const handleLog = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || !search || !reps || !weight) return;

    const entry: WorkoutEntry = {
      id: crypto.randomUUID(),
      movementName: search,
      reps: parseInt(reps),
      weight: parseFloat(weight),
      unit: settings.unit,
      createdAt: Date.now(),
    };

    // Today's ID (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    await addEntriesToWorkout(user.uid, today, [entry]);

    // Cleanup
    setReps("");
    setWeight("");
    // Keep search to help with consecutive sets
  };

  return (
    <div className="card-depth p-4 mb-6 animate-fade-in">
      <form onSubmit={handleLog} className="space-y-4">
        <div className="relative">
          <label className="text-xs font-bold text-text-tertiary uppercase mb-1.5 block">
            Movement
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Squat, Bench Press..."
              className="w-full bg-bg-primary border-none rounded-xl py-3.5 px-4 text-lg focus:ring-2 focus:ring-accent outline-none transition-all"
            />
            {showDropdown && search && (
              <div 
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 z-10 bg-bg-secondary border border-border-color rounded-xl mt-2 shadow-card-lg overflow-hidden animate-modal-in"
              >
                {filteredMovements.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSearch(m.name);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-bg-accent text-text-primary active:bg-accent-active/20"
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-text-tertiary uppercase mb-1.5 block">
              Weight ({settings.unit})
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0"
              className="w-full bg-bg-primary border-none rounded-xl py-3.5 px-4 text-lg focus:ring-2 focus:ring-accent outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-text-tertiary uppercase mb-1.5 block">
              Reps
            </label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="0"
              className="w-full bg-bg-primary border-none rounded-xl py-3.5 px-4 text-lg focus:ring-2 focus:ring-accent outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!search || !reps || !weight}
          className="w-full bg-accent text-text-on-accent font-bold py-4 rounded-xl shadow-btn hover:bg-accent-hover active:scale-95 active:bg-accent-active transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
        >
          <Plus className="w-5 h-5" />
          Log Set
        </button>
      </form>
    </div>
  );
}
