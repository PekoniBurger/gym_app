"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getWorkouts } from "@/lib/firestore";
import { Workout } from "@/types";
import { ChevronDown, Calendar, Trash2 } from "lucide-react";
import WorkoutList from "@/components/WorkoutList";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getWorkouts(user.uid).then((data) => {
        setWorkouts(data);
        setLoading(false);
      });
    }
  }, [user]);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  };

  const groupedByWeek = workouts.reduce((acc, workout) => {
    const weekStart = getWeekStart(new Date(workout.date));
    if (!acc[weekStart]) acc[weekStart] = [];
    acc[weekStart].push(workout);
    return acc;
  }, {} as Record<string, Workout[]>);

  const sortedWeeks = Object.keys(groupedByWeek).sort((a, b) => b.localeCompare(a));

  return (
    <main className="animate-fade-in">
      <header className="mb-8 pt-4">
        <h1 className="text-4xl font-black text-text-primary tracking-tight">History</h1>
        <p className="text-sm font-medium text-text-tertiary">Review your past performance.</p>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 skeleton" />)}
        </div>
      ) : workouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
          <Calendar className="w-12 h-12 mb-4 opacity-20" />
          <p>No workout history yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedWeeks.map(weekStart => (
            <div key={weekStart} className="space-y-4">
              <h2 className="text-xs font-black text-accent uppercase tracking-[0.2em] px-1">
                Week of {new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </h2>
              {groupedByWeek[weekStart].map((workout) => (
                <div key={workout.id} className="card-depth overflow-hidden">
                  <button 
                    onClick={() => toggleExpand(workout.id)}
                    className="w-full text-left p-4 flex items-center justify-between active:bg-bg-accent transition-colors"
                  >
                    <div>
                      <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">
                        {new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="font-bold text-text-primary truncate max-w-[200px]">
                        {workout.entries.map(e => e.movementName).filter((v, i, a) => a.indexOf(v) === i).join(", ")}
                      </div>
                      <div className="text-xs text-text-tertiary mt-1">
                        {workout.entries.length} sets · {workout.entries.reduce((sum, e) => sum + (e.weight * e.reps), 0).toLocaleString()} kg
                      </div>
                    </div>
                    <ChevronDown className={cn("w-5 h-5 text-text-tertiary transition-transform duration-300", expandedIds.has(workout.id) && "rotate-180")} />
                  </button>
                  
                  {expandedIds.has(workout.id) && (
                    <div className="px-4 pb-4 animate-modal-in border-t border-border-color pt-4">
                      <WorkoutList entries={workout.entries} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
