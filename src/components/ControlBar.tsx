import { List, Grid3X3, Volume2, VolumeX, Play, Pause, Navigation } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSettingsStore } from "@/store/settingsStore";

export function ControlBar() {
  const {
    viewMode,
    setViewMode,
    autoPlay,
    setAutoPlay,
    muted,
    setMuted,
    keyboardNav,
    setKeyboardNav,
  } = useSettingsStore();

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b bg-card">
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(value) => {
          if (value) setViewMode(value as "list" | "thumbnail");
        }}
      >
        <ToggleGroupItem value="list" aria-label="List view">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="thumbnail" aria-label="Thumbnail view">
          <Grid3X3 className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-2">
        {autoPlay ? (
          <Play className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Pause className="h-4 w-4 text-muted-foreground" />
        )}
        <Switch checked={autoPlay} onCheckedChange={setAutoPlay} />
        <span className="text-sm text-muted-foreground">Auto-play</span>
      </div>

      <div className="flex items-center gap-2">
        {muted ? (
          <VolumeX className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Volume2 className="h-4 w-4 text-muted-foreground" />
        )}
        <Switch checked={muted} onCheckedChange={setMuted} />
        <span className="text-sm text-muted-foreground">Mute</span>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-2">
        <Navigation className="h-4 w-4 text-muted-foreground" />
        <Switch checked={keyboardNav} onCheckedChange={setKeyboardNav} />
        <span className="text-sm text-muted-foreground">↑↓ Keys</span>
      </div>
    </div>
  );
}
