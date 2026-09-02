"use client";

import { Suspense, useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useLanguage } from "@/src/hooks/use-language";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import {
  DEFAULT_SEARCH_TYPE,
  isSearchType,
  type SearchType,
} from "@/src/features/(web)/search/types";

export type SearchBarVariant = "navbar" | "mobile";

interface SearchBarProps {
  defaultType?: SearchType;
  variant?: SearchBarVariant;
  onSearch?: () => void;
}

/** Tab order and labels — deliberately not the declaration order in `SEARCH_TYPES`. */
const SEARCH_TYPE_TABS: { value: SearchType; label: string }[] = [
  { value: "stores", label: "متاجر" },
  { value: "products", label: "منتجات" },
  { value: "services", label: "خدمات" },
  { value: "users", label: "مستخدمين" },
];

/** Filters that only make sense within one search type — dropped when the tab changes. */
const TYPE_SCOPED_PARAMS = [
  "page",
  "category_id",
  "city_id",
  "tags",
  "variation_options",
  "min_price",
  "max_price",
  "review_rate",
];

/** Detail routes that imply an active search type even though we're off the search page. */
const DETAIL_PATH_TYPES: { segment: string; type: SearchType }[] = [
  { segment: "/store/", type: "stores" },
  { segment: "/product/", type: "products" },
  { segment: "/services/", type: "services" },
  { segment: "/profile/", type: "users" },
];

/* -------------------------------------------------------------------------- */
/* Controller                                                                  */
/* -------------------------------------------------------------------------- */

function useSearchController(defaultType: SearchType, onSearch?: () => void) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLanguage();

  const urlQuery = searchParams.get("q") || "";
  const urlTypeParam = searchParams.get("type");
  const urlType = isSearchType(urlTypeParam) ? urlTypeParam : defaultType;

  const [query, setQuery] = useState(urlQuery);
  const [selectedType, setSelectedType] = useState<SearchType>(urlType);

  // The URL is the source of truth, but Back/Forward and cross-page navigation
  // change it without remounting us — so re-derive local state during render
  // instead of syncing in an effect (or remounting via a `key`).
  const [synced, setSynced] = useState({ pathname, urlQuery, urlType });
  if (
    synced.pathname !== pathname ||
    synced.urlQuery !== urlQuery ||
    synced.urlType !== urlType
  ) {
    setSynced({ pathname, urlQuery, urlType });
    setQuery(urlQuery);
    setSelectedType(urlType);
  }

  // Covers both the locale-stripped `/search` and the `/${locale}/search` form
  // that next-international may produce.
  const isSearchPage = pathname.endsWith("/search");
  const detailType =
    DETAIL_PATH_TYPES.find(({ segment }) => pathname.includes(segment))?.type ?? null;

  const submit = useCallback(() => {
    const params = new URLSearchParams();
    const trimmed = query.trim();
    if (trimmed) params.set("q", trimmed);
    params.set("type", selectedType);

    const target = `/${locale}/search`;
    const queryString = params.toString();

    // Already showing exactly this result set — don't push a duplicate entry
    if (isSearchPage && searchParams.toString() === queryString) {
      onSearch?.();
      return;
    }

    router.push(`${target}?${queryString}`, { scroll: false });
    onSearch?.();
  }, [query, selectedType, locale, isSearchPage, searchParams, router, onSearch]);

  const clear = useCallback(() => {
    setQuery("");

    // Off the search page there are no results to update — just empty the field.
    if (!isSearchPage) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    onSearch?.();
  }, [isSearchPage, searchParams, pathname, router, onSearch]);

  /**
   * Switches the active category tab.
   *
   * `setSelectedType` runs optimistically so the active indicator moves on click
   * rather than after the router settles (50–400 ms). An earlier version disabled
   * the tabs during that window, which read as a UI freeze — hence no pending state.
   *
   * Picking a tab is itself a search, so `onSearch` fires here too — it closes the
   * mobile drawer, which would otherwise stay over the results we just navigated to.
   */
  const selectType = useCallback(
    (type: SearchType) => {
      if (isSearchPage && type === selectedType) {
        onSearch?.();
        return;
      }

      setSelectedType(type);

      const params = new URLSearchParams(searchParams.toString());
      params.set("type", type);
      TYPE_SCOPED_PARAMS.forEach((key) => params.delete(key));

      const currentQuery = searchParams.get("q") || query.trim();
      if (currentQuery) params.set("q", currentQuery);
      else params.delete("q");

      // On the search page use the live pathname, so we never re-introduce a
      // locale prefix and trigger a next-international redirect loop.
      if (isSearchPage) router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      else router.push(`/${locale}/search?${params.toString()}`);

      onSearch?.();
    },
    [isSearchPage, selectedType, searchParams, query, pathname, router, locale, onSearch]
  );

  return {
    query,
    setQuery,
    selectedType,
    submit,
    clear,
    selectType,
    /** The tab to highlight: the live selection on the search page, otherwise the detail route's type. */
    activeType: isSearchPage ? selectedType : detailType,
  };
}

type Controller = ReturnType<typeof useSearchController>;

/* -------------------------------------------------------------------------- */
/* Building blocks                                                             */
/* -------------------------------------------------------------------------- */

function SearchField({
  controller,
  className,
  clearButtonClassName,
}: {
  controller: Controller;
  className?: string;
  clearButtonClassName?: string;
}) {
  const { query, setQuery, submit, clear } = controller;

  return (
    <>
      <input
        type="text"
        className={cn(
          "h-10 bg-transparent text-right text-c2-neutral-800 placeholder-c2-navy-300 focus:outline-none",
          className
        )}
        placeholder="البحث"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={clear}
          className={cn(
            "absolute rounded-full text-c2-navy-300 hover:bg-c2-neutral-300-a10 hover:text-c2-neutral-800",
            clearButtonClassName
          )}
          aria-label="مسح البحث"
        >
          <X className="size-4" />
        </Button>
      )}
    </>
  );
}

/** `pill` = bordered blocks in a 4-up grid (mobile), `plain` = inline text tabs (navbar). */
type TabAppearance = "pill" | "plain";

const TAB_STYLES: Record<
  TabAppearance,
  { layout: string; base: string; active: string; inactive: string }
> = {
  plain: {
    layout: "flex items-center gap-1",
    base: "px-2 py-1.5 text-sm whitespace-nowrap",
    active: "text-c2-primary font-bold",
    inactive: "text-c2-neutral-600 hover:text-c2-neutral-800",
  },
  pill: {
    layout: "grid w-full grid-cols-4 gap-2",
    base: "w-full justify-center rounded-lg border py-2 text-xs md:text-sm",
    active: "border-c2-navy-600 bg-c2-navy-600 text-white",
    inactive: "border-c2-neutral-200 bg-white text-c2-neutral-600 hover:bg-c2-neutral-50",
  },
};


function TypeTabs({
  controller,
  appearance,
  className,
}: {
  controller: Controller;
  appearance: TabAppearance;
  className?: string;
}) {
  const styles = TAB_STYLES[appearance];

  return (
    <div className={cn(styles.layout, className)}>
      {SEARCH_TYPE_TABS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => controller.selectType(value)}
          className={cn(
            "flex shrink-0 items-center transition-colors cursor-pointer",
            styles.base,
            controller.activeType === value ? styles.active : styles.inactive
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SubmitButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      aria-label="البحث"
      className={cn("rounded-none h-full border border-c2-navy-700 bg-c2-navy-700 px-6 text-white", className)}
    >
      البحث
    </Button>
  );
}

/* -------------------------------------------------------------------------- */
/* Variants                                                                    */
/* -------------------------------------------------------------------------- */

/** Inside the mobile drawer: full-width field with the tabs stacked underneath. */
function MobileSearchBar({ controller }: { controller: Controller }) {
  return (
    <div className="flex w-full flex-col" dir="rtl">
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-c2-navy-300">
          <Search className="h-5 w-5" aria-hidden />
        </div>
        <SearchField
          controller={controller}
          className="w-full rounded-md border border-c2-neutral-200 py-2 pr-12 pl-24"
          clearButtonClassName="left-20 top-1/2 -translate-y-1/2"
        />
        <SubmitButton
          onClick={controller.submit}
          className="absolute left-0 top-0 rounded-l-md px-4"
        />
      </div>

      <TypeTabs controller={controller} appearance="pill" className="mt-4" />
    </div>
  );
}

/** Desktop navbar: one flat bar — field, text tabs, submit. */
function NavbarSearchBar({ controller }: { controller: Controller }) {
  return (
    <div
      className="flex h-12 w-full items-center rounded-md border border-c2-neutral-200 bg-white"
      dir="rtl"
    >
      <div className="relative flex h-full flex-1 items-center">
        <SearchField
          controller={controller}
          className="h-full flex-1 pr-4 pl-10 text-sm"
          clearButtonClassName="left-3"
        />
      </div>

      <div className="h-9 w-px bg-c2-neutral-200" />

      <TypeTabs controller={controller} appearance="plain" className="px-2" />

      <SubmitButton onClick={controller.submit} className="h-12 rounded-e-sm" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Entry point                                                                 */
/* -------------------------------------------------------------------------- */

function SearchBarInner({
  defaultType = DEFAULT_SEARCH_TYPE,
  variant = "navbar",
  onSearch,
}: SearchBarProps) {
  const controller = useSearchController(defaultType, onSearch);

  return variant === "mobile" ? (
    <MobileSearchBar controller={controller} />
  ) : (
    <NavbarSearchBar controller={controller} />
  );
}

export function SearchBar(props: SearchBarProps) {
  return (
    // `useSearchParams` needs a Suspense boundary to avoid opting the whole route
    // out of static rendering.
    <Suspense fallback={<div className="h-12 w-full animate-pulse rounded-md bg-c2-neutral-50" />}>
      <SearchBarInner {...props} />
    </Suspense>
  );
}
