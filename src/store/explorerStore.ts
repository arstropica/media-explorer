import { create } from "zustand";
import type { FileItem } from "@/api/types";

interface ExplorerState {
  currentPath: string;
  selectedFile: FileItem | null;
  isLoading: boolean;
  error: string | null;
  filterText: string;
  setCurrentPath: (path: string) => void;
  selectFile: (file: FileItem | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilterText: (filter: string) => void;
}

function getInitialPath(): string {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    // Return empty string if no path param - server will default to MEDIA_ROOT
    return params.get("path") || "";
  }
  return "";
}

export const useExplorerStore = create<ExplorerState>((set) => ({
  currentPath: getInitialPath(),
  selectedFile: null,
  isLoading: false,
  error: null,
  filterText: "",
  setCurrentPath: (currentPath) => {
    set({ currentPath, selectedFile: null, filterText: "" });
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("path", currentPath);
      window.history.replaceState({}, "", url.toString());
    }
  },
  selectFile: (selectedFile) => set({ selectedFile }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilterText: (filterText) => set({ filterText }),
}));
