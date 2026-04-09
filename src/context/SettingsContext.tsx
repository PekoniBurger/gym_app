"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getSettings, saveSettings } from "@/lib/firestore";
import { UserSettings } from "@/types";

interface SettingsContextType {
  settings: UserSettings;
  updateUnit: (unit: 'kg' | 'lbs') => Promise<void>;
  loading: boolean;
}

const defaultSettings: UserSettings = {
  unit: 'kg',
  theme: 'system'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setSettings(defaultSettings);
        setLoading(false);
        return;
      }
      
      const saved = await getSettings(user.uid);
      if (saved) {
        setSettings(saved);
      }
      setLoading(false);
    };

    loadSettings();
  }, [user]);

  const updateUnit = async (unit: 'kg' | 'lbs') => {
    if (!user) return;
    const newSettings = { ...settings, unit };
    setSettings(newSettings);
    await saveSettings(user.uid, newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateUnit, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
