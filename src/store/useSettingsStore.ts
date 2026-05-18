import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from './types.ts';

interface UseSettingsStore {
  consoleExpanded: boolean;
  settingsExpanded: boolean;
  toggleConsole: () => void;
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<UseSettingsStore>()(
  persist((set) => ({
    consoleExpanded: true,
    settingsExpanded: true,
    settings: {
      saveDir: '',
      apiBase: 'http://localhost:5556',
      cookie: '',
      proxy: '',
    },
    toggleConsole: () => set((state) => ({ consoleExpanded: !state.consoleExpanded })),

    updateSettings: (s) => {
      set((state) => {
        const newSettings = { ...state.settings, ...s };
        return { settings: newSettings };
      });
    },

  }), {
    name: 'position-storage-settings',
  })
);
