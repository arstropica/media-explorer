import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { ControlBar } from "@/components/ControlBar";
import { NavigationBar } from "@/components/NavigationBar";
import { FilterBar } from "@/components/FilterBar";
import { FileList } from "@/components/FileList";
import { ThumbnailGrid } from "@/components/ThumbnailGrid";
import { PreviewSidebar } from "@/components/PreviewSidebar";
import { Button } from "@/components/ui/button";
import { useFiles, useFileSelection } from "@/hooks/useFiles";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useExplorerStore } from "@/store/explorerStore";
import { useSettingsStore } from "@/store/settingsStore";

export default function App() {
  const { isLoading, error, setCurrentPath } = useExplorerStore();
  const { viewMode } = useSettingsStore();
  const { items, parentPath, reload } = useFiles();
  const { handleSelect } = useFileSelection();

  // Enable keyboard navigation
  useKeyboardNav(items);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar with controls */}
      <ControlBar />

      {/* Navigation breadcrumbs */}
      <NavigationBar parentPath={parentPath} />

      {/* File filter */}
      <FilterBar />

      {/* Main content area */}
      <div className="flex-1 flex min-h-0">
        {/* File listing */}
        <div className="flex-1 overflow-auto min-w-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p>{error}</p>
              <Button variant="outline" onClick={reload}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : viewMode === "list" ? (
            <FileList
              items={items}
              onSelect={handleSelect}
              onNavigate={setCurrentPath}
            />
          ) : (
            <ThumbnailGrid items={items} onNavigate={setCurrentPath} />
          )}
        </div>

        {/* Preview sidebar (list view only) */}
        {viewMode === "list" && <PreviewSidebar />}
      </div>
    </div>
  );
}
