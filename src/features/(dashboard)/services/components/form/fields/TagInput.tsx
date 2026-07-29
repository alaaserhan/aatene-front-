// src/features/(dashboard)/services/components/form/fields/TagInput.tsx
"use client";

import { KeyboardEvent, useState } from "react";
import { OptionTag } from "@/src/components/ui/OptionTag";

interface TagInputProps {
  tags: string[];
  /** Returns true on a successful add so the input clears (the parent handles dup/limit checks) */
  onAdd: (value: string) => boolean;
  onRemove: (value: string) => void;
  placeholder?: string;
  addLabel?: string;
  disabled?: boolean;
}

/** Generic tag input: text field + add button + removable tag list */
export function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder = "اضف عنصراً ثم اضغط إضافة",
  addLabel = "إضافة",
  disabled = false,
}: TagInputProps) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const value = input.trim();
    if (!value) return;
    if (onAdd(value)) setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-sm text-sm transition-all focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !input.trim()}
          className="px-6 py-3 bg-blue-4 text-white rounded-sm text-sm font-medium transition-colors hover:bg-[#2c425e] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {addLabel}
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <OptionTag key={tag} label={tag} onRemove={() => onRemove(tag)} showRemoveButton />
          ))}
        </div>
      )}
    </div>
  );
}
