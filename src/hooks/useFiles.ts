import { useCallback, useEffect, useState, useRef } from "react";
import { fetchDirectory } from "@/api/client";
import type { DirectoryResponse, FileItem } from "@/api/types";
import { useExplorerStore } from "@/store/explorerStore";

export function useFiles() {
  const { currentPath, setCurrentPath, setLoading, setError } = useExplorerStore();
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

  return {
    items: data?.items ?? [],
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
