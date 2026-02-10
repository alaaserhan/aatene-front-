"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { Search } from "lucide-react";

export type SearchType = "products" | "services" | "stores" | "users";

interface SearchBarProps {
  currentLocale: string;
  defaultType?: SearchType;
  variant?: "navbar" | "rounded";
}

const SEARCH_TYPES: { value: SearchType; label: string }[] = [
  { value: "products", label: "منتجات" },
  { value: "stores", label: "متاجر" },
  { value: "services", label: "خدمات" },
  { value: "users", label: "مستخدمين" },
];

export function SearchBar({
  currentLocale,
  defaultType = "products",
  variant = "navbar"
}: SearchBarProps) {
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


  // --- Render Variant: Rounded (For Search Results Page) ---
  if (variant === "rounded") {
    return (
      <div className="flex items-center w-full border border-[#287CDA] rounded-full overflow-hidden bg-white h-12 " dir="rtl">

        {/* Search Input Section (Right) */}
        <div className="flex-1 flex items-center px-4 gap-2">
          <Search className="text-blue-[#287CDA] w-5 h-5 ml-2" />
          <input
            type="text"
            className="flex-1 h-full text-right focus:outline-none placeholder-gray-400 text-gray-700 bg-transparent"
            placeholder="بحث"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>

        {/* Separator */}
        <div className="h-6 w-[1.5px] bg-gray-200 mx-2" />

        {/* Type Tabs (Left) */}
        <div className="flex items-center gap-1 pl-2 pr-1">
          {SEARCH_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap rounded-full",
                selectedType === type.value
                  ? "bg-gray-100 text-gray-900 "
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Render Variant: Navbar (Default) ---
  return (
    <div className="flex items-center w-full border border-gray-200 rounded-md overflow-hidden bg-white" dir="rtl">
      <input
        type="text"
        className="flex-1 h-10 px-4 text-sm text-right focus:outline-none placeholder-gray-400"
        placeholder="البحث"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <div className="h-6 w-px bg-gray-200" />

      <div className="flex items-center gap-1 px-2">
        {SEARCH_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap",
              selectedType === type.value
                ? "text-[#3D5E83] font-bold"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {type.label}
          </button>
        ))}
      </div>




      {/* Search Button (Left in RTL) */}
      <button
        className="h-10 px-6 bg-[#3D5E83] text-white text-sm font-medium hover:bg-[#2D496A] transition-colors cursor-pointer flex items-center justify-center gap-2"
        aria-label="البحث"
        onClick={handleSearch}
      >
        <span>البحث</span>
      </button>

    </div>
  );
}