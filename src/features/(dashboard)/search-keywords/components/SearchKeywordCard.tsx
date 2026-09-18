// src/features/(dashboard)/search-keywords/components/SearchKeywordCard.tsx
"use client";

import { Trash2 } from "lucide-react";
import { Checkbox } from "@/src/components/ui/checkbox";
import { cn } from "@/src/lib/utils";
import { SearchKeyword } from "../api";

interface SearchKeywordCardProps {
  searchKeyword: SearchKeyword;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  onDelete: () => void;
}

/**
 * Same chip as the tags grid minus the edit action: a search term is a record of
 * what someone typed, so renaming it would falsify the data.
 */
export function SearchKeywordCard({
  searchKeyword,
  selected,
  onSelectedChange,
  onDelete,
}: SearchKeywordCardProps) {
  const { keyword, count } = searchKeyword;
  const label = `${keyword} (${count})`;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 transition-colors",
        selected
          ? "border-c2-primary bg-c2-navy-50/40"
          : "border-c2-neutral-200 hover:border-c2-navy-300"
      )}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={(value) => onSelectedChange(value === true)}
        aria-label={`تحديد ${keyword}`}
        className="size-4 shrink-0 border-c2-navy-300 data-[state=checked]:border-c2-primary data-[state=checked]:bg-c2-primary"
      />

      {/* Only the term truncates — the counter is a shrink-0 sibling so it stays readable */}
      <span
        className="flex min-w-0 flex-1 items-center gap-1 text-sm text-c2-neutral-800"
        title={label}
      >
        <span className="min-w-0 truncate">{keyword}</span>
        <span className="shrink-0 text-c2-neutral-500">({count})</span>
      </span>

      <button
        type="button"
        onClick={onDelete}
        aria-label={`حذف ${keyword}`}
        className="shrink-0 cursor-pointer rounded-sm bg-c2-red-500-a10 p-1.5 transition-colors hover:bg-c2-red-500/20"
      >
        <Trash2 className="size-4 text-c2-danger" />
      </button>
    </div>
  );
}
