"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSettings } from "@/context/SettingsContext";
import { LogOut, Sun, Moon, Laptop, Weight, ArrowRight, Download } from "lucide-react";
import { getWorkouts } from "@/lib/firestore";
import { useState } from "react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { settings, updateUnit } = useSettings();
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const workouts = await getWorkouts(user.uid);
      const csvRows = [
        ["Date", "Movement", "Weight", "Unit", "Reps", "Notes"].join(",")
      ];

      workouts.forEach(workout => {
        workout.entries.forEach(entry => {
          const row = [
            workout.date,
            `"${entry.movementName.replace(/"/g, '""')}"`,
            entry.weight,
            entry.unit,
            entry.reps,
            `"${(entry.notes || "").replace(/"/g, '""')}"`
          ];
          csvRows.push(row.join(","));
        });
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute("href", url);
      link.setAttribute("download", `gym-log-${dateStr}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export data.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="animate-fade-in px-4 pb-24 max-w-lg mx-auto">
      <header className="mb-8 pt-4">
        <h1 className="text-4xl font-black text-text-primary tracking-tight">Settings</h1>
        <p className="text-sm font-medium text-text-tertiary">Personalize your experience.</p>
      </header>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="card-depth p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-text-on-accent font-black text-xl">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-text-primary truncate max-w-[180px]">
                {user?.email}
              </div>
              <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                Active Member
              </div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-3 text-danger hover:bg-danger/10 rounded-xl active:scale-90 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Appearance */}
        <div>
          <label className="text-xs font-bold text-text-tertiary uppercase mb-3 block px-1">
            Appearance
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light', icon: Sun, label: 'Light' },
              { id: 'dark', icon: Moon, label: 'Dark' },
              { id: 'system', icon: Laptop, label: 'System' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTheme(item.id as any)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  theme === item.id 
                  ? "bg-bg-accent border-accent text-accent shadow-card" 
                  : "bg-bg-secondary border-transparent text-text-tertiary hover:border-border-color"
                }`}
              >
                <item.icon className="w-6 h-6 mb-2" />
                <span className="text-[10px] font-bold uppercase">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Units */}
        <div>
          <label className="text-xs font-bold text-text-tertiary uppercase mb-3 block px-1">
            Weight Unit
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['kg', 'lbs'].map((item) => (
              <button
                key={item}
                onClick={() => updateUnit(item as any)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  settings.unit === item 
                  ? "bg-bg-accent border-accent text-accent shadow-card" 
                  : "bg-bg-secondary border-transparent text-text-tertiary hover:border-border-color"
                }`}
              >
                <span className="font-bold uppercase">{item}</span>
                {settings.unit === item && <div className="w-2 h-2 bg-accent rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="space-y-2">
          <button 
            onClick={handleExportCSV}
            disabled={exporting}
            className="w-full card-depth p-4 flex items-center justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <Download className={`w-5 h-5 ${exporting ? "animate-pulse" : "text-accent"}`} />
              <span className="font-bold text-text-primary">
                {exporting ? "Exporting..." : "Export All Data (CSV)"}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-text-tertiary group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="text-center py-8">
          <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
            Gym Logger v1.0.0
          </p>
          <p className="text-[8px] text-text-tertiary mt-1">
            Built with Passion for Progress
          </p>
        </div>
      </div>
    </main>
  );
}
