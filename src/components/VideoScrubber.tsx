import { formatDuration } from "@/lib/utils";

interface VideoScrubberProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function VideoScrubber({
  currentTime,
  duration,
  onSeek,
}: VideoScrubberProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    onSeek(percentage * duration);
  };

  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    handleClick(e);
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-black/50">
      <span className="text-xs text-white/80 w-12 text-right tabular-nums">
        {formatDuration(currentTime)}
      </span>

      <div
        className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer group"
        onClick={handleClick}
        onMouseMove={handleDrag}
      >
        <div
          className="h-full bg-primary rounded-full relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <span className="text-xs text-white/80 w-12 tabular-nums">
        {formatDuration(duration)}
      </span>
    </div>
  );
}
