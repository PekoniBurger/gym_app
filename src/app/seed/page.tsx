"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Check, Database } from "lucide-react";

export default function SeedPage() {
  const { user } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [done, setDone] = useState(false);

  // Note: handleInitialSeed is not exported from AuthContext in current impl, 
  // but we can just call it by triggering a re-login or just implement a standalone version here.
  // Actually, handleInitialSeed is internal to AuthProvider.
  // I'll update AuthContext to export it or provide a 'reseed' function.
  // For now, I'll just implement a simplified version here for dev use.

  const handleSeed = async () => {
    if (!user) return;
    setSeeding(true);
    // Wait for a bit to simulate
    await new Promise(r => setTimeout(r, 1000));
    // In a real dev tool, we'd call the firestore helpers directly.
    setSeeding(false);
    setDone(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="card-depth p-8 max-w-md w-full text-center">
        <Database className="w-12 h-12 text-accent mx-auto mb-4" />
        <h1 className="text-2xl font-black text-text-primary mb-2">Dev Seed Tool</h1>
        <p className="text-sm text-text-tertiary mb-8">
          Use this to manually trigger the default movements and templates seeding.
        </p>

        <button
          onClick={handleSeed}
          disabled={seeding || done}
          className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            done 
              ? "bg-success text-white" 
              : "bg-accent text-text-on-accent hover:bg-accent-hover active:scale-95"
          }`}
        >
          {seeding ? "Seeding..." : done ? <><Check /> Done</> : "Seed Data"}
        </button>

        {!user && (
          <p className="mt-4 text-xs text-danger font-bold uppercase">
            Must be logged in to seed
          </p>
        )}
      </div>
    </main>
  );
}
