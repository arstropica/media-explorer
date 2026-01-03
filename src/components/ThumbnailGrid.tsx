import { useState, useRef, useEffect } from "react";
import { X, Play, Music, AlertCircle } from "lucide-react";
import { FileIcon } from "@/components/FileIcon";
import { VideoScrubber } from "@/components/VideoScrubber";
import { getMediaUrl } from "@/api/client";
import type { FileItem } from "@/api/types";
import { isMediaFile } from "@/lib/mediaTypes";
import { useSettingsStore } from "@/store/settingsStore";
import { useExplorerStore } from "@/store/explorerStore";
import { cn } from "@/lib/utils";

interface ThumbnailGridProps {
  items: FileItem[];
  onNavigate: (path: string) => void;
}

export function ThumbnailGrid({ items, onNavigate }: ThumbnailGridProps) {
  const [expandedFile, setExpandedFile] = useState<FileItem | null>(null);
  const [playingFile, setPlayingFile] = useState<FileItem | null>(null);
  const { selectedFile } = useExplorerStore();

  const handleClick = (file: FileItem) => {
    if (file.type === "directory") {
      onNavigate(file.path);
    } else if (file.type === "image") {
      setExpandedFile(file);
    } else if (file.type === "video" || file.type === "audio") {
      setPlayingFile(file);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        This folder is empty
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
        {items.map((file) => (
          <ThumbnailItem
            key={file.path}
            file={file}
            onClick={() => handleClick(file)}
            isPlaying={playingFile?.path === file.path}
            isSelected={selectedFile?.path === file.path}
            onStopPlaying={() => setPlayingFile(null)}
          />
        ))}
      </div>

      {/* Expanded image overlay */}
      {expandedFile && (
        <ExpandedImageOverlay
          file={expandedFile}
          onClose={() => setExpandedFile(null)}
        />
      )}
    </>
  );
}

interface ThumbnailItemProps {
  file: FileItem;
  onClick: () => void;
  isPlaying: boolean;
  isSelected: boolean;
  onStopPlaying: () => void;
}

function ThumbnailItem({
  file,
  onClick,
  isPlaying,
  isSelected,
  onStopPlaying,
}: ThumbnailItemProps) {
  const { muted, autoPlay } = useSettingsStore();
  const isClickable = file.type === "directory" || isMediaFile(file.type);

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-card overflow-hidden transition-all",
        isClickable && "cursor-pointer hover:ring-2 hover:ring-primary",
        !isClickable && "opacity-40",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={isPlaying ? undefined : onClick}
    >
      {/* Thumbnail area */}
      <div className="aspect-square relative bg-muted">
        {isPlaying && (file.type === "video" || file.type === "audio") ? (
          <PlayingMedia file={file} muted={muted} loop={autoPlay} onStop={onStopPlaying} />
        ) : (
          <ThumbnailPreview file={file} />
        )}
      </div>

      {/* Filename */}
      <div className="px-2 py-1.5 border-t">
        <span className="text-xs truncate block" title={file.name}>
          {file.name}
        </span>
      </div>
    </div>
  );
}

function ThumbnailPreview({ file }: { file: FileItem }) {
  const [error, setError] = useState(false);

  if (file.type === "directory") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <FileIcon type="directory" className="h-16 w-16" />
      </div>
    );
  }

  if (file.type === "image") {
    if (error) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <FileIcon type="image" className="h-12 w-12" />
        </div>
      );
    }
    return (
      <img
        src={getMediaUrl(file.path)}
        alt={file.name}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
        loading="lazy"
      />
    );
  }

  if (file.type === "video") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-purple-500/10">
        <div className="relative">
          <FileIcon type="video" className="h-12 w-12" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="h-6 w-6 text-white fill-white" />
          </div>
        </div>
      </div>
    );
  }

  if (file.type === "audio") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-orange-500/10">
        <FileIcon type="audio" className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <FileIcon type="other" className="h-12 w-12" />
    </div>
  );
}

interface PlayingMediaProps {
  file: FileItem;
  muted: boolean;
  loop: boolean;
  onStop: () => void;
}

function PlayingMedia({ file, muted, loop, onStop }: PlayingMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const ref = file.type === "video" ? videoRef.current : audioRef.current;
    if (ref) {
      ref.play().catch(() => {});
    }
  }, [file.type]);

  const handleSeek = (time: number) => {
    const ref = file.type === "video" ? videoRef.current : audioRef.current;
    if (ref) {
      ref.currentTime = time;
    }
  };

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <span className="text-xs text-center text-muted-foreground">
          Failed to load
        </span>
        <button
          className="text-xs text-primary hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            onStop();
          }}
        >
          Close
        </button>
      </div>
    );
  }

  if (file.type === "video") {
    return (
      <div className="w-full h-full flex flex-col bg-black">
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            src={getMediaUrl(file.path)}
            muted={muted}
            loop={loop}
            className="w-full h-full object-contain"
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onEnded={loop ? undefined : onStop}
            onError={() => setError(true)}
          />
          <button
            className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70"
            onClick={(e) => {
              e.stopPropagation();
              onStop();
            }}
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
        {duration > 0 && (
          <VideoScrubber
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />
        )}
      </div>
    );
  }

  if (file.type === "audio") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-orange-500/10 p-2">
        <Music className="h-8 w-8 text-orange-500 animate-pulse" />
        <audio
          ref={audioRef}
          src={getMediaUrl(file.path)}
          muted={muted}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={onStop}
          onError={() => setError(true)}
        />
        {duration > 0 && (
          <div className="w-full">
            <VideoScrubber
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
            />
          </div>
        )}
        <button
          className="text-xs text-primary hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            onStop();
          }}
        >
          Stop
        </button>
      </div>
    );
  }

  return null;
}

interface ExpandedImageOverlayProps {
  file: FileItem;
  onClose: () => void;
}

function ExpandedImageOverlay({ file, onClose }: ExpandedImageOverlayProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        onClick={onClose}
      >
        <X className="h-6 w-6 text-white" />
      </button>

      <img
        src={getMediaUrl(file.path)}
        alt={file.name}
        className="max-w-[90vw] max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
        {file.name}
      </div>
    </div>
  );
}
