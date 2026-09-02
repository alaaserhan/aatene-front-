// src/features/(dashboard)/keywords/components/KeywordCard.tsx
"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/src/components/ui/checkbox";
import { cn } from "@/src/lib/utils";
import { Keyword, KeywordType, getKeywordCount } from "../api";

interface KeywordCardProps {
  keyword: Keyword;
  /** Decides which of the three usage counters is shown next to the title */
  type: KeywordType;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function KeywordCard({
  keyword,
  type,
  selected,
  onSelectedChange,
  onEdit,
  onDelete,
}: KeywordCardProps) {
  const count = getKeywordCount(keyword, type);
  const label = `${keyword.title} (${count})`;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 transition-colors",
        selected ? "border-c2-primary bg-c2-navy-50/40" : "border-c2-neutral-200 hover:border-c2-navy-300"
      )}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={(value) => onSelectedChange(value === true)}
        aria-label={`تحديد ${keyword.title}`}
        className="size-4 shrink-0 border-c2-navy-300 data-[state=checked]:border-c2-primary data-[state=checked]:bg-c2-primary"
      />

      {/* Only the title truncates — the counter is a shrink-0 sibling so it stays readable */}
      <span className="flex min-w-0 flex-1 items-center gap-1 text-sm text-c2-neutral-800" title={label}>
        <span className="min-w-0 truncate">{keyword.title}</span>
        <span className="shrink-0 text-c2-neutral-500">({count})</span>
      </span>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`تعديل ${keyword.title}`}
          className="cursor-pointer rounded-sm bg-c2-navy-50 p-1.5 transition-colors hover:bg-c2-navy-700-a08"
        >
          <Pencil className="size-4 text-c2-primary" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`حذف ${keyword.title}`}
          className="cursor-pointer rounded-sm bg-c2-red-500-a10 p-1.5 transition-colors hover:bg-c2-red-500/20"
        >
          <Trash2 className="size-4 text-c2-danger" />
        </button>
      </div>
    </div>
  );
}
