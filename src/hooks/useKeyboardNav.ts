import { useEffect, useCallback } from "react";
import type { FileItem } from "@/api/types";
import { useSettingsStore } from "@/store/settingsStore";
import { useExplorerStore } from "@/store/explorerStore";
import { isMediaFile } from "@/lib/mediaTypes";

export function useKeyboardNav(items: FileItem[]) {
  const { keyboardNav } = useSettingsStore();
  const { selectedFile, selectFile, setCurrentPath } = useExplorerStore();

  // Get navigable items (directories and media files)
  const navigableItems = items.filter(
    (item) => item.type === "directory" || isMediaFile(item.type)
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!keyboardNav || navigableItems.length === 0) return;

      // Don't intercept if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const currentIndex = selectedFile
        ? navigableItems.findIndex((item) => item.path === selectedFile.path)
        : -1;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex =
          currentIndex < navigableItems.length - 1 ? currentIndex + 1 : 0;
        selectFile(navigableItems[nextIndex]);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : navigableItems.length - 1;
        selectFile(navigableItems[prevIndex]);
      } else if (e.key === "Enter" && selectedFile) {
        e.preventDefault();
        if (selectedFile.type === "directory") {
          setCurrentPath(selectedFile.path);
        }
      }
    },
    [keyboardNav, navigableItems, selectedFile, selectFile, setCurrentPath]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { navigableItems };
}
