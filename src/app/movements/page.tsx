"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMovements } from "@/lib/firestore";
import { Movement } from "@/types";
import { Search, Plus, Dumbbell, X } from "lucide-react";
import { saveMovement } from "@/lib/firestore";

export default function MovementsPage() {
  const { user } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState("Other");

  const categories = ["All", "Legs", "Back", "Chest", "Shoulders", "Arms", "Core", "Cardio"];

  const load = async () => {
    if (user) {
      const data = await getMovements(user.uid);
      setMovements(data);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName) return;
    
    await saveMovement(user.uid, {
      name: newName,
      category: newCat as any,
      isCustom: true
    });
    
    setNewName("");
    setShowAdd(false);
    load();
  };

  const filtered = movements.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="animate-fade-in">
      <header className="mb-8 pt-4 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tight">Movements</h1>
          <p className="text-sm font-medium text-text-tertiary">Browse and manage your exercises.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="p-3 bg-accent text-white rounded-2xl shadow-btn active:scale-90 transition-all"
        >
          {showAdd ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </header>

      {showAdd && (
        <form onSubmit={handleAdd} className="card-depth p-4 mb-6 animate-modal-in space-y-4">
          <div>
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest block mb-2 px-1">
              New Movement Name
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-bg-primary border border-border-color rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-accent transition-all"
              placeholder="e.g. Muscle Up"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest block mb-2 px-1">
              Category
            </label>
            <select
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="w-full bg-bg-primary border border-border-color rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-accent transition-all appearance-none"
            >
              {categories.filter(c => c !== "All").map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-accent text-white font-bold py-3 rounded-xl shadow-btn active:scale-[0.98] transition-all"
          >
            Create Movement
          </button>
        </form>
      )}

      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search movements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-secondary border border-border-color rounded-xl py-3.5 pl-12 pr-4 text-lg focus:ring-2 focus:ring-accent outline-none transition-all shadow-card"
          />
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                ? "bg-accent text-text-on-accent shadow-btn scale-105" 
                : "bg-bg-secondary text-text-tertiary border border-border-color hover:bg-bg-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Movement List */}
        <div className="grid gap-3">
          {filtered.map(m => (
            <div key={m.id} className="card-depth p-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-text-primary">{m.name}</div>
                <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mt-0.5">
                  {m.category}
                </div>
              </div>
              <Dumbbell className="w-4 h-4 text-text-tertiary opacity-20" />
            </div>
          ))}
          
          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-tertiary text-sm italic">
              No movements found matching "{search}"
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
