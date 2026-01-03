import { FileIcon } from "@/components/FileIcon";
import type { FileItem } from "@/api/types";
import { cn, formatBytes } from "@/lib/utils";
import { isMediaFile } from "@/lib/mediaTypes";
import { useExplorerStore } from "@/store/explorerStore";

interface FileListProps {
  items: FileItem[];
  onSelect: (file: FileItem) => void;
  onNavigate: (path: string) => void;
}

export function FileList({ items, onSelect, onNavigate }: FileListProps) {
  const { selectedFile } = useExplorerStore();

  const handleClick = (file: FileItem) => {
    if (file.type === "directory") {
      onNavigate(file.path);
    } else if (isMediaFile(file.type)) {
      onSelect(file);
    }
  };

  const handleDoubleClick = (file: FileItem) => {
    if (file.type === "directory") {
      onNavigate(file.path);
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
    <div className="divide-y">
      {items.map((file) => {
        const isSelected = selectedFile?.path === file.path;
        const isClickable = file.type === "directory" || isMediaFile(file.type);

        return (
          <div
            key={file.path}
            className={cn(
              "flex items-center gap-3 px-4 py-2 transition-colors",
              isClickable && "cursor-pointer hover:bg-muted/50",
              !isClickable && "opacity-40 cursor-not-allowed",
              isSelected && "bg-primary/10"
            )}
            onClick={() => handleClick(file)}
            onDoubleClick={() => handleDoubleClick(file)}
          >
            <FileIcon type={file.type} className="h-5 w-5" />

            <span
              className={cn(
                "flex-1 truncate",
                file.type === "directory" && "font-medium"
              )}
              title={file.name}
            >
              {file.name}
            </span>

            {file.type !== "directory" && (
              <span className="text-xs text-muted-foreground shrink-0">
                {formatBytes(file.size)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
