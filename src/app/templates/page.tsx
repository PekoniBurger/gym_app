"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getTemplates, addEntriesToWorkout, getWorkouts, addTemplate } from "@/lib/firestore";
import { Template, Workout } from "@/types";
import { ClipboardList, Play, ChevronRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      Promise.all([
        getTemplates(user.uid),
        getWorkouts(user.uid)
      ]).then(([tData, wData]) => {
        setTemplates(tData);
        setWorkouts(wData);
        setLoading(false);
      });
    }
  }, [user]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayWorkout = workouts.find(w => w.date === todayStr);
  const hasTodayWorkout = todayWorkout && todayWorkout.entries.length > 0;

  const handleLoadTemplate = async (template: Template) => {
    if (!user) return;
    
    // In a real app, we'd add entries to today's workout
    const today = new Date().toISOString().split('T')[0];
    
    // Create entries from template entries
    const newEntries = template.entries.map(te => ({
      id: crypto.randomUUID(),
      movementName: te.movementName,
      reps: te.reps,
      weight: te.weight,
      unit: te.unit,
      createdAt: Date.now()
    }));

    await addEntriesToWorkout(user.uid, today, newEntries as any);
    router.push("/");
  };

  const handleSaveAsTemplate = async () => {
    if (!user || !todayWorkout) return;
    setSaving(true);
    
    await addTemplate(user.uid, {
      name: `Template from ${todayWorkout.date}`,
      order: templates.length,
      entries: todayWorkout.entries.map((e: any) => ({
        movementName: e.movementName,
        reps: e.reps,
        weight: e.weight,
        unit: e.unit
      })),
      createdAt: Date.now()
    });
    
    // Refresh templates
    const data = await getTemplates(user.uid);
    setTemplates(data);
    setSaving(false);
  };

  return (
    <main className="animate-fade-in">
      <header className="mb-8 pt-4">
        <h1 className="text-4xl font-black text-text-primary tracking-tight">Templates</h1>
        <p className="text-sm font-medium text-text-tertiary">Quick-start your workout.</p>
      </header>

      <div className="space-y-4">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-32 skeleton" />)
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
            <ClipboardList className="w-12 h-12 mb-4 opacity-20" />
            <p>No templates yet.</p>
            <button className="mt-4 text-accent font-bold text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Create First Template
            </button>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="card-depth p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-text-primary">{template.name}</h3>
                  <p className="text-xs text-text-tertiary">
                    {template.entries.length} movements
                  </p>
                </div>
                <button 
                  onClick={() => handleLoadTemplate(template)}
                  className="bg-accent text-text-on-accent p-3 rounded-full shadow-btn hover:bg-accent-hover active:scale-90 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                </button>
              </div>
              
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {template.entries.map((e, idx) => (
                  <div key={idx} className="bg-bg-primary px-3 py-1.5 rounded-lg text-[10px] font-bold text-text-tertiary whitespace-nowrap">
                    {e.movementName}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {hasTodayWorkout && (
          <button 
            onClick={handleSaveAsTemplate}
            disabled={saving}
            className="w-full bg-accent text-white font-bold py-4 rounded-xl shadow-btn active:scale-95 transition-all flex items-center justify-center gap-2 mb-4"
          >
            <Plus className="w-5 h-5" />
            {saving ? "Saving..." : "Save Today's Workout as Template"}
          </button>
        )}

        <button className="w-full border-2 border-dashed border-border-color rounded-2xl p-6 text-text-tertiary hover:text-accent hover:border-accent group transition-all flex flex-col items-center gap-2">
          <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-sm uppercase tracking-widest">New Custom Template</span>
        </button>
      </div>
    </main>
  );
}
