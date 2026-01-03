import { ChevronUp, ChevronRight, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExplorerStore } from "@/store/explorerStore";

interface NavigationBarProps {
  parentPath: string | null;
}

export function NavigationBar({ parentPath }: NavigationBarProps) {
  const { currentPath, setCurrentPath } = useExplorerStore();

  const pathParts = currentPath.split("/").filter(Boolean);

  const handleNavigate = (index: number) => {
    const newPath = "/" + pathParts.slice(0, index + 1).join("/");
    setCurrentPath(newPath);
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={!parentPath}
        onClick={() => parentPath && setCurrentPath(parentPath)}
        title="Go to parent folder"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>

      <div className="h-5 w-px bg-border" />

      <nav className="flex items-center gap-1 text-sm overflow-x-auto">
        <button
          className="flex items-center gap-1 hover:text-primary transition-colors shrink-0"
          onClick={() => setCurrentPath("/")}
        >
          <Folder className="h-4 w-4" />
        </button>

        {pathParts.map((part, index) => (
          <div key={index} className="flex items-center gap-1 shrink-0">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <button
              className="hover:text-primary hover:underline transition-colors truncate max-w-[200px]"
              onClick={() => handleNavigate(index)}
              title={part}
            >
              {part}
            </button>
          </div>
        ))}
      </nav>
    </div>
  );
}
