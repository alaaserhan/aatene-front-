"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface TagInputProps {
  label: string;
  placeholder?: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  buttonText?: string;
  className?: string;
}

export function TagInput({
  label,
  placeholder = "اكتب الحي",
  tags,
  onTagsChange,
  buttonText = "إضافة",
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onTagsChange([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Label */}
      <label className="block text-sm font-medium text-brand-black-1 text-right">
        {label}
      </label>

      {/* Input with Add Button */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAddTag}
          className="px-6 py-2.5 bg-brand-blue-3 text-white rounded-lg font-medium hover:bg-brand-blue-2 transition-colors whitespace-nowrap"
        >
          {buttonText}
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue-2 text-right"
          dir="rtl"
        />
      </div>

      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-end">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full text-sm"
            >
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:bg-gray-100 rounded-full p-0.5 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-brand-black-1">{tag}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}