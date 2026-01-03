import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaPreview } from "@/components/MediaPreview";
import { useResizable } from "@/hooks/useResizable";
import { useSettingsStore } from "@/store/settingsStore";
import { useExplorerStore } from "@/store/explorerStore";
import { cn } from "@/lib/utils";

export function PreviewSidebar() {
  const { sidebarWidth, setSidebarWidth } = useSettingsStore();
  const { selectedFile, selectFile } = useExplorerStore();

  const { width, isDragging, handleMouseDown } = useResizable({
    initialWidth: sidebarWidth,
    minWidth: 250,
    maxWidth: 800,
    onWidthChange: setSidebarWidth,
  });

  if (!selectedFile) {
    return (
      <div
        className="border-l bg-muted/30 flex items-center justify-center text-muted-foreground"
        style={{ width: `${width}px` }}
      >
        <div className="text-center p-4">
          <p>Select a file to preview</p>
          <p className="text-xs mt-1">
            Click on an image, video, or audio file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex border-l" style={{ width: `${width}px` }}>
      {/* Resize handle */}
      <div
        className={cn(
          "w-1 cursor-col-resize hover:bg-primary transition-colors shrink-0",
          isDragging && "bg-primary"
        )}
        onMouseDown={handleMouseDown}
      />

      {/* Preview content */}
      <div className="flex-1 flex flex-col min-w-0 bg-card">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
          <span className="text-sm font-medium truncate" title={selectedFile.name}>
            {selectedFile.name}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => selectFile(null)}
            title="Close preview"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Media preview */}
        <div className="flex-1 min-h-0">
          <MediaPreview file={selectedFile} />
        </div>
      </div>
    </div>
  );
}
