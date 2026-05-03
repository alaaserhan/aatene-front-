"use client";

import { useMemo, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import type { Category } from "@/src/features/(web)/searchAndFilter/api";
import { cn } from "@/src/lib/utils";
import {
    flattenCategoryTree,
    buildCategoryTree,
    getCategoryPathFromLeaf,
} from "@/src/features/(web)/search/utils/categoryTree";

export type MegaMenuSearchType = "products" | "services" | "stores" | "users";

export type CategoryKind = "product" | "service";

export interface CategoryMegaMenuContentProps {
    productCategories: Category[];
    serviceCategories: Category[];
    selectedId: number | undefined;
    /** نوع الفئة المحددة في الرابط (لتمييز التظليل عند وجود تعارض محتمل للمعرفات) */
    selectedSearchType?: "products" | "services";
    onSelect: (id: number, searchType: "products" | "services") => void;
    embedded?: boolean;
    className?: string;
}

function countFor(cat: Category, kind: CategoryKind) {
    return kind === "service"
        ? cat.services_count ?? cat.products_count
        : cat.products_count;
}

export default function CategoryMegaMenuContent({
    productCategories,
    serviceCategories,
    selectedId,
    selectedSearchType,
    onSelect,
    embedded = false,
    className,
}: CategoryMegaMenuContentProps) {
    const flatP = useMemo(
        () => flattenCategoryTree(productCategories),
        [productCategories]
    );
    const flatS = useMemo(
        () => flattenCategoryTree(serviceCategories),
        [serviceCategories]
    );

    const treeP = useMemo(() => buildCategoryTree(flatP), [flatP]);
    const treeS = useMemo(() => buildCategoryTree(flatS), [flatS]);

    const [activeBranch, setActiveBranch] = useState<{
        kind: CategoryKind;
        parentId: number;
    } | null>(null);

    useEffect(() => {
        if (selectedId == null || !selectedSearchType) {
            setActiveBranch(null);
            return;
        }
        const flat = selectedSearchType === "products" ? flatP : flatS;
        const path = getCategoryPathFromLeaf(flat, selectedId);
        if (path.length >= 2) {
            const immediateParentId = path[path.length - 2];
            setActiveBranch({
                kind: selectedSearchType === "products" ? "product" : "service",
                parentId: immediateParentId,
            });
        } else {
            setActiveBranch(null);
        }
    }, [selectedId, selectedSearchType, flatP, flatS]);

    const panel2Items = useMemo(() => {
        if (!activeBranch) return [];
        const map =
            activeBranch.kind === "product"
                ? treeP.childrenMap
                : treeS.childrenMap;
        return map.get(String(activeBranch.parentId)) ?? [];
    }, [activeBranch, treeP.childrenMap, treeS.childrenMap]);

    const loading =
        productCategories.length === 0 && serviceCategories.length === 0;

    const renderParentRow = (cat: Category, kind: CategoryKind) => {
        const map = kind === "product" ? treeP.childrenMap : treeS.childrenMap;
        const kids = map.get(String(cat.id)) || [];
        const hasChildren = kids.length > 0;
        const st = kind === "product" ? "products" : "services";
        const isSelected =
            selectedId === cat.id &&
            selectedSearchType === st;
        const isHoverActive =
            activeBranch?.kind === kind && activeBranch.parentId === cat.id;

        return (
            <li key={`${kind}-${cat.id}`}>
                <button
                    type="button"
                    onMouseEnter={() => {
                        if (hasChildren) {
                            setActiveBranch({ kind, parentId: cat.id });
                        }
                    }}
                    onFocus={() => {
                        if (hasChildren) {
                            setActiveBranch({ kind, parentId: cat.id });
                        }
                    }}
                    onClick={() => onSelect(cat.id, st)}
                    className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-right transition-colors cursor-pointer",
                        isSelected || isHoverActive
                            ? "bg-gray-100 text-gray-900 font-medium"
                            : "text-gray-800 hover:bg-gray-50"
                    )}
                >
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
                            ({countFor(cat, kind)})
                        </span>
                    </span>
                    {hasChildren ? (
                        <ChevronLeft className="h-4 w-4 shrink-0 text-gray-400" />
                    ) : null}
                </button>
            </li>
        );
    };

    const primaryPanel = (
        <div
            className={cn(
                "flex min-w-0 flex-col border-gray-100 bg-white lg:min-w-[280px] lg:max-w-[320px] lg:border-e",
                "max-h-[min(420px,62vh)]"
            )}
        >
            <div className="shrink-0 border-b border-gray-100 px-4 py-3">
                <h2 className="text-base font-bold text-gray-900">
                    التصنيفات الرئيسية
                </h2>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <p className="px-2 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    المنتجات
                </p>
                <ul className="space-y-0.5">
                    {treeP.parentCategories.map((c) =>
                        renderParentRow(c, "product")
                    )}
                </ul>
                <p className="mb-1 mt-4 px-2 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    الخدمات
                </p>
                <ul className="space-y-0.5">
                    {treeS.parentCategories.map((c) =>
                        renderParentRow(c, "service")
                    )}
                </ul>
            </div>
        </div>
    );

    const secondaryPanel =
        activeBranch && panel2Items.length > 0 ? (
            <div
                className={cn(
                    "flex min-w-0 flex-col bg-white lg:min-w-[260px] lg:max-w-[300px]",
                    "max-h-[min(420px,62vh)]"
                )}
            >
                <div className="shrink-0 border-b border-gray-100 px-2 py-2">
                    <button
                        type="button"
                        onClick={() => setActiveBranch(null)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-[#3D5E83] transition-colors hover:bg-gray-50"
                    >
                        <ChevronRight className="h-4 w-4 shrink-0" />
                        <span>القائمة الرئيسية</span>
                    </button>
                </div>
                <ul className="min-h-0 flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {panel2Items.map((cat) => {
                        const st =
                            activeBranch.kind === "product"
                                ? "products"
                                : "services";
                        const isSelected =
                            selectedId === cat.id &&
                            selectedSearchType === st;
                        return (
                            <li key={`sub-${activeBranch.kind}-${cat.id}`}>
                                <button
                                    type="button"
                                    onClick={() => onSelect(cat.id, st)}
                                    className={cn(
                                        "flex w-full rounded-md px-3 py-2 text-right text-[13px] transition-colors cursor-pointer",
                                        isSelected
                                            ? "bg-gray-100 font-medium text-gray-900"
                                            : "text-gray-800 hover:bg-gray-50"
                                    )}
                                >
                                    {cat.name}
                                    <span className="mr-1 text-[11px] text-gray-400">
                                        (
                                        {countFor(cat, activeBranch.kind)}
                                        )
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        ) : null;

    const body = (
        <div
            className={cn(
                "flex max-w-5xl flex-col gap-0 lg:mx-auto lg:flex-row",
                embedded && "w-full"
            )}
            onMouseLeave={() => {
                if (selectedId != null && selectedSearchType) return;
                setActiveBranch(null);
            }}
        >
            {primaryPanel}
            {secondaryPanel}
        </div>
    );

    if (loading) {
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
            <div className={cn("overflow-hidden px-2 py-2 sm:px-4", className)} dir="rtl">
                {body}
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
            {body}
        </div>
    );
}
