"use client";

import { Suspense, useMemo, useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { useLanguage } from "@/src/hooks/use-language";
import { cn } from "@/src/lib/utils";
import {
    useProductsSearchPage,
    useServicesSearchPage,
    useStoresSearchPage,
} from "@/src/features/(web)/search/hooks";
import CategoryMegaMenuContent, {
    type MegaMenuSearchType,
} from "@/src/features/(web)/search/components/CategoryMegaMenuContent";
import type { Category } from "@/src/features/(web)/searchAndFilter/api";

interface NavbarCategoriesMenuProps {
    variant: "desktop" | "mobile";
}

/** يحجز عرض الزر أثناء تعليق Suspense حتى لا يظهر فراغ أو قفزة بجانب الشعار */
function CategoriesMenuPlaceholder({ variant }: { variant: "desktop" | "mobile" }) {
    if (variant === "mobile") {
        return (
            <span
                className="inline-block h-9 w-9 shrink-0 rounded-xl bg-[#3D5E83]/8"
                aria-hidden
            />
        );
    }
    return (
        <span
            className="inline-flex h-9 w-[7.5rem] shrink-0 items-center rounded-xl bg-[#3D5E83]/8"
            aria-hidden
        />
    );
}

const HOVER_CLOSE_MS = 240;

function NavbarCategoriesMenuInner({ variant }: NavbarCategoriesMenuProps) {
    const [open, setOpen] = useState(false);
    const [pinned, setPinned] = useState(false);
    const [mounted, setMounted] = useState(false);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pinnedRef = useRef(false);
    const pathname = usePathname() || "";
    const searchParams = useSearchParams();
    const router = useRouter();
    const lang = useLanguage();

    const cancelClose = useCallback(() => {
        if (closeTimerRef.current != null) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    }, []);

    const scheduleClose = useCallback(() => {
        cancelClose();
        closeTimerRef.current = setTimeout(() => {
            setOpen(false);
            closeTimerRef.current = null;
        }, HOVER_CLOSE_MS);
    }, [cancelClose]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => () => cancelClose(), [cancelClose]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                cancelClose();
                setPinned(false);
                setOpen(false);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, cancelClose]);

    const isSearchPage = pathname.includes("/search");
    const urlType = (searchParams.get("type") || "products") as MegaMenuSearchType;
    const categoryIdRaw = searchParams.get("category_id");
    const categoryId =
        categoryIdRaw != null && categoryIdRaw !== ""
            ? parseInt(categoryIdRaw, 10)
            : undefined;
    const validCategoryId =
        categoryId != null && !Number.isNaN(categoryId) ? categoryId : undefined;

    const typeForCategories: MegaMenuSearchType =
        isSearchPage && urlType !== "users" ? urlType : "products";

    const { data: productsPageData } = useProductsSearchPage(
        typeForCategories === "products",
        isSearchPage ? validCategoryId : undefined
    );
    const { data: servicesPageData } = useServicesSearchPage(
        typeForCategories === "services",
        isSearchPage ? validCategoryId : undefined
    );
    const { data: storesPageData } = useStoresSearchPage(
        typeForCategories === "stores",
        isSearchPage ? validCategoryId : undefined
    );

    const categories: Category[] = useMemo(() => {
        switch (typeForCategories) {
            case "products":
                return productsPageData?.categories || [];
            case "services":
                return servicesPageData?.categories || [];
            case "stores":
                return storesPageData?.categories || [];
            default:
                return [];
        }
    }, [typeForCategories, productsPageData, servicesPageData, storesPageData]);

    const selectedForMenu = isSearchPage ? validCategoryId : undefined;

    const navigateWithCategory = useCallback(
        (id: number) => {
            if (isSearchPage) {
                const p = new URLSearchParams(searchParams.toString());
                p.set("category_id", String(id));
                p.set("page", "1");
                router.push(`${pathname}?${p.toString()}`, { scroll: false });
            } else {
                router.push(
                    `/${lang}/search?type=${typeForCategories}&category_id=${id}&page=1`
                );
            }
            setOpen(false);
        },
        [isSearchPage, searchParams, router, pathname, lang, typeForCategories]
    );

    if (isSearchPage && urlType === "users") return null;

    const overlay =
        open &&
        mounted &&
        createPortal(
            <>
                {variant === "mobile" && (
                    <button
                        type="button"
                        aria-label="إغلاق الفئات"
                        className="fixed inset-0 z-[200] bg-black/20 cursor-default border-0 p-0"
                        onClick={() => {
                            cancelClose();
                            setPinned(false);
                            setOpen(false);
                        }}
                    />
                )}
                <div
                    className={cn(
                        "fixed left-0 right-0 z-[205] overflow-hidden",
                        "rounded-b-2xl border-x border-b border-gray-200/80 bg-white",
                        "shadow-[0_18px_48px_-12px_rgba(15,23,42,0.25)]",
                        "top-[60px] min-[1100px]:top-[73px]",
                        "max-h-[min(80vh,calc(100dvh-56px))] min-[1100px]:max-h-[min(80vh,calc(100dvh-72px))]",
                        /* جسر بصري للهوفر بين الهيدر واللوحة */
                        variant === "desktop" && "-mt-1.5 pt-1.5"
                    )}
                    dir="rtl"
                    onMouseEnter={
                        variant === "desktop"
                            ? () => {
                                  cancelClose();
                                  setOpen(true);
                              }
                            : undefined
                    }
                    onMouseLeave={variant === "desktop" ? scheduleClose : undefined}
                >
                    <div className="w-full max-h-[inherit] overflow-y-auto py-1.5 sm:py-2">
                        <CategoryMegaMenuContent
                            categories={categories}
                            selectedId={selectedForMenu}
                            onSelect={navigateWithCategory}
                            searchType={typeForCategories}
                            embedded
                        />
                    </div>
                </div>
            </>,
            document.body
        );

    const triggerDesktop = (
        <button
            type="button"
            onMouseEnter={() => {
                cancelClose();
                setOpen(true);
            }}
            onMouseLeave={scheduleClose}
            onClick={() => {
                cancelClose();
                setPinned((wasPinned) => {
                    if (wasPinned) {
                        setOpen(false);
                        return false;
                    }
                    setOpen(true);
                    return true;
                });
            }}
            aria-expanded={open}
            aria-haspopup="true"
            aria-pressed={pinned}
            title={pinned ? "إلغاء التثبيت وإغلاق القائمة" : "تثبيت القائمة مفتوحة"}
            className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium",
                "text-[#3D5E83] bg-[#3D5E83]/6 hover:bg-[#3D5E83]/12 transition-colors cursor-pointer shrink-0",
                "border border-transparent",
                open && "bg-[#3D5E83]/14 ring-1 ring-[#3D5E83]/25",
                pinned && open && "ring-2 ring-[#3D5E83]/35"
            )}
        >
            <LayoutGrid className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            <span className="whitespace-nowrap">الفئات</span>
            <ChevronDown
                className={cn(
                    "h-4 w-4 shrink-0 opacity-70 transition-transform duration-200",
                    open && "rotate-180"
                )}
                aria-hidden
            />
        </button>
    );

    const triggerMobile = (
        <button
            type="button"
            onClick={() => {
                cancelClose();
                setOpen((v) => !v);
            }}
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label="تصفح الفئات"
            className={cn(
                "rounded-xl p-2 text-[#3D5E83] bg-[#3D5E83]/6 hover:bg-[#3D5E83]/12 transition-colors cursor-pointer",
                open && "bg-[#3D5E83]/14 ring-1 ring-[#3D5E83]/20"
            )}
        >
            <LayoutGrid className="h-5 w-5" />
        </button>
    );

    return (
        <>
            {variant === "desktop" ? triggerDesktop : triggerMobile}
            {overlay}
        </>
    );
}

export default function NavbarCategoriesMenu(props: NavbarCategoriesMenuProps) {
    return (
        <Suspense fallback={<CategoriesMenuPlaceholder variant={props.variant} />}>
            <NavbarCategoriesMenuInner {...props} />
        </Suspense>
    );
}
