"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/src/lib/utils";

export type SearchType = "products" | "services" | "stores" | "users";

interface SearchBarProps {
  currentLocale: string;
  defaultType?: SearchType;
}

const SEARCH_TYPES: { value: SearchType; label: string }[] = [
  { value: "products", label: "منتجات" },
  { value: "stores", label: "متاجر" },
  { value: "services", label: "خدمات" },
  { value: "users", label: "مستخدمين" },
];

export function SearchBar({ currentLocale, defaultType = "products" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("q") || "";
  const initialType = (searchParams.get("type") as SearchType) || defaultType;

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState<SearchType>(initialType);

  // Sync with URL if it changes
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    const urlType = searchParams.get("type") as SearchType;
    if (urlType && SEARCH_TYPES.some((t) => t.value === urlType)) {
      setSelectedType(urlType);
    }
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    const query = searchQuery.trim();

    if (query) {
      params.set("q", query);
    }
    params.set("type", selectedType);

    router.push(`/${currentLocale}/search?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center w-full border border-gray-200 rounded-md overflow-hidden bg-white" dir="rtl">
      {/* Search Input */}
      <input
        type="text"
        className="flex-1 h-10 px-4 text-sm text-right focus:outline-none"
        placeholder="البحث"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
      />

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200" />

      {/* Type Tabs */}
      <div className="flex items-center gap-1 px-2">
        {SEARCH_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap",
              selectedType === type.value
                ? "text-[#3D5E83]"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Search Button */}
      <button
        className="h-10 px-6 bg-[#3D5E83] text-white text-sm font-medium hover:bg-[#2D496A] transition-colors cursor-pointer"
        aria-label="البحث"
        onClick={handleSearch}
      >
        البحث
      </button>
    </div>
  );
}