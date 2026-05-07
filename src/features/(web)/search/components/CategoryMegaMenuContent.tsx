"use client";

import { useMemo, useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, LayoutGrid } from "lucide-react";
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
    const [expandedMobile, setExpandedMobile] = useState<Set<number>>(new Set());

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

    const toggleMobileExpand = (categoryId: number) => {
        setExpandedMobile((prev) => {
            const next = new Set(prev);
            if (next.has(categoryId)) next.delete(categoryId);
            else next.add(categoryId);
            return next;
        });
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

    const renderMobileNode = (
        cat: Category,
        kind: CategoryKind,
        depth: number
    ) => {
        const map = kind === "product" ? treeP.childrenMap : treeS.childrenMap;
        const children = map.get(String(cat.id)) || [];
        const hasChildren = children.length > 0;
        const isExpanded = expandedMobile.has(cat.id);
        const isActive = selectedId === cat.id && selectedSearchType === (kind === "product" ? "products" : "services");
        const st = kind === "product" ? "products" : "services";

        return (
            <div key={`${kind}-mobile-${cat.id}`}>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onSelect(cat.id, st)}
                        className={cn(
                            "flex flex-1 items-center gap-2 text-right rounded-md px-2 py-2 text-[13px] transition-colors cursor-pointer hover:bg-gray-100 active:bg-gray-100",
                            isActive
                                ? "text-gray-900 font-bold"
                                : isExpanded
                                    ? "text-[#3D5E83] font-bold"
                                    : "text-gray-800"
                        )}
                        style={{ paddingRight: `${8 + depth * 14}px` }}
                    >
                        {depth === 0 ? (
                            cat.image && String(cat.image).trim() !== "" ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={cat.image}
                                    alt=""
                                    className="h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-gray-100"
                                />
                            ) : (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                                    <LayoutGrid className="h-4 w-4" />
                                </div>
                            )
                        ) : null}

                        <span className="min-w-0 flex-1 leading-snug">
                            {cat.name}
                            <span className="mr-1 text-[11px] font-normal text-gray-400">
                                ({countFor(cat, kind)})
                            </span>
                        </span>

                    </button>
                    {hasChildren ? (
                        <button
                            type="button"
                            onClick={() => toggleMobileExpand(cat.id)}
                            className="shrink-0 p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                            aria-label="توسيع التصنيف"
                        >
                            <ChevronDown
                                className={cn(
                                    "h-4 w-4 transition-transform",
                                    isExpanded && "rotate-180"
                                )}
                            />
                        </button>
                    ) : null}
                </div>
                {hasChildren && isExpanded ? (
                    <div className="mt-0.5 space-y-0.5">
                        {children.map((child) => renderMobileNode(child, kind, depth + 1))}
                    </div>
                ) : null}
            </div>
        );
    };

    const columnsBlock = (
        <div
            className={cn(
                "flex min-w-0 gap-2 bg-transparent px-0.5 py-0.5",
                isMobileLayout
                    ? "w-full max-w-full flex-col"
                    : "w-max flex-row flex-nowrap"
            )}
        >
            {/* Mobile: single-column list */}
            {isMobileLayout ? (
                <div className="w-full min-w-0 max-w-full max-h-[min(72vh,60vh)] overflow-y-auto">
                    <div className="shrink-0 border-b border-gray-100 px-3 py-2.5">
                        <h2 className="text-sm font-bold text-gray-900">كل الفئات</h2>
                    </div>
                    <div className="px-1.5 py-2">
                        <p className="px-1 pb-1 pt-1 text-[11px] font-semibold text-gray-500">
                            المنتجات
                        </p>
                        <div className="space-y-0.5">
                            {treeP.parentCategories.map((c) => renderMobileNode(c, "product", 0))}
                        </div>

                        <p className="mb-1 mt-3 px-1 pt-2 text-[11px] font-semibold text-gray-500">
                            الخدمات
                        </p>
                        <div className="space-y-0.5">
                            {treeS.parentCategories.map((c) => renderMobileNode(c, "service", 0))}
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Desktop: multi-column mega menu */}
            {!isMobileLayout ? (
            <>
            <div
                className={cn(
                    "flex shrink-0 flex-col overflow-hidden",
                    "min-w-[240px] max-w-[270px]",
                    columnShell,
                    "max-h-[min(400px,58vh)]"
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
                            "min-w-[220px] max-w-[260px]",
                            columnShell,
                            "max-h-[min(400px,58vh)]"
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
            </>
            ) : null}
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
                    isMobileLayout && "w-full max-w-full",
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
