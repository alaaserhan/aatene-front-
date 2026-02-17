"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { Search } from "lucide-react";

export type SearchType = "products" | "services" | "stores" | "users";

interface SearchBarProps {
  currentLocale: string;
  defaultType?: SearchType;
  variant?: "navbar" | "rounded" | "mobile";
  onSearch?: () => void;
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
  variant = "navbar",
  onSearch
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
    onSearch?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };


  // --- Render Variant: Mobile (For MobileNav) ---
  if (variant === "mobile") {
    return (
      <div className="flex flex-col w-full" dir="rtl">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            className="w-full border border-blue-4 h-10 rounded-md py-2 pr-12 focus:outline-none text-right pl-20"
            placeholder="بحث"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button
            className="absolute left-0 top-0 h-10 bg-blue-4 cursor-pointer text-white px-4 rounded-l-md hover:bg-[#206bc4] transition-colors"
            aria-label="بحث"
            onClick={handleSearch}
          >
            البحث
          </button>
          <div className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center pointer-events-none text-gray-400">
            <Search className="w-5 h-5" />
          </div>
        </div>

        {/* Type Tabs - Full Width Grid */}
        <div className="grid grid-cols-4 gap-2 mt-4 w-full">
          {SEARCH_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setSelectedType(type.value);
                const params = new URLSearchParams(searchParams.toString());
                params.set("type", type.value);
                router.push(`/${currentLocale}/search?${params.toString()}`);
              }}
              className={cn(
                "py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer border flex justify-center items-center w-full",
                selectedType === type.value
                  ? "bg-[#3D5E83] text-white border-[#3D5E83]"
                  : "bg-white text-[#3D5E83] border-gray-200 hover:bg-gray-50"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Render Variant: Rounded (For Search Results Page) ---
  if (variant === "rounded") {
    return (
      <div className="w-full" dir="rtl">
        {/* Mobile Layout: Stacked like standard search */}
        <div className="sm:hidden flex flex-col gap-4 w-full">
          {/* Input */}
          <div className="relative w-full">
            <input
              type="text"
              className="w-full border border-blue-1 h-10 rounded-md py-2 pr-10 focus:outline-none text-right pl-4"
              placeholder="بحث"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <div className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center pointer-events-none text-blue-4">
              <Search className="w-5 h-5" />
            </div>
          </div>

          {/* Tabs - Grid */}
          <div className="grid grid-cols-4 gap-2 w-full">
            {SEARCH_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setSelectedType(type.value);
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("type", type.value);
                  router.push(`/${currentLocale}/search?${params.toString()}`);
                }}
                className={cn(
                  "py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border flex justify-center items-center w-full",
                  selectedType === type.value
                    ? "bg-[#3D5E83] text-white border-[#3D5E83]"
                    : "bg-white text-[#3D5E83] border-gray-200 hover:bg-gray-50"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Layout: Pill Shape */}
        <div className={cn(
          "hidden sm:flex items-center w-full border border-blue-1 rounded-full overflow-hidden bg-white h-12",
        )}>

          {/* Search Input Section */}
          <div className="flex-1 flex items-center px-4 gap-2">
            <Search className="text-blue-4 w-5 h-5 ml-2 shrink-0" />
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

          {/* Type Tabs */}
          <div className="flex items-center gap-1 px-2">
            {SEARCH_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setSelectedType(type.value);
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("type", type.value);
                  router.push(`/${currentLocale}/search?${params.toString()}`);
                }}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap rounded-full shrink-0",
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
        onKeyDown={handleKeyPress}
      />
      <div className="h-6 w-px bg-gray-200" />

      <div className="flex items-center gap-1 px-2">
        {SEARCH_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => {
              setSelectedType(type.value);
              const params = new URLSearchParams(searchParams.toString());
              params.set("type", type.value);
              router.push(`/${currentLocale}/search?${params.toString()}`);
            }}
            className={cn(
              "px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap",
              selectedType === type.value
                ? "text-blue-3 font-medium"
                : "text-gray-400 hover:text-gray-700"
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