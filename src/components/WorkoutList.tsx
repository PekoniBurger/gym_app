"use client";

import { Trash2, Copy, Pencil } from "lucide-react";
import { WorkoutEntry } from "@/types";
import { cn } from "@/lib/utils";

interface WorkoutListProps {
  entries: WorkoutEntry[];
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export default function WorkoutList({ entries, onDelete, onDuplicate }: WorkoutListProps) {
  // Group entries by movement name
  const groups = entries.reduce((acc, entry) => {
    if (!acc[entry.movementName]) acc[entry.movementName] = [];
    acc[entry.movementName].push(entry);
    return acc;
  }, {} as Record<string, WorkoutEntry[]>);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-tertiary">
        <p className="text-sm font-medium">No sets logged yet.</p>
        <p className="text-xs">Start by logging your first exercise above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([name, movementEntries]) => (
        <div key={name} className="animate-fade-in">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="font-bold text-lg text-text-primary capitalize">{name}</h3>
            <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              {movementEntries.length} {movementEntries.length === 1 ? 'set' : 'sets'}
            </span>
          </div>
          
          <div className="space-y-2">
            {movementEntries.map((entry, idx) => (
              <div 
                key={entry.id}
                className="card-depth p-3 flex items-center justify-between group h-14"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-text-tertiary w-4">
                    {idx + 1}
                  </span>
                  <div className="text-lg font-medium tabular-nums">
                    {entry.weight}
                    <span className="text-text-tertiary mx-1">×</span>
                    {entry.reps}
                    <span className="text-xs text-text-tertiary ml-1 uppercase">{entry.unit}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onDuplicate?.(entry.id)}
                    className="p-2 text-text-tertiary hover:text-accent active:scale-90"
                    aria-label="Duplicate set"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete?.(entry.id)}
                    className="p-2 text-text-tertiary hover:text-danger active:scale-90"
                    aria-label="Delete set"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
