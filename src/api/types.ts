import type { MediaType } from "@/lib/mediaTypes";

export interface FileItem {
  name: string;
  path: string;
  type: MediaType;
  size: number;
  mtime: string;
}

export interface DirectoryResponse {
  path: string;
  parent: string | null;
  items: FileItem[];
}
