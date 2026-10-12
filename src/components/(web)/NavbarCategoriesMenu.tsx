"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import { useLanguage } from "@/src/hooks/use-language";
import { cn } from "@/src/lib/utils";
import {
    useProductsSearchPage,
    useServicesSearchPage,
} from "@/src/features/(web)/search/hooks";
import CategoryMegaMenuContent from "@/src/features/(web)/search/components/CategoryMegaMenuContent";
import type { Category } from "@/src/features/(web)/search/api";
import { matchSearchRoute, searchHref } from "@/src/features/(web)/search/url";

interface NavbarCategoriesMenuProps {
    variant: "desktop" | "mobile";
}

/** Holds the trigger's space beside the logo while Suspense resolves. */
function CategoriesMenuPlaceholder({ variant }: { variant: "desktop" | "mobile" }) {
    if (variant === "mobile") {
        return (
            <span className="inline-flex h-8 min-w-[5rem] shrink-0 items-center" aria-hidden />
        );
    }
    return <span className="inline-flex h-8 min-w-[6.5rem] shrink-0 items-center" aria-hidden />;
}

const HOVER_CLOSE_MS = 240;

function NavbarCategoriesMenuInner({ variant }: NavbarCategoriesMenuProps) {
    const [open, setOpen] = useState(false);
    const [pinned, setPinned] = useState(false);
    const [mounted, setMounted] = useState(false);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

    /** Portal target; only read after mount so `document.body` exists. */
    const portalRoot =
        mounted &&
        typeof document !== "undefined" &&
        document.body instanceof HTMLElement
            ? document.body
            : null;

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

    const categoryIdRaw = searchParams.get("category_id");
    const categoryId =
        categoryIdRaw != null && categoryIdRaw !== ""
            ? parseInt(categoryIdRaw, 10)
            : undefined;
    const validCategoryId =
        categoryId != null && !Number.isNaN(categoryId) ? categoryId : undefined;

    const { data: productsPageData } = useProductsSearchPage(open);
    const { data: servicesPageData } = useServicesSearchPage(open);

    const productCategories: Category[] = productsPageData?.categories ?? [];
    const serviceCategories: Category[] = servicesPageData?.categories ?? [];

    // Highlight the browsed category only on the products/services listing it filters.
    const route = matchSearchRoute(pathname);
    const listingType =
        route?.isListing && (route.type === "products" || route.type === "services")
            ? route.type
            : undefined;
    const selectedForMenu = listingType ? validCategoryId : undefined;

    // Picking a category starts a fresh browse of that category, like a store's department menu.
    const navigateWithCategory = useCallback(
        (id: number, searchType: "products" | "services") => {
            router.push(searchHref(lang, searchType, { category_id: id }));
            setOpen(false);
        },
        [router, lang]
    );

    const menuPanel = (
        <CategoryMegaMenuContent
            productCategories={productCategories}
            serviceCategories={serviceCategories}
            selectedId={selectedForMenu}
            selectedSearchType={listingType}
            onSelect={navigateWithCategory}
            embedded
            layout={variant === "mobile" ? "mobile" : "desktop"}
        />
    );

    /** Desktop: just the columns under the trigger, not a full-width bar. */
    const desktopDropdown =
        open &&
        mounted &&
        variant === "desktop" && (
            <div
                className="absolute right-0 top-full z-[400] overflow-visible pt-2"
                dir="rtl"
                onMouseEnter={() => {
                    cancelClose();
                    setOpen(true);
                }}
                onMouseLeave={scheduleClose}
            >
                <div className="relative w-max max-w-[calc(100vw-2rem)] overflow-visible">
                    <div className="overflow-x-auto overscroll-x-contain [-ms-overflow-style:auto] [scrollbar-gutter:stable]">
                        <div className="relative inline-block min-w-min pt-0.5">{menuPanel}</div>
                    </div>
                </div>
            </div>
        );

    /** Mobile: a content-sized panel, not a strip covering the page. */
    const mobileOverlay =
        open &&
        mounted &&
        variant === "mobile" &&
        portalRoot
            ? createPortal(
                  <>
                      <button
                          type="button"
                          aria-label="إغلاق الفئات"
                          className="fixed inset-0 z-[390] bg-black/15 cursor-default border-0 p-0"
                          onClick={() => {
                              cancelClose();
                              setPinned(false);
                              setOpen(false);
                          }}
                      />
                      <div
                          className="fixed inset-x-3 top-[4.25rem] z-[400] max-h-[min(72vh,calc(100vh-5.5rem))] overflow-hidden rounded-xl bg-white shadow-xl"
                          dir="rtl"
                      >
                          <div className="max-h-[inherit] overflow-x-hidden overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
                              {menuPanel}
                          </div>
                      </div>
                  </>,
                  portalRoot
              )
            : null;

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
                "inline-flex items-center gap-2 shrink-0 border-0 bg-transparent p-0 shadow-none",
                "text-sm font-medium text-gray-800 cursor-pointer",
                "hover:text-[#3D5E83] transition-colors",
                open && "text-[#3D5E83]"
            )}
        >
            <Menu className="h-[18px] w-[18px] shrink-0 text-current" strokeWidth={2} aria-hidden />
            <span className="whitespace-nowrap">كل الفئات</span>
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
            aria-label="الفئات"
            className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-md bg-transparent px-1 py-1 text-gray-800 border-0 shadow-none",
                "hover:text-[#3D5E83] transition-colors cursor-pointer",
                open && "text-[#3D5E83]"
            )}
        >
            <span className="text-sm font-medium whitespace-nowrap">الفئات</span>
            <Plus
                className={cn("h-[18px] w-[18px] shrink-0 transition-transform", open && "rotate-45")}
                strokeWidth={2}
                aria-hidden
            />
        </button>
    );

    if (variant === "desktop") {
        return (
            <div className="relative inline-flex shrink-0 items-center overflow-visible">
                {triggerDesktop}
                {desktopDropdown}
            </div>
        );
    }

    return (
        <>
            {triggerMobile}
            {mobileOverlay}
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
