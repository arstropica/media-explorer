import { Search, X, AlertCircle } from "lucide-react";
import { useExplorerStore } from "@/store/explorerStore";
import { useMemo } from "react";

export function FilterBar() {
  const { filterText, setFilterText } = useExplorerStore();

  const isValidRegex = useMemo(() => {
    if (!filterText) return true;
    try {
      new RegExp(filterText, "i");
      return true;
    } catch {
      return false;
    }
  }, [filterText]);

  return (
    <div className="px-4 py-2 border-b bg-muted/10">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter files... (supports regex)"
          className="w-full text-sm bg-background border rounded px-9 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {filterText && (
          <button
            onClick={() => setFilterText("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {!isValidRegex && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-1 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Invalid regex</span>
          </div>
        )}
      </div>
    </div>
  );
}
