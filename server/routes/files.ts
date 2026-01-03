import { Router } from "express";
import type { Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = Router();

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "tiff", "tif"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov", "avi", "mkv", "m4v", "wmv", "flv", "3gp"];
const AUDIO_EXTENSIONS = ["mp3", "wav", "ogg", "flac", "aac", "m4a", "wma", "aiff", "opus"];

type MediaType = "image" | "video" | "audio" | "directory" | "other";

function getMediaType(filename: string, isDirectory: boolean): MediaType {
  if (isDirectory) return "directory";

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";

  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (VIDEO_EXTENSIONS.includes(ext)) return "video";
  if (AUDIO_EXTENSIONS.includes(ext)) return "audio";
  return "other";
}

function isPathWithinRoot(requestedPath: string, rootPath: string): boolean {
  const resolved = path.resolve(requestedPath);
  const root = path.resolve(rootPath);
  return resolved.startsWith(root);
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const mediaRoot: string = req.app.locals.mediaRoot;
    const requestedPath = (req.query.path as string) || mediaRoot;

    // Resolve the path
    let resolvedPath = path.resolve(requestedPath);

    // Security: if path is outside MEDIA_ROOT, default to MEDIA_ROOT
    if (!isPathWithinRoot(resolvedPath, mediaRoot)) {
      resolvedPath = path.resolve(mediaRoot);
    }

    // Check if path exists
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({
        error: "Directory not found",
      });
    }

    // Check if it's a directory
    const stats = fs.statSync(resolvedPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({
        error: "Path is not a directory",
      });
    }

    // Read directory contents
    const entries = fs.readdirSync(resolvedPath, { withFileTypes: true });

    // Build items list
    const items = entries
      .filter((entry) => !entry.name.startsWith(".")) // Skip hidden files
      .map((entry) => {
        const itemPath = path.join(resolvedPath, entry.name);
        const isDir = entry.isDirectory();

        let size = 0;
        let mtime = new Date().toISOString();

        try {
          const itemStats = fs.statSync(itemPath);
          size = isDir ? 0 : itemStats.size;
          mtime = itemStats.mtime.toISOString();
        } catch {
          // Ignore stat errors for individual files
        }

        return {
          name: entry.name,
          path: itemPath,
          type: getMediaType(entry.name, isDir),
          size,
          mtime,
        };
      })
      .sort((a, b) => {
        // Directories first, then alphabetical
        if (a.type === "directory" && b.type !== "directory") return -1;
        if (a.type !== "directory" && b.type === "directory") return 1;
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      });

    // Calculate parent path
    const parentPath = path.dirname(resolvedPath);
    const parent = isPathWithinRoot(parentPath, mediaRoot) ? parentPath : null;

    res.json({
      path: resolvedPath,
      parent,
      items,
    });
  } catch (err) {
    console.error("[Files] Error:", err);
    res.status(500).json({
      error: "Failed to read directory",
    });
  }
});

export default router;
