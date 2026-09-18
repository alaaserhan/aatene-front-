// src/features/(dashboard)/keywords/components/KeywordsPage.tsx
"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { SearchKeywordsPanel } from "@/src/features/(dashboard)/search-keywords/components/SearchKeywordsPanel";
import { useDebounce } from "@/src/hooks/use-debounce";
import { KeywordType } from "../api";
import { DEFAULT_KEYWORD_TYPE, KEYWORD_TYPES, getKeywordTypeLabel } from "../constants";
import { KeywordsPanel } from "./KeywordsPanel";

/** The two datasets on this screen: what visitors searched for, and the curated tags. */
type KeywordsSection = "search" | "tags";

const SECTIONS: { value: KeywordsSection; label: string; description: string }[] = [
  {
    value: "search",
    label: "كلمات البحث",
    description: "عرض الكلمات التي يبحث عنها المستخدمون وإضافتها للكلمات المفتاحية",
  },
  {
    value: "tags",
    label: "الكلمات المفتاحية",
    description: "إدارة الكلمات المفتاحية المستخدمة في المنتجات والخدمات والمتاجر",
  },
];

const SEARCH_PLACEHOLDERS: Record<KeywordsSection, string> = {
  search: "ابحث عن كلمة بحث...",
  tags: "ابحث عن كلمة مفتاحية...",
};

export function KeywordsPage() {
  const [activeSection, setActiveSection] = useState<KeywordsSection>("search");
  const [activeType, setActiveType] = useState<KeywordType>(DEFAULT_KEYWORD_TYPE);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearch = useDebounce(searchQuery.trim(), 400);
  const typeLabel = getKeywordTypeLabel(activeType);
  const section = SECTIONS.find((item) => item.value === activeSection) ?? SECTIONS[0];

  // The two panels query different endpoints, so a term typed for one is
  // meaningless in the other
  const handleSectionChange = (next: KeywordsSection) => {
    if (next === activeSection) return;
    setActiveSection(next);
    setSearchQuery("");
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col pb-10">
      {/*
        Full-bleed: the negative inline margin cancels the dashboard layout's
        centered `max-w-350` container so the white bar and its rule reach both
        viewport edges. The inner div re-applies that container so the tabs stay
        aligned with the cards below. Safe against a horizontal scrollbar —
        globals.css clips the body's x overflow.
      */}
      <div className="mx-[calc(50%-50vw)] border-b border-c2-neutral-200 bg-white pt-4">
        <div className="mx-auto w-full max-w-350 px-3 sm:px-4">
          <Tabs
            variant="underline"
            value={activeSection}
            onValueChange={(next) => handleSectionChange(next as KeywordsSection)}
          >
            <TabsList className="border-b-0">
              {SECTIONS.map((item) => (
                <TabsTrigger key={item.value} value={item.value}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <header className="mt-6">
        <div className="heading-card">
          <h1 className="heading-1">{section.label}</h1>
          <p className="mt-1 text-sm text-c2-neutral-500">{section.description}</p>
        </div>
      </header>

      <Tabs
        value={activeType}
        onValueChange={(next) => setActiveType(next as KeywordType)}
        className="mt-6"
      >
        <TabsList className="w-full max-w-full overflow-x-auto">
          {KEYWORD_TYPES.map((type) => (
            <TabsTrigger key={type.value} value={type.value} className="py-2.5">
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="my-6">
        <div className="relative max-w-full rounded-lg border border-c2-neutral-200 bg-white">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-c2-neutral-500" />
          <Input
            placeholder={SEARCH_PLACEHOLDERS[activeSection]}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-12 border-none pr-10 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      {activeSection === "search" ? (
        <SearchKeywordsPanel type={activeType} search={debouncedSearch} typeLabel={typeLabel} />
      ) : (
        <KeywordsPanel type={activeType} search={debouncedSearch} typeLabel={typeLabel} />
      )}
    </div>
  );
}
