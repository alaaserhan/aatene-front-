// src/components/ui/TagSearchInput.tsx
"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { cn } from "@/src/lib/utils";
import { useDebounce } from "@/src/hooks/use-debounce";
import { TagType } from "@/src/features/(dashboard)/tags/api";
import { useSearchTags } from "@/src/features/(dashboard)/tags/hooks";

interface TagSearchInputProps {
  tags: string[];
  /** Returns true on a successful add so the input clears (the parent handles dup/limit checks) */
  onAdd: (value: string) => boolean;
  onRemove: (value: string) => void;
  /** Filters the suggestions to product or service tags */
  type: TagType;
  placeholder?: string;
  addLabel?: string;
  disabled?: boolean;
  /** Hides the remove button on the selected tags (e.g. while a minimum count must be kept) */
  showRemoveButton?: boolean;
  /** Extra classes for the input, so callers can match their own field sizing */
  inputClassName?: string;
}

const PER_PAGE = 15;

/**
 * Tag input backed by the tags endpoint: suggests existing tags while typing
 * and falls back to creating a brand new one when nothing matches.
 */
export function TagSearchInput({
  tags,
  onAdd,
  onRemove,
  type,
  placeholder = "ابحث عن كلمة مفتاحية أو أضف كلمة جديدة",
  addLabel = "إضافة",
  disabled = false,
  showRemoveButton = true,
  inputClassName,
}: TagSearchInputProps) {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = input.trim();
  const debouncedSearch = useDebounce(search, 400);

  const { data, isFetching } = useSearchTags(
    { search: debouncedSearch || undefined, type, per_page: PER_PAGE, page: 1 },
    isOpen
  );

  // Suggestions exclude what is already selected
  const suggestions = (data?.data ?? []).filter((tag) => !tags.includes(tag.name));
  const hasExactMatch = (data?.data ?? []).some(
    (tag) => tag.name.toLowerCase() === search.toLowerCase()
  );
  const canCreate = search.length > 0 && !hasExactMatch && !tags.includes(search);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (onAdd(trimmed)) {
      setInput("");
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd(input);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const showDropdown = isOpen && !disabled;

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="relative">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 start-3 w-4 h-4 -translate-y-1/2 text-gray-2" />
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "w-full ps-9 pe-4 py-3 border border-gray-200 rounded-sm text-sm transition-all focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-gray-100",
                inputClassName
              )}
            />
            {isFetching && (
              <Loader2 className="absolute top-1/2 end-3 w-4 h-4 -translate-y-1/2 animate-spin text-gray-2" />
            )}
          </div>
          <button
            type="button"
            onClick={() => handleAdd(input)}
            disabled={disabled || !search}
            className="px-6 py-3 bg-blue-4 text-white rounded-sm text-sm font-medium transition-colors hover:bg-[#2c425e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {addLabel}
          </button>
        </div>

        {showDropdown && (
          <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-sm border border-gray-200 bg-white shadow-lg">
            {canCreate && (
              <button
                type="button"
                onClick={() => handleAdd(search)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm text-blue-4 transition-colors hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>
                  إضافة &quot;{search}&quot; ككلمة مفتاحية جديدة
                </span>
              </button>
            )}

            {suggestions.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleAdd(tag.name)}
                className="block w-full px-4 py-2.5 text-start text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                {tag.name}
              </button>
            ))}

            {!isFetching && suggestions.length === 0 && !canCreate && (
              <p className="px-4 py-3 text-sm text-gray-2">
                {search ? "هذه الكلمة مضافة بالفعل" : "ابدأ الكتابة للبحث عن الكلمات المفتاحية"}
              </p>
            )}

            {isFetching && suggestions.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-2">جاري البحث...</p>
            )}
          </div>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <OptionTag
              key={tag}
              label={tag}
              onRemove={() => onRemove(tag)}
              showRemoveButton={showRemoveButton}
            />
          ))}
        </div>
      )}
    </div>
  );
}
