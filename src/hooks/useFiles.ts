import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { fetchDirectory } from "@/api/client";
import type { DirectoryResponse, FileItem } from "@/api/types";
import { useExplorerStore } from "@/store/explorerStore";
import { useSettingsStore, SortField, SortOrder } from "@/store/settingsStore";

function filterItems(items: FileItem[], filterText: string): FileItem[] {
  if (!filterText) return items;

  let matcher: (name: string) => boolean;

  try {
    const regex = new RegExp(filterText, "i");
    matcher = (name) => regex.test(name);
  } catch {
    // Invalid regex, fall back to simple includes
    const lowerFilter = filterText.toLowerCase();
    matcher = (name) => name.toLowerCase().includes(lowerFilter);
  }

  return items.filter((item) => matcher(item.name));
}

function sortItems(items: FileItem[], field: SortField, order: SortOrder): FileItem[] {
  // Directories always come first
  const dirs = items.filter((i) => i.type === "directory");
  const files = items.filter((i) => i.type !== "directory");

  const compare = (a: FileItem, b: FileItem): number => {
    let result = 0;
    switch (field) {
      case "name":
        result = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        break;
      case "size":
        result = (a.size ?? 0) - (b.size ?? 0);
        break;
      case "date":
        result = new Date(a.mtime).getTime() - new Date(b.mtime).getTime();
        break;
      case "type":
        result = a.type.localeCompare(b.type);
        if (result === 0) {
          result = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        }
        break;
    }
    return order === "asc" ? result : -result;
  };

  return [...dirs.sort(compare), ...files.sort(compare)];
}

export function useFiles() {
  const { currentPath, setCurrentPath, setLoading, setError, filterText } = useExplorerStore();
  const { sortField, sortOrder } = useSettingsStore();
  const [data, setData] = useState<DirectoryResponse | null>(null);
  const isInitialLoad = useRef(true);

  const loadDirectory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchDirectory(currentPath);
      setData(response);

      // If server returned a different path (e.g., redirected to MEDIA_ROOT),
      // update our state to match (but only on initial load to avoid loops)
      if (isInitialLoad.current && response.path !== currentPath) {
        setCurrentPath(response.path);
      }
      isInitialLoad.current = false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load directory");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [currentPath, setCurrentPath, setLoading, setError]);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  const filteredAndSortedItems = useMemo(() => {
    const filtered = filterItems(data?.items ?? [], filterText);
    return sortItems(filtered, sortField, sortOrder);
  }, [data?.items, filterText, sortField, sortOrder]);

  return {
    items: filteredAndSortedItems,
    parentPath: data?.parent ?? null,
    path: data?.path ?? currentPath,
    reload: loadDirectory,
  };
}

export function useFileSelection() {
  const { selectedFile, selectFile } = useExplorerStore();

  const handleSelect = useCallback(
    (file: FileItem) => {
      if (file.type === "other") return;
      selectFile(file);
    },
    [selectFile]
  );

  const clearSelection = useCallback(() => {
    selectFile(null);
  }, [selectFile]);

  return { selectedFile, handleSelect, clearSelection };
}
