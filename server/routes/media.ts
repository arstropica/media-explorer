import { Router } from "express";
import type { Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = Router();

const MIME_TYPES: Record<string, string> = {
  // Images
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  ico: "image/x-icon",
  tiff: "image/tiff",
  tif: "image/tiff",
  // Videos
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  m4v: "video/x-m4v",
  wmv: "video/x-ms-wmv",
  flv: "video/x-flv",
  "3gp": "video/3gpp",
  // Audio
  mp3: "audio/mpeg",
  wav: "audio/wav",
  flac: "audio/flac",
  aac: "audio/aac",
  m4a: "audio/mp4",
  wma: "audio/x-ms-wma",
  aiff: "audio/aiff",
  opus: "audio/opus",
};

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return MIME_TYPES[ext] || "application/octet-stream";
}

function isPathWithinRoot(requestedPath: string, rootPath: string): boolean {
  const resolved = path.resolve(requestedPath);
  const root = path.resolve(rootPath);
  return resolved.startsWith(root);
}

router.get("/", (req: Request, res: Response) => {
  try {
    const mediaRoot: string = req.app.locals.mediaRoot;
    const requestedPath = req.query.path as string;

    if (!requestedPath) {
      return res.status(400).json({ error: "Path parameter required" });
    }

    // Resolve the path
    const resolvedPath = path.resolve(requestedPath);

    // Security: ensure path is within MEDIA_ROOT
    if (!isPathWithinRoot(resolvedPath, mediaRoot)) {
      return res.status(403).json({
        error: "Access denied: path outside media root",
      });
    }

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Get file stats
    const stats = fs.statSync(resolvedPath);

    if (stats.isDirectory()) {
      return res.status(400).json({ error: "Path is a directory" });
    }

    const mimeType = getMimeType(resolvedPath);
    const fileSize = stats.size;

    // Handle Range requests for video/audio seeking
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Length", chunkSize);
      res.setHeader("Content-Type", mimeType);

      const stream = fs.createReadStream(resolvedPath, { start, end });
      stream.pipe(res);
    } else {
      // Full file request
      res.setHeader("Content-Length", fileSize);
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Accept-Ranges", "bytes");

      const stream = fs.createReadStream(resolvedPath);
      stream.pipe(res);
    }
  } catch (err) {
    console.error("[Media] Error:", err);
    res.status(500).json({ error: "Failed to serve media" });
  }
});

export default router;
