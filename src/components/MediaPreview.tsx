import { useEffect, useRef, useState } from "react";
import { Music, AlertCircle, Play, Pause } from "lucide-react";
import { VideoScrubber } from "@/components/VideoScrubber";
import { getMediaUrl } from "@/api/client";
import type { FileItem } from "@/api/types";
import { useSettingsStore } from "@/store/settingsStore";

interface MediaPreviewProps {
  file: FileItem;
  showScrubber?: boolean;
}

export function MediaPreview({ file, showScrubber = true }: MediaPreviewProps) {
  const { autoPlay, muted } = useSettingsStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Use ref to always get current autoPlay value in event handlers
  const autoPlayRef = useRef(autoPlay);
  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const mediaUrl = getMediaUrl(file.path);
  const isVideo = file.type === "video";
  const isAudio = file.type === "audio";
  const isImage = file.type === "image";

  // Reset state when file changes
  useEffect(() => {
    setVideoError(false);
    setImageError(false);
    setAudioError(false);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [file.path]);

  const handleVideoCanPlay = () => {
    if (autoPlayRef.current && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleAudioCanPlay = () => {
    if (autoPlayRef.current && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleSeek = (time: number) => {
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = time;
    } else if (isAudio && audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const togglePlay = () => {
    if (isVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    } else if (isAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  // Unsupported file type
  if (!isVideo && !isAudio && !isImage) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <AlertCircle className="h-12 w-12" />
        <span>Cannot preview this file type</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Image */}
      {isImage && (
        <div className="flex-1 flex items-center justify-center p-4 bg-black/5">
          {imageError ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
              <AlertCircle className="h-12 w-12" />
              <span>Failed to load image</span>
            </div>
          ) : (
            <img
              key={file.path}
              src={mediaUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain"
              onError={() => setImageError(true)}
            />
          )}
        </div>
      )}

      {/* Video */}
      {isVideo && (
        <div className="flex-1 flex flex-col">
          {videoError ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <AlertCircle className="h-12 w-12" />
              <span>Failed to load video</span>
              <span className="text-xs">Format may not be supported in browser</span>
            </div>
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center min-h-0 relative group">
                <video
                  key={file.path}
                  ref={videoRef}
                  src={mediaUrl}
                  muted={muted}
                  loop={autoPlay}
                  controls={!showScrubber}
                  className="max-w-full max-h-full object-contain"
                  onCanPlay={handleVideoCanPlay}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  onError={() => setVideoError(true)}
                />

                {/* Play/Pause overlay */}
                {showScrubber && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors"
                  >
                    <div className={`p-4 rounded-full bg-black/50 text-white transition-opacity ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                      {isPlaying ? (
                        <Pause className="h-12 w-12" />
                      ) : (
                        <Play className="h-12 w-12" />
                      )}
                    </div>
                  </button>
                )}
              </div>

              {showScrubber && duration > 0 && (
                <VideoScrubber
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={handleSeek}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Audio */}
      {isAudio && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
          {audioError ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
              <AlertCircle className="h-12 w-12" />
              <span>Failed to load audio</span>
            </div>
          ) : (
            <>
              <Music className="h-24 w-24 text-muted-foreground" />
              <audio
                key={file.path}
                ref={audioRef}
                src={mediaUrl}
                muted={muted}
                controls
                className="w-full max-w-md"
                onCanPlay={handleAudioCanPlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onError={() => setAudioError(true)}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
