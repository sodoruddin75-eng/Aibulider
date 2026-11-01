import React, { createContext, useContext, useEffect, useState } from 'react';
import { Plan, SiteSettings } from '../types/index.js';

interface SettingsContextType {
  settings: Partial<SiteSettings>;
  plans: Plan[];
  isAiConfigured: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: Partial<SiteSettings> = {
  site_name: 'BuildAI Pro',
  site_tagline: 'Turn Your Ideas Into Powerful Digital Products With AI.',
  site_description: 'Build premium websites, full-stack web apps, Android applications, and landing pages with just one prompt.',
  facebook_page_url: 'https://facebook.com/buildaipro',
  facebook_messenger_url: 'https://m.me/buildaipro',
  facebook_button_text: 'Contact for Payment',
  facebook_button_enabled: '1',
  commission_starter: '100',
  commission_growth: '200',
  commission_enterprise: '350',
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Partial<SiteSettings>>(defaultSettings);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isAiConfigured, setIsAiConfigured] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('buildai_theme') as 'light' | 'dark') || 'light';
  });

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings/public');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (data.plans) setPlans(data.plans);
        setIsAiConfigured(Boolean(data.isAiConfigured));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('buildai_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        plans,
        isAiConfigured,
        theme,
        toggleTheme,
        refreshSettings,
        isLoading
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
