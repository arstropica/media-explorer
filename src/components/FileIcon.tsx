import {
  Folder,
  Image,
  Video,
  Music,
  File,
} from "lucide-react";
import type { MediaType } from "@/lib/mediaTypes";
import { cn } from "@/lib/utils";

interface FileIconProps {
  type: MediaType;
  className?: string;
}

export function FileIcon({ type, className }: FileIconProps) {
  const baseClass = cn("shrink-0", className);

  switch (type) {
    case "directory":
      return <Folder className={cn(baseClass, "text-blue-500")} />;
    case "image":
      return <Image className={cn(baseClass, "text-green-500")} />;
    case "video":
      return <Video className={cn(baseClass, "text-purple-500")} />;
    case "audio":
      return <Music className={cn(baseClass, "text-orange-500")} />;
    default:
      return <File className={cn(baseClass, "text-muted-foreground")} />;
  }
}
