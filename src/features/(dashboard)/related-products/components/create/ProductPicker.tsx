// src/features/(dashboard)/related-products/components/create/ProductPicker.tsx
"use client";

import { useMemo, useState } from "react";
import { Check, ImageOff, Loader2, Search, Tag } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { VideoOrImage } from "@/src/components/ui/VideoOrImage";
import { useDebounce } from "@/src/hooks/use-debounce";
import { formatPrice } from "@/src/lib/format-price";
import { cn } from "@/src/lib/utils";
import { useInfiniteGetProducts } from "../../../products/hooks";
import type { Product } from "../../../products/api";
import type { CrossSellItem } from "../../types";

const PER_PAGE = 10;

interface ProductPickerProps {
    /** "single" keeps one product selected at a time, "multi" toggles a set. */
    mode: "single" | "multi";
    selected: CrossSellItem[];
    onChange: (products: CrossSellItem[]) => void;
    /** Products to hide — the main product must not be its own cross-sell. */
    excludeIds?: number[];
}

const toCrossSellItem = (product: Product): CrossSellItem => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: product.price ?? 0,
    cover_url: product.cover_url,
    category_name: product.category?.name || product.category_name || "",
});

export function ProductPicker({ mode, selected, onChange, excludeIds = [] }: ProductPickerProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 400);

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("per_page", String(PER_PAGE));
        if (debouncedSearch) params.set("name", debouncedSearch);
        return params;
    }, [debouncedSearch]);

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteGetProducts(queryParams);

    const products = (data?.pages?.flatMap((page) => page.data) || []).filter(
        (product) => !excludeIds.includes(product.id)
    );

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const handleToggle = (product: Product) => {
        const item = toCrossSellItem(product);

        if (mode === "single") {
            onChange(selected[0]?.id === item.id ? [] : [item]);
            return;
        }

        onChange(
            selected.some((current) => current.id === item.id)
                ? selected.filter((current) => current.id !== item.id)
                : [...selected, item]
        );
    };

    return (
        <div className="flex h-full flex-col">
            <div className="relative shrink-0">
                <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-c2-neutral-500" />
                <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="ابحث عن منتج..."
                    className="h-11 border-c2-neutral-200 bg-white pe-10 shadow-none focus-visible:ring-0"
                />
            </div>

            <div className="-mx-1 mt-3 flex-1 overflow-y-auto px-1 custom-scrollbar" onScroll={handleScroll}>
                {isLoading ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                        <Loader2 className="size-8 animate-spin text-c2-primary" />
                        <p className="text-sm text-c2-slate-600">جاري تحميل المنتجات...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3">
                        <div className="flex size-16 items-center justify-center rounded-full bg-c2-neutral-50">
                            <Search className="size-7 text-c2-neutral-500" />
                        </div>
                        <p className="text-sm text-c2-slate-600">لا توجد منتجات مطابقة</p>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {products.map((product) => {
                            const isSelected = selected.some((current) => current.id === product.id);

                            return (
                                <button
                                    type="button"
                                    key={product.id}
                                    onClick={() => handleToggle(product)}
                                    className={cn(
                                        "flex w-full items-center justify-between gap-3 rounded-lg border p-2.5 text-start transition-colors",
                                        isSelected
                                            ? "border-c2-navy-500 bg-c2-navy-700-a08"
                                            : "border-transparent bg-white hover:bg-c2-neutral-50"
                                    )}
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span
                                            className={cn(
                                                "flex size-4 shrink-0 items-center justify-center border bg-white",
                                                mode === "single" ? "rounded-full" : "rounded-xs",
                                                isSelected ? "border-c2-navy-500" : "border-c2-neutral-200"
                                            )}
                                        >
                                            {isSelected &&
                                                (mode === "single" ? (
                                                    <span className="size-2 rounded-full bg-c2-navy-500" />
                                                ) : (
                                                    <Check className="size-3.5 text-c2-navy-500" />
                                                ))}
                                        </span>

                                        <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-c2-neutral-50">
                                            {product.cover_url ? (
                                                <VideoOrImage
                                                    src={product.cover_url}
                                                    alt={product.name}
                                                    fill
                                                    thumb
                                                />
                                            ) : (
                                                <span className="flex h-full items-center justify-center">
                                                    <ImageOff className="size-4 text-c2-neutral-500" />
                                                </span>
                                            )}
                                        </span>

                                        <span className="flex min-w-0 flex-col gap-1">
                                            <span
                                                className={cn(
                                                    "line-clamp-1 text-sm font-bold",
                                                    isSelected ? "text-c2-primary" : "text-c2-neutral-800"
                                                )}
                                            >
                                                {product.name}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-c2-slate-600">
                                                <Tag className="size-3" />
                                                {product.category?.name || product.category_name || "عام"}
                                            </span>
                                        </span>
                                    </div>

                                    <span className="shrink-0 text-sm font-bold text-c2-neutral-800">
                                        {formatPrice(product.price)} ₪
                                    </span>
                                </button>
                            );
                        })}

                        {isFetchingNextPage && (
                            <div className="flex justify-center py-4">
                                <Loader2 className="size-6 animate-spin text-c2-primary" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
