"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu";
import { useScopedI18n } from "@/src/i18n/provider";

interface Category {
  id: number;
  name: string;
}

interface SearchBarProps {
  categories: Category[];
  isLoadingCategories: boolean;
  currentLocale: string;
}

export function SearchBar({ categories, isLoadingCategories, currentLocale }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useScopedI18n('navbar');

  const initialSearch = searchParams.get('search') || '';
  const initialCategoryId = searchParams.get('category_id');
  const initialCategory = categories.find(c => c.id.toString() === initialCategoryId);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<{ id: number | null; name: string }>({
    id: initialCategory ? initialCategory.id : null,
    name: initialCategory ? initialCategory.name : t('all_categories')
  });

  // Update state if URL params change externally
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    const catId = searchParams.get('category_id');
    const cat = categories.find(c => c.id.toString() === catId);
    setSelectedCategory({
        id: cat ? cat.id : null,
        name: cat ? cat.name : t('all_categories')
    });
  }, [searchParams, categories, t]);


  const handleSearch = (categoryId: number | null = selectedCategory.id) => {
    const params = new URLSearchParams(searchParams.toString()); // Preserve existing params
    const query = searchQuery.trim();

    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }

    if (categoryId !== null) {
      params.set('category_id', categoryId.toString());
    } else {
      params.delete('category_id');
    }

    const searchPath = `/${currentLocale}/products`;
    router.push(`${searchPath}?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategorySelect = (category: { id: number | null; name: string }) => {
    setSelectedCategory(category);
    // Trigger search immediately on category select
    handleSearch(category.id);
  };

   return (
    <div className="relative flex w-full">
      <Input
        type="text"
        className="h-10 rounded-r-none border-primary focus-visible:ring-primary rtl:rounded-l-none rtl:rounded-r-md"
        placeholder={t('search_placeholder')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex h-10 items-center gap-1 rounded-none border-l-0 border-r-0 border-primary px-3 text-sm text-muted-foreground rtl:border-l rtl:border-r-0"
            disabled={isLoadingCategories}
          >
            <span className="truncate max-w-[100px] md:max-w-[150px]">
              {isLoadingCategories ? t('loading') : selectedCategory.name}
            </span>
            <ChevronDown size={16} className="opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 max-h-60 overflow-y-auto">
          <DropdownMenuItem onSelect={() => handleCategorySelect({ id: null, name: t('all_categories') })}>
            {t('all_categories')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {categories.map((category) => (
            <DropdownMenuItem
              key={category.id}
              onSelect={() => handleCategorySelect({ id: category.id, name: category.name })}
            >
              {category.name}
            </DropdownMenuItem>
          ))}
          {categories.length === 0 && !isLoadingCategories && (
             <DropdownMenuItem disabled>{t('no_categories')}</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        className="h-10 rounded-l-md rounded-r-none gradient-blue rtl:rounded-l-none rtl:rounded-r-md"
        aria-label={t('search_button')}
        onClick={() => handleSearch()}
      >
        <Search size={18} />
      </Button>
    </div>
  );
}