import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SettingsState {
  autoPlay: boolean;
  muted: boolean;
  sidebarWidth: number;
  viewMode: "list" | "thumbnail";
  keyboardNav: boolean;
  setAutoPlay: (value: boolean) => void;
  setMuted: (value: boolean) => void;
  setSidebarWidth: (value: number) => void;
  setViewMode: (value: "list" | "thumbnail") => void;
  setKeyboardNav: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoPlay: false,
      muted: true,
      sidebarWidth: 400,
      viewMode: "list",
      keyboardNav: true,
      setAutoPlay: (autoPlay) => set({ autoPlay }),
      setMuted: (muted) => set({ muted }),
      setSidebarWidth: (sidebarWidth) =>
        set({ sidebarWidth: Math.min(800, Math.max(200, sidebarWidth)) }),
      setViewMode: (viewMode) => set({ viewMode }),
      setKeyboardNav: (keyboardNav) => set({ keyboardNav }),
    }),
    {
      name: "media-explorer-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
