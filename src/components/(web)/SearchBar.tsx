"use client";

import React, { useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLanguage } from "@/src/hooks/use-language";
import { cn } from "@/src/lib/utils";
import { Search, X } from "lucide-react";

export type SearchType = "products" | "services" | "stores" | "users";

interface SearchBarProps {
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

interface SearchBarInnerProps extends SearchBarProps {
  urlQ: string;
  urlType: SearchType;
  searchParams: ReturnType<typeof useSearchParams>;
  pathname: string;
  locale: string;
}

function SearchBarInner({
  defaultType = "products",
  variant = "navbar",
  onSearch,
  urlQ,
  urlType,
  searchParams,
  pathname,
  locale,
}: SearchBarInnerProps) {
  const router = useRouter();

  const initialType = urlType && SEARCH_TYPES.some((t) => t.value === urlType)
    ? urlType
    : defaultType;

  const [searchQuery, setSearchQuery] = useState(urlQ);
  const [selectedType, setSelectedType] = useState<SearchType>(initialType);

  // --- Render-level sync: update local state when URL changes (Back/Forward, cross-page nav) ---
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  const [prevUrlType, setPrevUrlType] = useState(urlType);

  if (urlQ !== prevUrlQ || urlType !== prevUrlType || pathname !== prevPathname) {
    setPrevUrlQ(urlQ);
    setPrevUrlType(urlType);
    setPrevPathname(pathname);
    setSearchQuery(urlQ);
    setSelectedType(urlType);
  }
  // ---------------------------------------------------------------------------------------------

  const handleSearch = () => {
    const params = new URLSearchParams();
    const query = searchQuery.trim();

    if (query) params.set("q", query);
    params.set("type", selectedType);

    const searchPath = `/${locale}/search`;
    const queryString = params.toString();
    const targetUrl = `${searchPath}?${queryString}`;

    // Don't push if we're already at the exact target URL
    const currentQuery = searchParams.toString();
    if (pathname === searchPath && currentQuery === queryString) {
      onSearch?.();
      return;
    }

    router.push(targetUrl, { scroll: false });
    onSearch?.();
  };

  const handleClear = () => {
    setSearchQuery("");
    const isAlreadyOnSearchPage =
      pathname === "/search" ||
      pathname === `/${locale}/search` ||
      pathname.endsWith("/search");

    if (isAlreadyOnSearchPage) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else {
      const params = new URLSearchParams();
      params.set("type", selectedType);
      router.push(`/${locale}/search?${params.toString()}`);
    }
    onSearch?.();
  };

  /**
   * handleTypeChange — switches the active search category tab.
   *
   * Key design decisions:
   * 1. No `isSwitchingType` / no button disabling.  The Next.js router processing
   *    window (50–400 ms) was the direct cause of the perceived UI freeze: buttons
   *    were disabled the moment the tab was clicked and only re-enabled once the
   *    URL finally updated.  Removing that state makes tab switching feel instant.
   * 2. `setSelectedType(type)` is called optimistically so the active-tab indicator
   *    switches immediately — before the URL updates — giving zero-latency feedback.
   * 3. When already on the search page we use `router.replace` (preserves history
   *    clean) and build the URL from the current `pathname` directly (supports both
   *    the locale-stripped `/search` and the explicit `/${locale}/search` path that
   *    `next-international` may produce).
   */
  const handleTypeChange = useCallback((type: SearchType) => {
    const isAlreadyOnSearchPage =
      pathname === "/search" ||
      pathname === `/${locale}/search` ||
      pathname.endsWith("/search");

    // Already on this tab — nothing to do
    if (isAlreadyOnSearchPage && type === selectedType) return;

    // Optimistic UI: switch active indicator instantly, no button disabled state
    setSelectedType(type);

    // Build the target URL, carry over the search query, drop type-specific filters
    const p = new URLSearchParams(searchParams.toString());
    p.set("type", type);
    p.delete("page");
    p.delete("category_id");
    p.delete("city_id");
    p.delete("tags");
    p.delete("variation_options");
    p.delete("min_price");
    p.delete("max_price");
    p.delete("review_rate");

    const currentQ = searchParams.get("q") || searchQuery.trim();
    if (currentQ) p.set("q", currentQ);
    else p.delete("q");

    if (isAlreadyOnSearchPage) {
      // Use the live pathname so we never accidentally introduce a locale prefix
      // that triggers a next-international redirect loop
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    } else {
      router.push(`/${locale}/search?${p.toString()}`);
    }
  }, [locale, router, selectedType, pathname, searchParams, searchQuery]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };


  // --- Render Variant: Mobile (For MobileNav) ---
  if (variant === "mobile") {
    return (
      <div className="flex flex-col w-full" dir="rtl">
        {/* Search Input */}
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full border border-blue-4 h-10 rounded-md py-2 pr-12 pl-24 focus:outline-none text-right"
            placeholder="بحث"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute left-20 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
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
              type="button"
              onClick={() => handleTypeChange(type.value)}
              className={cn(
                "py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer border flex justify-center items-center w-full text-center",
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
          <div className="relative w-full flex items-center">
            <input
              type="text"
              className="w-full border border-blue-1 h-10 rounded-md py-2 pr-10 pl-24 focus:outline-none text-right"
              placeholder="بحث"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <div className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center pointer-events-none text-blue-4">
              <Search className="w-5 h-5" />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute left-20 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              className="absolute left-0 top-0 h-10 bg-[#3D5E83] cursor-pointer text-white px-4 rounded-l-md hover:bg-[#2D496A] transition-colors"
              aria-label="بحث"
              onClick={handleSearch}
            >
              بحث
            </button>
          </div>

          {/* Tabs - Grid */}
          <div className="grid grid-cols-4 gap-2 w-full">
            {SEARCH_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeChange(type.value)}
                className={cn(
                  "py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border flex justify-center items-center w-full text-center",
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
          "hidden sm:flex items-center w-full border border-blue-1 rounded-full overflow-hidden bg-white h-12 pl-1",
        )}>

          {/* Search Input Section */}
          <div className="flex-1 flex items-center px-4 gap-2 relative">
            <Search className="text-blue-4 w-5 h-5 ml-2 shrink-0" />
            <input
              type="text"
              className="flex-1 h-full text-right focus:outline-none placeholder-gray-400 text-gray-700 bg-transparent pl-8"
              placeholder="بحث"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute left-2 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Separator */}
          <div className="h-6 w-[1.5px] bg-gray-200 mx-2" />

          {/* Type Tabs */}
          <div className="flex items-center gap-1 px-2">
            {SEARCH_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeChange(type.value)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap rounded-full shrink-0",
                  selectedType === type.value
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Search Button */}
          <button
            className="h-10 px-6 bg-[#3D5E83] text-white text-sm font-medium hover:bg-[#2D496A] transition-colors cursor-pointer rounded-full shrink-0"
            aria-label="بحث"
            onClick={handleSearch}
          >
            بحث
          </button>
        </div>
      </div>
    );
  }

  // --- Render Variant: Navbar (Default) ---
  return (
    <div className="flex items-center w-full border border-gray-200 rounded-md overflow-hidden bg-white" dir="rtl">
      <div className="flex-1 relative flex items-center">
        <input
          type="text"
          className="flex-1 h-10 pr-4 pl-10 text-sm text-right focus:outline-none placeholder-gray-400 bg-transparent"
          placeholder="البحث"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute left-3 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="مسح البحث"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="h-6 w-px bg-gray-200" />

      <div className="flex items-center gap-1 px-2">
        {SEARCH_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => handleTypeChange(type.value)}
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

function SearchBarWrapper(props: SearchBarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locale = useLanguage();

  const q = searchParams.get("q") || "";
  const urlType = searchParams.get("type") as SearchType;
  const type = (urlType && SEARCH_TYPES.some((t) => t.value === urlType))
    ? urlType
    : (props.defaultType || "products");

  return (
    <SearchBarInner
      // key={q} — only remount when the user submits a completely new text search.
      // Tab changes do NOT remount: the render-level sync block handles state sync
      // cheaply without destroying/recreating the component.
      key={q}
      urlQ={q}
      urlType={type}
      searchParams={searchParams}
      pathname={pathname}
      locale={locale}
      {...props}
    />
  );
}

export function SearchBar(props: SearchBarProps) {
  return (
    <Suspense fallback={<div className="h-10 w-full animate-pulse bg-gray-50 rounded-md" />}>
      <SearchBarWrapper {...props} />
    </Suspense>
  );
}