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

export type CategoryKind = "product" | "service";

export interface CategoryMegaMenuContentProps {
    productCategories: Category[];
    serviceCategories: Category[];
    selectedId: number | undefined;
    selectedSearchType?: "products" | "services";
    onSelect: (id: number, searchType: "products" | "services") => void;
    embedded?: boolean;
    /** عمود أوضح على الشاشات الصغيرة + عرض يمنع القص */
    layout?: "desktop" | "mobile";
    className?: string;
}

function countFor(cat: Category, kind: CategoryKind) {
    return kind === "service"
        ? cat.services_count ?? cat.products_count
        : cat.products_count;
}

/** أعمدة الفروع: لكل عنصر في المسار، عمود بأبنائه */
function buildBranchColumns(
    path: number[],
    treeKind: CategoryKind,
    treeP: ReturnType<typeof buildCategoryTree>,
    treeS: ReturnType<typeof buildCategoryTree>
): Category[][] {
    const { childrenMap } = treeKind === "product" ? treeP : treeS;
    const cols: Category[][] = [];
    for (let i = 0; i < path.length; i++) {
        const next = childrenMap.get(String(path[i]));
        if (next?.length) cols.push(next);
    }
    return cols;
}

export default function CategoryMegaMenuContent({
    productCategories,
    serviceCategories,
    selectedId,
    selectedSearchType,
    onSelect,
    embedded = false,
    layout = "desktop",
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

    const [previewPath, setPreviewPath] = useState<number[]>([]);
    const [pathTree, setPathTree] = useState<CategoryKind>("product");

    useEffect(() => {
        if (selectedId == null || !selectedSearchType) {
            setPreviewPath([]);
            return;
        }
        const flat = selectedSearchType === "products" ? flatP : flatS;
        setPreviewPath(getCategoryPathFromLeaf(flat, selectedId));
        setPathTree(selectedSearchType === "products" ? "product" : "service");
    }, [selectedId, selectedSearchType, flatP, flatS]);

    const branchColumns = useMemo(
        () =>
            previewPath.length > 0
                ? buildBranchColumns(previewPath, pathTree, treeP, treeS)
                : [],
        [previewPath, pathTree, treeP, treeS]
    );

    const childrenMap =
        pathTree === "product" ? treeP.childrenMap : treeS.childrenMap;

    const loading =
        productCategories.length === 0 && serviceCategories.length === 0;

    const setPathAtColumn = (colIndex: number, catId: number) => {
        setPreviewPath((p) => [...p.slice(0, colIndex), catId]);
    };

    const renderRootRow = (cat: Category, kind: CategoryKind) => {
        const map = kind === "product" ? treeP.childrenMap : treeS.childrenMap;
        const kids = map.get(String(cat.id)) || [];
        const hasChildren = kids.length > 0;
        const st = kind === "product" ? "products" : "services";
        const isActive = previewPath[0] === cat.id && pathTree === kind;

        return (
            <li key={`${kind}-${cat.id}`}>
                <button
                    type="button"
                    onMouseEnter={() => {
                        setPathTree(kind);
                        setPathAtColumn(0, cat.id);
                    }}
                    onFocus={() => {
                        setPathTree(kind);
                        setPathAtColumn(0, cat.id);
                    }}
                    onClick={() => onSelect(cat.id, st)}
                    className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-right transition-colors cursor-pointer",
                        isActive
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

    const columnShell =
        "rounded-md border border-gray-200/90 bg-white shadow-sm";

    const isMobileLayout = layout === "mobile";

    const columnsBlock = (
        <div
            className={cn(
                "flex min-w-0 flex-row flex-nowrap gap-2 bg-transparent px-0.5 py-0.5",
                isMobileLayout ? "w-max max-w-full" : "w-max"
            )}
        >
            {/* العمود 0 — التصنيفات الرئيسية (منتجات + خدمات) */}
            <div
                className={cn(
                    "flex shrink-0 flex-col overflow-hidden",
                    isMobileLayout
                        ? "w-[min(270px,calc(100vw-2rem))] min-w-[200px] max-w-[270px]"
                        : "min-w-[240px] max-w-[270px]",
                    columnShell,
                    isMobileLayout
                        ? "max-h-[min(360px,50dvh)]"
                        : "max-h-[min(400px,58vh)]"
                )}
            >
                <div className="shrink-0 border-b border-gray-100 px-3 py-2.5">
                    <h2 className="text-sm font-bold text-gray-900">
                        التصنيفات الرئيسية
                    </h2>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto py-1">
                    <p className="px-3 pb-1 pt-2 text-[11px] font-semibold text-gray-500">
                        المنتجات
                    </p>
                    <ul className="space-y-0.5 px-1.5">
                        {treeP.parentCategories.map((c) =>
                            renderRootRow(c, "product")
                        )}
                    </ul>
                    <p className="mb-1 mt-3 px-3 pt-2 text-[11px] font-semibold text-gray-500">
                        الخدمات
                    </p>
                    <ul className="space-y-0.5 px-1.5">
                        {treeS.parentCategories.map((c) =>
                            renderRootRow(c, "service")
                        )}
                    </ul>
                </div>
            </div>

            {/* الأعمدة التالية: كل عمود = أبناء مستوى في المسار */}
            {branchColumns.map((col, subIdx) => {
                const colIndex = subIdx + 1;
                const st = pathTree === "product" ? "products" : "services";
                return (
                    <div
                        key={`branch-${subIdx}-${previewPath[subIdx] ?? subIdx}`}
                        className={cn(
                            "flex shrink-0 flex-col overflow-hidden",
                            isMobileLayout
                                ? "w-[min(260px,calc(100vw-2.25rem))] min-w-[180px] max-w-[260px]"
                                : "min-w-[220px] max-w-[260px]",
                            columnShell,
                            isMobileLayout
                                ? "max-h-[min(360px,50dvh)]"
                                : "max-h-[min(400px,58vh)]"
                        )}
                    >
                        <ul className="min-h-0 flex-1 overflow-y-auto py-1">
                            {col.map((cat) => {
                                const kids =
                                    childrenMap.get(String(cat.id)) || [];
                                const hasChildren = kids.length > 0;
                                const isActive =
                                    previewPath[colIndex] === cat.id;
                                return (
                                    <li key={`${pathTree}-${cat.id}-${subIdx}`}>
                                        <button
                                            type="button"
                                            onMouseEnter={() =>
                                                setPathAtColumn(colIndex, cat.id)
                                            }
                                            onFocus={() =>
                                                setPathAtColumn(colIndex, cat.id)
                                            }
                                            onClick={() => onSelect(cat.id, st)}
                                            className={cn(
                                                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-right text-[13px] transition-colors cursor-pointer",
                                                isActive
                                                    ? "bg-gray-100 font-medium text-gray-900"
                                                    : "text-gray-800 hover:bg-gray-50"
                                            )}
                                        >
                                            <span className="min-w-0 flex-1 leading-snug">
                                                {cat.name}
                                                <span className="mr-1 text-[11px] font-normal text-gray-400">
                                                    (
                                                    {countFor(cat, pathTree)}
                                                    )
                                                </span>
                                            </span>
                                            {hasChildren ? (
                                                <ChevronLeft className="h-4 w-4 shrink-0 text-gray-400" />
                                            ) : null}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                );
            })}
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
            <div
                className={cn(
                    "min-w-0 overflow-visible",
                    isMobileLayout && "w-max max-w-full",
                    className
                )}
                dir="rtl"
            >
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
