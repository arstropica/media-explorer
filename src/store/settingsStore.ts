import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SortField = "name" | "size" | "date" | "type";
export type SortOrder = "asc" | "desc";

interface SettingsState {
  autoPlay: boolean;
  muted: boolean;
  sidebarWidth: number;
  viewMode: "list" | "thumbnail";
  keyboardNav: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
  setAutoPlay: (value: boolean) => void;
  setMuted: (value: boolean) => void;
  setSidebarWidth: (value: number) => void;
  setViewMode: (value: "list" | "thumbnail") => void;
  setKeyboardNav: (value: boolean) => void;
  setSort: (field: SortField, order: SortOrder) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoPlay: false,
      muted: true,
      sidebarWidth: 400,
      viewMode: "list",
      keyboardNav: true,
      sortField: "name",
      sortOrder: "asc",
      setAutoPlay: (autoPlay) => set({ autoPlay }),
      setMuted: (muted) => set({ muted }),
      setSidebarWidth: (sidebarWidth) =>
        set({ sidebarWidth: Math.min(800, Math.max(200, sidebarWidth)) }),
      setViewMode: (viewMode) => set({ viewMode }),
      setKeyboardNav: (keyboardNav) => set({ keyboardNav }),
      setSort: (sortField, sortOrder) => set({ sortField, sortOrder }),
    }),
    {
      name: "media-explorer-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
