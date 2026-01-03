import type { DirectoryResponse } from "./types";

const API_BASE = "/api";

export async function fetchDirectory(path: string): Promise<DirectoryResponse> {
  const response = await fetch(
    `${API_BASE}/files?path=${encodeURIComponent(path)}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `Failed to fetch directory: ${response.status}`);
  }

  return response.json();
}

export function getMediaUrl(path: string): string {
  return `${API_BASE}/media?path=${encodeURIComponent(path)}`;
}
