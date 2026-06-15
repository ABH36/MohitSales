'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PublicSettingsContextType {
  settings: Record<string, string>;
  loading: boolean;
  getSetting: (key: string, defaultValue?: string) => string;
}

const PublicSettingsContext = createContext<PublicSettingsContextType>({
  settings: {},
  loading: true,
  getSetting: (key, defaultValue = '') => defaultValue,
});

export function usePublicSettings() {
  return useContext(PublicSettingsContext);
}

export default function PublicSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/public/settings');
        const data = await res.json();
        if (data.success && data.data) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error('Failed to load public settings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const getSetting = (key: string, defaultValue = '') => {
    return settings[key] || defaultValue;
  };

  return (
    <PublicSettingsContext.Provider value={{ settings, loading, getSetting }}>
      {children}
    </PublicSettingsContext.Provider>
  );
}
