"use client";

import { useMemo, useState, useEffect } from "react";
import { ChevronLeft, LayoutGrid } from "lucide-react";
import type { Category } from "@/src/features/(web)/searchAndFilter/api";
import { cn } from "@/src/lib/utils";
import {
    flattenCategoryTree,
    buildCategoryTree,
    getCategoryPathFromLeaf,
} from "@/src/features/(web)/search/utils/categoryTree";

export type MegaMenuSearchType = "products" | "services" | "stores" | "users";

function buildColumns(
    roots: Category[],
    childrenMap: Map<string, Category[]>,
    path: number[]
): Category[][] {
    const cols: Category[][] = [roots];
    for (let i = 0; i < path.length; i++) {
        const pid = path[i];
        const next = childrenMap.get(String(pid));
        if (next?.length) cols.push(next);
    }
    return cols;
}

export interface CategoryMegaMenuContentProps {
    categories: Category[];
    selectedId: number | undefined;
    onSelect: (id: number) => void;
    searchType: MegaMenuSearchType;
    /** داخل الهيدر: بدون إطار ثانٍ */
    embedded?: boolean;
    className?: string;
}

export default function CategoryMegaMenuContent({
    categories,
    selectedId,
    onSelect,
    searchType,
    embedded = false,
    className,
}: CategoryMegaMenuContentProps) {
    const flat = useMemo(() => flattenCategoryTree(categories), [categories]);
    const { parentCategories, childrenMap } = useMemo(
        () => buildCategoryTree(flat),
        [flat]
    );

    const [previewPath, setPreviewPath] = useState<number[]>([]);

    useEffect(() => {
        setPreviewPath(
            selectedId == null ? [] : getCategoryPathFromLeaf(flat, selectedId)
        );
    }, [flat, selectedId]);

    const columns = useMemo(
        () => buildColumns(parentCategories, childrenMap, previewPath),
        [parentCategories, childrenMap, previewPath]
    );

    const countFor = (c: Category) =>
        searchType === "services" ? c.services_count : c.products_count;

    const columnsBlock = (
        <div
            className={cn(
                "flex max-w-full flex-row flex-nowrap overflow-x-auto bg-white",
                "scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
            )}
        >
            {columns.map((col, colIndex) => (
                <div
                    key={`mega-col-${colIndex}`}
                    className={cn(
                        "flex min-w-[min(100%,220px)] max-w-[260px] shrink-0 flex-col",
                        "border-s border-gray-100 first:border-s-0",
                        "max-h-[min(380px,58vh)]"
                    )}
                >
                    <ul className="min-h-0 flex-1 overflow-y-auto py-1">
                        {col.map((cat) => {
                            const kids = childrenMap.get(cat.id.toString()) || [];
                            const hasChildren = kids.length > 0;
                            const isActive = previewPath[colIndex] === cat.id;
                            const isPrimaryColumn = colIndex === 0;

                            return (
                                <li key={cat.id} className="px-1.5">
                                    <button
                                        type="button"
                                        onMouseEnter={() => {
                                            setPreviewPath((p) => [
                                                ...p.slice(0, colIndex),
                                                cat.id,
                                            ]);
                                        }}
                                        onFocus={() => {
                                            setPreviewPath((p) => [
                                                ...p.slice(0, colIndex),
                                                cat.id,
                                            ]);
                                        }}
                                        onClick={() => onSelect(cat.id)}
                                        className={cn(
                                            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-right transition-colors cursor-pointer",
                                            isActive
                                                ? "bg-[#3D5E83]/12 text-[#3D5E83] font-medium"
                                                : "text-gray-800 hover:bg-gray-50"
                                        )}
                                    >
                                        {isPrimaryColumn ? (
                                            <>
                                                {cat.image && String(cat.image).trim() !== "" ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={cat.image}
                                                        alt=""
                                                        className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-gray-100"
                                                    />
                                                ) : (
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                                                        <LayoutGrid className="h-4 w-4" />
                                                    </div>
                                                )}
                                                <span className="min-w-0 flex-1 text-[13px] leading-snug">
                                                    {cat.name}
                                                    <span className="mr-1 text-[11px] font-normal text-gray-400">
                                                        ({countFor(cat)})
                                                    </span>
                                                </span>
                                                {hasChildren ? (
                                                    <ChevronLeft className="h-4 w-4 shrink-0 text-gray-400" />
                                                ) : null}
                                            </>
                                        ) : (
                                            <span className="w-full text-[13px] leading-snug font-normal">
                                                {cat.name}
                                                <span className="mr-1 text-[11px] text-gray-400">
                                                    ({countFor(cat)})
                                                </span>
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );

    if (categories.length === 0) {
        return (
            <div
                className={cn(
                    "rounded-xl border border-gray-100 bg-white px-4 py-8 text-center",
                    className
                )}
                dir="rtl"
            >
                <p className="text-sm text-gray-500">جاري تحميل الفئات…</p>
            </div>
        );
    }

    if (embedded) {
        return (
            <div className={cn("overflow-hidden", className)} dir="rtl">
                {columnsBlock}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm",
                className
            )}
            dir="rtl"
        >
            {columnsBlock}
        </div>
    );
}
