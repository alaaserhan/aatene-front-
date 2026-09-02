"use client";

import { useState } from "react";
import Image from "next/image";
import { StoreProfile, StorePageData } from "../api";
import { cn, sanitizeMediaUrl } from "@/src/lib/utils";
import { SafeHTML } from "@/src/components/ui/SafeHTML";
import { formatPrice } from "@/src/lib/format-price";
import {
    Star,
    MessageSquare,
    Flag,
    Facebook,
    Instagram,
    Youtube,
    User,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";
import { useAddStoreReview, useGetStoreReviews, useGetStoreReviewReplies } from "../hooks";
import { ReviewItem, ReviewsSection, type ReviewSubmitPayload, type SharedReview } from "@/src/components/(web)/reviews";
import { MediaViewer } from "@/src/components/ui/MediaViewer";
import { ReviewStatisticsDisplay } from "@/src/features/(web)/product/components/ReviewStatisticsDisplay";
import { ReviewStatistics, ProductInPageData } from "@/src/features/(web)/product/types";
import { ReportAbuse } from "@/src/features/(web)/reports/components/ReportAbuse";
import { Pagination } from "@/src/components/ui/Pagination";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import { Button } from "@/src/components/ui/button";
import { ChatNowButton } from "@/src/components/shared/ChatNowButton";

const TiktokIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

type TabKey = "overview" | "reviews" | "discounts" | "offers";

interface StoreTabsProps {
    store: StoreProfile;
    pageData?: StorePageData;
}

const WEEK_DAYS: { key: string; label: string }[] = [
    { key: "saturday", label: "السبت" },
    { key: "sunday", label: "الأحد" },
    { key: "monday", label: "الأثنين" },
    { key: "tuesday", label: "الثلاثاء" },
    { key: "wednesday", label: "الأربعاء" },
    { key: "thursday", label: "الخميس" },
    { key: "friday", label: "الجمعة" },
];

type WorkingPopupState =
    | "schedule_open"
    | "schedule_closed"
    | "open_without_hours"
    | "temporary_closed"
    | "closed";

function timeToMinutes(time?: string): number | null {
    if (!time) return null;
    const [h, m] = time.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
}

function formatTime(time: string) {
    if (!time) return "";
    const [hoursStr, minutesStr] = time.split(":");
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours || 12;
    const minutesDisplay = minutes > 0 ? `:${minutes.toString().padStart(2, "0")}` : ":00";
    return `${hours}${minutesDisplay}${ampm}`;
}

function resolveWorkingState(store: StoreProfile) {
    const openStatus = store.open_status;
    const todayIdx = new Date().getDay();
    const dayValue = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][todayIdx];
    const todayWorkingTime = store.workingtimes?.find((wt) => wt.day === dayValue);

    if (openStatus === "open_without_working_times") {
        return {
            popupState: "open_without_hours" as WorkingPopupState,
            label: "مفتوح",
            color: "text-green-600",
            sub: "بدون ساعات عمل محددة",
            isOpenNow: true,
            todayWorkingTime,
            dayValue,
        };
    }

    if (openStatus === "temporary_closed") {
        return {
            popupState: "temporary_closed" as WorkingPopupState,
            label: "مغلق مؤقتاً",
            color: "text-amber-600",
            sub: "",
            isOpenNow: false,
            todayWorkingTime,
            dayValue,
        };
    }

    if (openStatus === "closed") {
        return {
            popupState: "closed" as WorkingPopupState,
            label: "مغلق نهائياً",
            color: "text-red-600",
            sub: "",
            isOpenNow: false,
            todayWorkingTime,
            dayValue,
        };
    }

    // open_with_working_times
    let isOpenNow = false;
    let sub = "لا توجد ساعات متاحة لليوم";
    if (todayWorkingTime) {
        if (todayWorkingTime.open_always) {
            isOpenNow = true;
            sub = "مفتوح 24 ساعة";
        } else if (todayWorkingTime.closed_always) {
            isOpenNow = false;
            sub = "عطلة اليوم";
        } else {
            const fromMinutes = timeToMinutes(todayWorkingTime.from);
            const toMinutes = timeToMinutes(todayWorkingTime.to);
            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            if (fromMinutes !== null && toMinutes !== null) {
                isOpenNow = nowMinutes >= fromMinutes && nowMinutes <= toMinutes;
                sub = `${formatTime(todayWorkingTime.from)} - ${formatTime(todayWorkingTime.to)}`;
            }
        }
    }

    return {
        popupState: (isOpenNow ? "schedule_open" : "schedule_closed") as WorkingPopupState,
        label: isOpenNow ? "مفتوح الآن" : "مغلق الآن",
        color: isOpenNow ? "text-green-600" : "text-red-500",
        sub,
        isOpenNow,
        todayWorkingTime,
        dayValue,
    };
}

export default function StoreTabs({ store, pageData }: StoreTabsProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("overview");

    const tabs: { key: TabKey; label: string }[] = [
        { key: "overview", label: "نظره عامة" },
        { key: "reviews", label: "تقييمات المتجر" },
        { key: "discounts", label: "عروض" },
        { key: "offers", label: "تخفيضات" },
    ];

    const offersProducts = pageData?.offers || [];
    const couponsProducts = pageData?.coupons?.flatMap(c => c.products) || [];

    return (
        <div className="mt-6 overflow-hidden bg-white rounded-lg border border-gray-100 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.1)]">
            <div className="flex items-center border-b border-gray-200 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-4 cursor-pointer text-center font-medium text-sm transition-all duration-300 relative whitespace-nowrap px-4 ${activeTab === tab.key
                            ? "text-blue-3 bg-[#F8F7FF]"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.key && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-4" />
                        )}
                    </button>
                ))}
            </div>

            <div className="p-4 md:p-7 min-h-[300px]">
                {activeTab === "overview" && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <OverviewTab store={store} />
                    </div>
                )}
                {activeTab === "reviews" && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <StoreReviewsSection
                            slug={store.slug}
                            summary={{ count: Number(store.review_count) || 0, rate: Number(store.review_rate) || 0 }}
                        />
                    </div>
                )}
                {activeTab === "discounts" && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300" dir="rtl">
                        <OffersGrid storeId={store.id} products={offersProducts} emptyMessage="لا توجد عروض حالياً" perPage={3} enablePagination />
                    </div>
                )}
                {activeTab === "offers" && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300" dir="rtl">
                        <OffersGrid storeId={store.id} products={couponsProducts} emptyMessage="لا توجد تخفيضات حالياً" useProductCard />
                    </div>
                )}
            </div>
        </div>
    );
}

function OffersGrid({
    storeId,
    products,
    emptyMessage,
    useProductCard,
    perPage,
    enablePagination
}: {
    storeId: number;
    products: ProductInPageData[];
    emptyMessage: string;
    useProductCard?: boolean;
    perPage?: number;
    enablePagination?: boolean;
}) {
    const [page, setPage] = useState(1);
    const PER_PAGE = perPage ?? (useProductCard ? 8 : 5);
    const totalPages = Math.ceil(products.length / PER_PAGE);
    const displayedProducts = enablePagination ? products.slice((page - 1) * PER_PAGE, page * PER_PAGE) : products;

    if (products.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {useProductCard ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {displayedProducts.map(p => (
                        <ProductCard
                            key={p.id}
                            id={p.id}
                            name={p.name}
                            slug={p.slug}
                            cover={p.cover || ""}
                            price={p.price}
                            priceAfterDiscount={p.price_after_discount}
                            discountPercent={p.discount_present}
                            reviewRate={p.review_rate}
                            reviewCount={p.review_count}
                            isFavorite={p.is_favorite}
                            type="product"
                            storeId={storeId}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col">
                    {displayedProducts.map((p, idx) => (
                        <div key={p.id}>
                            <OfferCard product={p} />
                            {idx < displayedProducts.length - 1 && (
                                <hr className="border-t border-gray-200 my-6" />
                            )}
                        </div>
                    ))}
                </div>
            )}
            {enablePagination && totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
}

function OfferCard({ product }: { product: ProductInPageData }) {
    const crossSellProducts = product.crossSells || [];
    const hasCrossSells = crossSellProducts.length > 0;
    const imageUrl = sanitizeMediaUrl(product.cross_sells_image_url || product.cover) || "/images/placeholders/product-placeholder.webp";
    const [mainImageError, setMainImageError] = useState(false);
    const name = product.cross_sells_name || product.name || "اسم العرض";
    const desc = product.cross_sells_description || product.short_description || product.name || "";

    const fallbackMainPrice = product.price_after_discount || product.price;
    const fallbackOldPrice = product.price_after_discount && parseFloat(product.price) > parseFloat(product.price_after_discount)
        ? product.price
        : (product.discount_present > 0 ? product.price : null);

    const mainPrice = product.cross_sells_original_price || fallbackMainPrice;
    const oldPrice = product.cross_sells_price || fallbackOldPrice;

    // Pagination for cross-sell products (max 3 per page)
    const PAGE_SIZE = 3;
    const totalPages = Math.ceil(crossSellProducts.length / PAGE_SIZE);
    const [page, setPage] = useState(0);
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
    const visibleProducts = crossSellProducts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const originalTotal = hasCrossSells
        ? crossSellProducts.reduce((sum, p) => sum + parseFloat(p.price || "0"), 0)
        : null;
    const savings = originalTotal !== null ? originalTotal - parseFloat(mainPrice) : null;

    return (
        <div className="group">

            {(name || desc) && (
                <Link href={`/product/${product.slug}`} className="block">
                    <div className="pb-3 text-center" dir="rtl">
                        <h3 className="font-semibold text-gray-800 text-base group-hover:text-blue-3 transition-colors line-clamp-1">
                            {name}
                        </h3>
                        {desc && desc !== name && (
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{desc}</p>
                        )}
                    </div>
                </Link>
            )}


            <div className="py-4">
                {hasCrossSells ? (
                    <div className="flex flex-col items-center gap-2">

                        {/* صف واحد: سهم يمين + منتجات + سهم يسار + = + السعر */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-1.5 md:gap-3 w-full justify-center py-1">
                            <div className="flex items-center gap-1.5 sm:gap-1.5 md:gap-3 justify-center overflow-x-auto no-scrollbar">

                            {totalPages > 1 && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages - 1, p + 1)); }}
                                    disabled={page === totalPages - 1}
                                    className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 cursor-pointer rounded-full bg-blue-3 flex items-center justify-center hover:bg-blue-4 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
                                    aria-label="التالي"
                                >
                                    <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                                </button>
                            )}

                            {/* المنتجات */}
                            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-4 shrink-0">
                                {visibleProducts.map((item, index) => (
                                    <div key={item.id} className="flex items-center gap-1 sm:gap-1.5 md:gap-4">
                                        <Link href={`/product/${item.slug}`} className="flex flex-col items-center gap-0.5 sm:gap-1.5 w-[110px] sm:w-[110px] md:w-[180px] shrink-0 group/item">
                                            <div className="mb-1 w-full aspect-square rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                                                <Image
                                                    src={!item.cover || failedImages.has(item.id) ? "/images/placeholders/product-placeholder.webp" : item.cover}
                                                    alt={item.name}
                                                    width={180}
                                                    height={180}
                                                    className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                                                    onError={() => setFailedImages(prev => new Set(prev).add(item.id))}
                                                />
                                            </div>
                                            <p className="text-xs sm:text-[11px] md:text-sm text-gray-700 text-center line-clamp-2 font-medium leading-tight group-hover/item:text-blue-3 transition-colors">
                                                {item.name}
                                            </p>
                                        </Link>
                                        {index < visibleProducts.length - 1 && (
                                            <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-400 shrink-0">+</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* سهم يسار قبل = */}
                            {totalPages > 1 && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(0, p - 1)); }}
                                    disabled={page === 0}
                                    className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 cursor-pointer rounded-full bg-blue-3 flex items-center justify-center hover:bg-blue-4 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
                                    aria-label="السابق"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                                </button>
                            )}
                            </div>

                            {/* = والسعر */}
                            <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
                                <span className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-400 shrink-0">=</span>
                                <div className="flex flex-col items-center gap-0.5 shrink-0">
                                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 whitespace-nowrap">
                                        {formatPrice(mainPrice)}{" "}
                                        <span className="text-sm sm:text-base font-medium">₪</span>
                                    </span>
                                    <span className="text-xs sm:text-xs text-black whitespace-nowrap">بدلاً من</span>
                                    <span className="text-sm sm:text-sm text-black line-through whitespace-nowrap">
                                        {formatPrice(originalTotal ?? parseFloat(oldPrice || mainPrice))} ₪
                                    </span>
                                    {savings !== null && savings > 0 && (
                                        <span className="mt-0.5 text-xs sm:text-xs font-semibold text-red-1 whitespace-nowrap">
                                            وفّر {formatPrice(savings)} ₪
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                ) : (

                    <Link href={`/product/${product.slug}`} className="block">
                        <div className="flex flex-col-reverse sm:flex-row items-center gap-4">
                            <div className="relative w-full sm:w-[160px] aspect-square rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                <Image
                                    src={mainImageError ? "/images/placeholders/product-placeholder.webp" : imageUrl}
                                    alt={name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={() => setMainImageError(true)}
                                />
                            </div>
                            <div className="flex flex-col gap-2 text-center sm:text-right flex-1" dir="rtl">
                                <div className="flex items-baseline gap-2 justify-center sm:justify-start flex-wrap">
                                    <span className="text-xl md:text-2xl font-bold text-gray-800">
                                        {formatPrice(mainPrice)}{" "}
                                        <span className="text-base font-medium">₪</span>
                                    </span>
                                    {oldPrice && parseFloat(mainPrice) !== parseFloat(oldPrice) && (
                                        <>
                                            <span className="text-xs text-black">بدلاً من</span>
                                            <span className="text-sm text-black line-through">
                                                {formatPrice(oldPrice)} ₪
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
}

function ShortcutButton({
    icon: Icon,
    href,
    onClick,
    title,
    className
}: {
    icon: React.ElementType | string;
    href?: string;
    onClick?: () => void;
    title?: string;
    className?: string;
}) {
    const commonClasses = cn(
        "w-10 h-10 sm:w-11 sm:h-11 lg:w-8 lg:h-8 rounded-sm border border-[#3C5D80] text-[#3C5D80] flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0",
        className
    );

    const renderIcon = () => {
        if (typeof Icon === "string") {
            return (
                <img
                    src={Icon}
                    alt=""
                    className="w-6 h-6 sm:w-7 sm:h-7 lg:w-4 lg:h-4 object-contain"
                />
            );
        }
        return <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-4 lg:h-4" />;
    };

    if (onClick) {
        return (
            <button onClick={onClick} className={commonClasses} title={title}>
                {renderIcon()}
            </button>
        );
    }

    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={commonClasses} title={title}>
            {renderIcon()}
        </a>
    );
}

function StoreShortcuts({ store }: { store: StoreProfile }) {

    const shortcuts: {
        icon: React.ElementType | string;
        href?: string;
        onClick?: () => void;
        title: string;
        show: boolean;
    }[] = [
            // {
            //     icon: LinkIcon,
            //     onClick: copyToClipboard,
            //     title: "نسخ الرابط",
            //     show: true
            // },
            {
                icon: "/icons/dashboard/facebook4.svg",
                href: store.facebook || undefined,
                title: "فيسبوك",
                show: !!store.facebook
            },
            {
                icon: "/icons/dashboard/insta3.svg",
                href: store.instagram || undefined,
                title: "انستجرام",
                show: !!store.instagram
            },
            {
                icon: "/icons/dashboard/tictok2.svg",
                href: store.tiktok || undefined,
                title: "تيك توك",
                show: !!store.tiktok
            },
            {
                icon: Youtube,
                href: store.youtube || undefined,
                title: "يوتيوب",
                show: !!store.youtube
            },
            {
                icon: "/icons/dashboard/whatsapp5.svg",
                href: store.whats_app ? `https://wa.me/${store.whats_app}` : undefined,
                title: "واتساب",
                show: !!store.whats_app
            }
        ];

    const hasShortcuts = shortcuts.some(s => s.show);

    if (!hasShortcuts) return null;

    return (
        <div
            className="mb-2 bg-white border border-[#e0dfdc] justify-center rounded-[10px] px-3 py-2.5 sm:px-3.5 lg:px-2.5 lg:py-2 flex flex-row items-center gap-2 sm:gap-3 lg:gap-2 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.1)]"
        >
            <h4 className="text-base sm:text-lg lg:text-sm font-bold text-[#3C5D80] shrink-0 whitespace-nowrap">
                اختصارات المتجر:
            </h4>
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-1 flex-wrap min-w-0">
                {shortcuts.filter(s => s.show).map((s, idx) => (
                    <ShortcutButton
                        key={idx}
                        icon={s.icon}
                        href={s.href}
                        onClick={s.onClick}
                        title={s.title}
                    />
                ))}
            </div>
        </div>
    );
}

function OverviewTab({ store }: { store: StoreProfile }) {
    const [isWorkingPopupOpen, setIsWorkingPopupOpen] = useState(false);
    const workingState = resolveWorkingState(store);

    // Member since
    const memberSince = store.owner?.created_at
        ? new Date(store.owner.created_at).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
        : "غير متوفر";

    return (
        <>
            <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8" dir="rtl">
                {/* اختصارات + بائع: آخراً على الجوال | يسار الديسكتوب */}
                <div className="w-full lg:w-[340px] shrink-0 order-2 flex flex-col gap-2">
                    <StoreShortcuts store={store} />
                    <StoreOwnerCard store={store} />
                </div>

                {/* الوصف + إحصائيات: أولاً على الجوال | يمين الديسكتوب */}
                <div className="flex-1 min-w-0 w-full order-1 flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
                    <div className="flex flex-row lg:flex-col flex-wrap justify-between w-full lg:w-auto lg:justify-start gap-6 lg:gap-8 shrink-0">
                        <StoreStatItem
                            icon={<img src="/icons/clock.svg" alt="" className="w-6 h-6" />}
                            label="مواعيد العمل"
                            value={workingState.label}
                            sub={workingState.sub}
                            color={workingState.color}
                            onClick={() => setIsWorkingPopupOpen(true)}
                        />
                        <StoreStatItem
                            icon={<img src="/icons/heart2.svg" alt="" className="w-6 h-6" />}
                            label="فضلوا المتجر"
                            value={String(store.favorites_count || 0)}
                        />
                        <StoreStatItem
                            icon={<img src="/icons/member.svg" alt="" className="w-6 h-6" />}
                            label="عضو منذ"
                            value={String(memberSince)}
                        />
                    </div>
                    <div
                        className="store-overview-description prose prose-lg !max-w-none flex-1 min-w-0 w-full text-gray-700 leading-relaxed font-sans text-right [&_p]:mb-4 [&_p:last-child]:mb-0 [&_div]:mb-4 [&_p]:max-w-none [&_div]:max-w-none [&_*]:max-w-none [&_a]:text-blue-4"
                    >
                        <SafeHTML html={store.description} fallback="<p>لا يوجد وصف</p>" />
                    </div>
                </div>
            </div>

            <WorkingStatusModal
                isOpen={isWorkingPopupOpen}
                onClose={() => setIsWorkingPopupOpen(false)}
                store={store}
            />
        </>
    );
}

function WorkingStatusModal({
    isOpen,
    onClose,
    store,
}: {
    isOpen: boolean;
    onClose: () => void;
    store: StoreProfile;
}) {
    if (!isOpen) return null;
    const state = resolveWorkingState(store);
    const currentDay = state.dayValue;
    const isScheduleModal = state.popupState === "schedule_open" || state.popupState === "schedule_closed";

    const config = {
        schedule_open: {
            image: "/popup/1.svg",
            title: "المتجر يعمل",
            titleClass: "text-[#45C332]",
            cardHeight: "h-[680px]",
            imageClass: "w-[130px]",
        },
        schedule_closed: {
            image: "/popup/2.svg",
            title: "المتجر مغلق حالياً",
            titleClass: "text-[#C72D2D]",
            cardHeight: "h-[680px]",
            // 2.svg appears visually smaller, so we render it larger.
            imageClass: "w-[165px]",
        },
        open_without_hours: {
            image: "/popup/3.svg",
            title: "المتجر مفتوح بدون ساعات عمل معينة",
            titleClass: "text-[#3A5C84]",
            cardHeight: "h-[350px]",
            imageClass: "w-[180px]",
        },
        temporary_closed: {
            image: "/popup/4.svg",
            title: "المتجر مغلق مؤقتاً",
            titleClass: "text-[#E5B500]",
            cardHeight: "h-[350px]",
            imageClass: "w-[180px]",
        },
        closed: {
            image: "/popup/5.svg",
            title: "المتجر مغلق بشكل دائم",
            titleClass: "text-[#DF2E2E]",
            cardHeight: "h-[310px]",
            imageClass: "w-[180px]",
        },
    }[state.popupState];

    return (
        <div className="fixed inset-0 z-[100] bg-black/40 p-3 sm:p-5 flex items-center justify-center overflow-y-auto">
            <div
                dir="rtl"
                className={cn(
                    "relative w-[min(92vw,780px)] rounded-[15px] bg-white px-5 pt-[30px] pb-5 overflow-hidden",
                    "hidden sm:block",
                    config.cardHeight
                )}
            >
                {/* زر الإغلاق */}
                <div className="sticky top-0 z-20 flex justify-start" dir="ltr">
                    <button
                        onClick={onClose}
                        className="text-[#1F1F1F] hover:opacity-60 cursor-pointer"
                        aria-label="إغلاق"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* الصورة + العنوان + الوصف */}
                <div className="flex flex-col items-center text-center pt-1 pb-2">
                    <img
                        src={config.image}
                        alt=""
                        className={cn(
                            "object-contain",
                            config.imageClass
                        )}
                    />
                    <h3 className={cn("mt-5 text-[28px] leading-tight font-bold", config.titleClass)}>
                        {config.title}
                    </h3>
                    {/*
                    <p className="mt-2 text-[#6B6B6B] text-[12px] sm:text-[13px] leading-[1.5] max-w-[560px]">
                        ان كنت متابع لهذا المتجر ومفعل الاشعارات سيتم <br />
                        اعلامك بكل الأنشطة الخاصة به
                    </p>
                    */}
                </div>

                {/* جدول مواعيد الأسبوع */}
                {isScheduleModal && (
                    <div>
                        {WEEK_DAYS.map((d) => {
                            const wt = store.workingtimes?.find((x) => x.day === d.key);
                            const isDayClosed = !wt || wt.closed_always;
                            const timeText = wt
                                ? wt.open_always
                                    ? "24 ساعة"
                                    : wt.closed_always
                                        ? "عطلة"
                                        : `من ${formatTime(wt.from)} حتى ${formatTime(wt.to)}`
                                : "عطلة";
                            const isToday = d.key === currentDay;
                            return (
                                <div key={d.key} className="flex items-center gap-2 sm:gap-3 py-1.5 border-b border-[#EFEFEF] last:border-b-0">
                                    {/* دائرة + خط timeline — أقصى اليمين */}
                                    <div className="flex flex-col items-center shrink-0">
                                        <div className={cn("w-1 flex-1 min-h-[14px]", isToday ? "bg-[#D0D0D0]" : "bg-[#E5E5E5]")} />
                                        <div className={cn(
                                            "w-4 h-4 rounded-full border-2",
                                            isToday
                                                ? (state.isOpenNow
                                                    ? "bg-[#45C332] border-[#45C332]"
                                                    : "bg-[#C72D2D] border-[#C72D2D]")
                                                : "bg-[#D0D0D0] border-[#D0D0D0]"
                                        )} />
                                    </div>

                                    {/* اسم اليوم + الوقت */}
                                    <div className="flex-1 text-right">
                                        <p className="text-[14px] sm:text-[16px] font-semibold text-[#2F2F2F] leading-tight">{d.label}</p>
                                        <p className="text-[11px] sm:text-[12px] text-[#888] mt-0.5">{timeText}</p>
                                    </div>

                                    {/* حالة اليوم */}
                                    <span className={cn(
                                        "shrink-0 text-[12px] sm:text-[13px] font-medium",
                                        isDayClosed ? "text-[#C64141]" : "text-[#45A24A]"
                                    )}>
                                        {isDayClosed ? "لا يعمل" : "يعمل"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Mobile fallback */}
            <div
                dir="rtl"
                className="sm:hidden relative w-[min(92vw,780px)] rounded-[15px] bg-white px-4 pt-4 pb-4 overflow-y-auto max-h-[95vh]"
            >
                <div className="sticky top-0 z-20 flex justify-start" dir="ltr">
                    <button
                        onClick={onClose}
                        className="text-[#1F1F1F] hover:opacity-60 cursor-pointer"
                        aria-label="إغلاق"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex flex-col items-center text-center pt-1 pb-3">
                    <img src={config.image} alt="" className={cn("object-contain", config.imageClass)} />
                    <h3 className={cn("mt-4 text-[26px] leading-tight font-bold", config.titleClass)}>{config.title}</h3>
                    {/*
                    <p className="mt-2 text-[#6B6B6B] text-[13px] leading-relaxed max-w-[560px]">
                        ان كنت متابع لهذا المتجر ومفعل الاشعارات سيتم
                        <br />
                        اعلامك بكل الأنشطة الخاصة به
                    </p>
                    */}
                </div>
                {isScheduleModal && (
                    <div>
                        {WEEK_DAYS.map((d) => {
                            const wt = store.workingtimes?.find((x) => x.day === d.key);
                            const isDayClosed = !wt || wt.closed_always;
                            const timeText = wt
                                ? wt.open_always
                                    ? "24 ساعة"
                                    : wt.closed_always
                                        ? "عطلة"
                                        : `من ${formatTime(wt.from)} حتى ${formatTime(wt.to)}`
                                : "عطلة";
                            const isToday = d.key === currentDay;
                            return (
                                <div key={d.key} className="flex items-center gap-2 py-2 border-b border-[#EFEFEF] last:border-b-0">
                                    <div className="flex flex-col items-center shrink-0">
                                        <div className="w-1 flex-1 min-h-[12px] bg-[#E5E5E5]" />
                                        <div className={cn(
                                            "w-3.5 h-3.5 rounded-full border-2",
                                            isToday
                                                ? (state.isOpenNow ? "bg-[#45C332] border-[#45C332]" : "bg-[#C72D2D] border-[#C72D2D]")
                                                : "bg-[#D0D0D0] border-[#D0D0D0]"
                                        )} />
                                    </div>
                                    <div className="flex-1 text-right">
                                        <p className="text-[15px] font-semibold text-[#2F2F2F] leading-tight">{d.label}</p>
                                        <p className="text-[12px] text-[#888] mt-0.5">{timeText}</p>
                                    </div>
                                    <span className={cn("shrink-0 text-[13px] font-medium", isDayClosed ? "text-[#C64141]" : "text-[#45A24A]")}>
                                        {isDayClosed ? "لا يعمل" : "يعمل"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function StoreOwnerCard({ store }: { store: StoreProfile }) {
    const params = useParams();
    const lang = params?.locale || params?.lang || "ar";
    const ownerName = store.owner
        ? (store.owner.first_name || "") + " " + (store.owner.last_name || "")
        : store.name;
    const ownerAvatar = store.owner?.avatar_url || store.logo_url;

    return (
        <div className="bg-white border border-[#e0dfdc] rounded-lg p-4 flex flex-col items-center gap-4 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.1)]">
            <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-gray-100 flex items-center justify-center bg-gray-50">
                {ownerAvatar ? (
                    <Image
                        src={ownerAvatar}
                        alt={ownerName}
                        fill
                        className="object-cover"
                        onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement?.classList.add("flex", "items-center", "justify-center"); }}
                    />
                ) : (
                    <User size={50} className="text-gray-400" />
                )}
            </div>
            <div className="flex flex-col items-center gap-1">
                <Link href={`/${lang}/profile/${store.owner?.slug}`}>
                    <h3 className="text-[17px] text-center font-medium text-[#4d4d4d] capitalize">
                        {ownerName}
                    </h3>
                </Link>
                <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={11}
                            className={cn(
                                i < Math.round(Number(store.owner?.review_rate || 0))
                                    ? "fill-[#FB923C] text-[#FB923C]"
                                    : "fill-gray-200 text-gray-200"
                            )}
                        />
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 w-full" dir="rtl">
                <ChatNowButton
                    target={{ type: "user", id: store.owner?.id || store.owner_id }}
                    label={<span className="whitespace-nowrap">تواصل مع البائع</span>}
                    icon={<MessageSquare size={15} className="shrink-0" strokeWidth={2} />}
                    iconClassName="shrink-0 size-[15px]"
                    className="rounded-full has-[>svg]:px-5 min-h-10"
                />
                <div className="min-w-0">
                    <ReportAbuse type="store" id={store.id}>
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full has-[>svg]:px-5 min-h-10 text-c2-red-400 border-c2-red-400 border bg-transparent"
                        >
                            <Flag size={15} className="shrink-0" strokeWidth={2} />
                            <span className="whitespace-nowrap">ابلغ عن إساءة</span>
                        </Button>
                    </ReportAbuse>
                </div>
            </div>
        </div>
    );
}



function StoreStatItem({ icon, label, value, sub, color, onClick }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
    color?: string;
    onClick?: () => void;
}) {
    const Wrapper: React.ElementType = onClick ? "button" : "div";
    return (
        <Wrapper
            onClick={onClick}
            className={cn(
                "flex flex-col items-center text-center gap-1 min-w-[80px]",
                onClick && "cursor-pointer hover:opacity-85 transition-opacity"
            )}
        >
            <div className="w-10 h-10  flex items-center justify-center">
                {icon}
            </div>
            <span className="text-xs text-gray-500">{label}</span>
            <span className={cn("text-sm font-medium", color || "text-gray-2")}>{value}</span>
            {sub && <span className="text-[11px] text-gray-400">{sub}</span>}
        </Wrapper>
    );
}

function StoreReviewsSection({ slug, summary }: { slug: string; summary: { count: number; rate: number } }) {
    const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
    const [mediaViewerState, setMediaViewerState] = useState<{
        isOpen: boolean;
        media: string[];
        index: number;
    }>({ isOpen: false, media: [], index: 0 });

    const [page, setPage] = useState(1);
    const { data, isLoading, refetch: refetchReviews } = useGetStoreReviews(slug, page);
    const { mutate: addReview, isPending } = useAddStoreReview();

    const handleSubmit = (formData: { content: string; rate: number; images: File[]; parent_id?: number | null }) => {
        const savedScrollY = window.scrollY;
        return new Promise<void>((resolve, reject) => {
            addReview(
                { slug, payload: { content: formData.content, rate: String(formData.rate), images: formData.images, parent_id: formData.parent_id } },
                {
                    onSuccess: () => {
                        if (formData.parent_id) {
                            setExpandedReplies((prev) => new Set(prev).add(formData.parent_id!));
                        }
                        // Restore scroll position after query invalidation re-renders the list
                        requestAnimationFrame(() => {
                            window.scrollTo({ top: savedScrollY, behavior: "instant" });
                        });
                        resolve();
                    },
                    onError: () => reject(),
                }
            );
        });
    };

    const handleToggleReplies = (reviewId: number) => {
        setExpandedReplies((prev) => {
            const next = new Set(prev);
            if (next.has(reviewId)) {
                next.delete(reviewId);
            } else {
                next.add(reviewId);
            }
            return next;
        });
    };

    const openMedia = (media: string[], index: number = 0) => {
        setMediaViewerState({ isOpen: true, media, index });
    };

    const reviews = data?.reviews || [];
    let statistics: ReviewStatistics | undefined;
    if (data?.rate_stats) {
        statistics = {
            total_reviews: data.total || 0,
            average_rate: Number(data.avg_rate) || 0,
            stars: data.rate_stats
        };
    } else if (summary.count > 0) {
        statistics = {
            total_reviews: summary.count,
            average_rate: summary.rate,
            stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
    }

    return (
        <>
            <ReviewsSection
                stats={statistics && <ReviewStatisticsDisplay stats={statistics} />}
                isLoading={isLoading}
                itemsOnPage={reviews.length}
                total={data?.total}
                page={page}
                setPage={setPage}
                onSubmit={handleSubmit}
                isSubmitting={isPending}
            >
                {reviews.map((review) => (
                    <StoreReviewWithReplies
                        key={review.id}
                        review={review as unknown as SharedReview}
                        slug={slug}
                        onOpenMedia={openMedia}
                        onSubmitReply={handleSubmit}
                        isSubmittingReply={isPending}
                        showReplies={expandedReplies.has(review.id)}
                        onToggleReplies={handleToggleReplies}
                        onReviewChanged={refetchReviews}
                    />
                ))}
            </ReviewsSection>

            {mediaViewerState.isOpen && (
                <MediaViewer
                    isOpen={mediaViewerState.isOpen}
                    onClose={() => setMediaViewerState((prev) => ({ ...prev, isOpen: false }))}
                    media={mediaViewerState.media}
                    initialIndex={mediaViewerState.index}
                />
            )}
        </>
    );
}

function StoreReviewWithReplies({
    review,
    slug,
    onOpenMedia,
    onSubmitReply,
    isSubmittingReply,
    showReplies,
    onToggleReplies,
    onReviewChanged,
}: {
    review: SharedReview;
    slug: string;
    onOpenMedia: (media: string[], index: number) => void;
    onSubmitReply: (data: ReviewSubmitPayload) => Promise<void> | void;
    isSubmittingReply: boolean;
    showReplies: boolean;
    onToggleReplies: (id: number) => void;
    onReviewChanged: () => void;
}) {
    const { data: repliesData, isLoading: loadingReplies, refetch: refetchReplies } = useGetStoreReviewReplies(
        showReplies ? slug : "",
        showReplies ? review.id : 0
    );

    const handleChanged = () => {
        onReviewChanged();
        if (showReplies) refetchReplies();
    };

    return (
        <ReviewItem
            review={review}
            onOpenMedia={onOpenMedia}
            onSubmitReply={onSubmitReply}
            isSubmittingReply={isSubmittingReply}
            showReplies={showReplies}
            onToggleReplies={onToggleReplies}
            replies={repliesData?.reviews as unknown as SharedReview[]}
            isLoadingReplies={loadingReplies}
            onDeleted={handleChanged}
            onUpdated={handleChanged}
        />
    );
}
