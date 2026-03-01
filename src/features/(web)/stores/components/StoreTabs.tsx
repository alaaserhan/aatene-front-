"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { StoreProfile, StorePageData } from "../api";
import { cn } from "@/src/lib/utils";
import {
    Loader2,
    Star,
    MessageSquare,
    Flag,
    Facebook,
    Instagram,
    Youtube,
    Link as LinkIcon,
    Clock,
    Heart,
    Package,
    Award,
} from "lucide-react";
import { useAddStoreReview, useGetStoreReviews, useGetStoreReviewReplies } from "../hooks";
import { ReviewForm, ReviewFormRef } from "@/src/components/(web)/ReviewForm";
import { ReviewItem, SharedReview } from "@/src/components/(web)/ReviewItem";
import { MediaViewer } from "@/src/components/ui/MediaViewer";
import { ReviewStatisticsDisplay } from "@/src/features/(web)/product/components/ReviewStatisticsDisplay";
import { ReviewStatistics, ProductInPageData } from "@/src/features/(web)/product/types";
import { ReportAbuse } from "@/src/features/(web)/reports/components/ReportAbuse";
import { Pagination } from "@/src/components/ui/Pagination";
import Link from "next/link";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";

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

export default function StoreTabs({ store, pageData }: StoreTabsProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("overview");

    const tabs: { key: TabKey; label: string }[] = [
        { key: "overview", label: "نظره عامة" },
        { key: "reviews", label: "تقييمات المتجر" },
        { key: "discounts", label: "تخفيضات" },
        { key: "offers", label: "عروض" },
    ];

    const offersProducts = pageData?.offers || [];
    const couponsProducts = pageData?.coupons?.flatMap(c => c.products) || [];

    return (
        <div className="mt-6 overflow-hidden bg-white rounded-lg border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
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

            <div className="p-4 md:p-6 min-h-[300px]">
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
                        <OffersGrid products={offersProducts} emptyMessage="لا توجد تخفيضات حالياً" />
                    </div>
                )}
                {activeTab === "offers" && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300" dir="rtl">
                        <OffersGrid products={couponsProducts} emptyMessage="لا توجد عروض حالياً" useProductCard />
                    </div>
                )}
            </div>
        </div>
    );
}

function OffersGrid({ products, emptyMessage, useProductCard }: { products: ProductInPageData[], emptyMessage: string, useProductCard?: boolean }) {
    const [page, setPage] = useState(1);
    const PER_PAGE = 8;
    const totalPages = Math.ceil(products.length / PER_PAGE);
    const displayedProducts = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    if (products.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {displayedProducts.map(p => (
                    useProductCard ? (
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
                        />
                    ) : (
                        <OfferCard key={p.id} product={p} />
                    )
                ))}
            </div>
            {totalPages > 1 && (
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
    const imageUrl = product.cross_sells_image_url || product.cover || "/placeholder.png";
    const name = product.cross_sells_name || product.name || "اسم العرض";
    const desc = product.cross_sells_description || product.short_description || product.name || "";

    const fallbackMainPrice = product.price_after_discount || product.price;
    const fallbackOldPrice = product.price_after_discount && parseFloat(product.price) > parseFloat(product.price_after_discount)
        ? product.price
        : (product.discount_present > 0 ? product.price : null);

    const mainPrice = product.cross_sells_original_price || fallbackMainPrice;
    const oldPrice = product.cross_sells_price || fallbackOldPrice;

    return (
        <div className="flex flex-col cursor-pointer group relative bg-white overflow-hidden text-right rounded-lg">
            <Link href={`/product/${product.slug}`} className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 block mb-3">
                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </Link>
            <div className="pt-2 flex flex-col items-center text-center">
                <Link href={`/product/${product.slug}`} className="block w-full">
                    <h3 className="font-medium text-lg mb-1 line-clamp-1 group-hover:text-blue-3 transition-colors text-center w-full">
                        {name}
                    </h3>
                </Link>
                <div
                    className="text-gray-2 text-sm mb-2 line-clamp-2 leading-relaxed h-[40px] sm:h-[43px] "

                >
                    {desc}
                </div>
                <div className="flex items-baseline gap-1.5 justify-center">
                    <span className="text-green-600 font-medium text-base sm:text-lg flex items-center gap-1">
                        {parseFloat(mainPrice).toFixed(2)} <span className="font-medium text-base sm:text-lg">₪</span>
                    </span>
                    {oldPrice && parseFloat(mainPrice) !== parseFloat(oldPrice) && (
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                            بدلاً من <span className="text-red-400 line-through mr-1">{parseFloat(oldPrice).toFixed(2)} <span className="text-base">₪</span></span>
                        </span>
                    )}
                </div>
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
    icon: React.ElementType;
    href?: string;
    onClick?: () => void;
    title?: string;
    className?: string;
}) {
    const commonClasses = cn(
        "w-7 h-7 rounded-sm border border-blue-4 text-blue-4 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0",
        className
    );

    if (onClick) {
        return (
            <button onClick={onClick} className={commonClasses} title={title}>
                <Icon className="w-4.5 h-4.5" />
            </button>
        );
    }

    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={commonClasses} title={title}>
            <Icon className="w-4.5 h-4.5" />
        </a>
    );
}

function StoreShortcuts({ store }: { store: StoreProfile }) {
    const copyToClipboard = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const shortcuts: {
        icon: React.ElementType;
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
                icon: Facebook,
                href: store.facebook || undefined,
                title: "فيسبوك",
                show: !!store.facebook
            },
            {
                icon: Instagram,
                href: store.instagram || undefined,
                title: "انستجرام",
                show: !!store.instagram
            },
            {
                icon: TiktokIcon,
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
                icon: WhatsAppIcon,
                href: store.whats_app ? `https://wa.me/${store.whats_app}` : undefined,
                title: "واتساب",
                show: !!store.whats_app
            }
        ];

    return (
        <div className="mb-2 bg-white border border-[#e0dfdc] rounded-[10px] p-[10px_14px] flex flex-col gap-1.5 justify-between" dir="rtl">
            <h4 className="text-sm font-medium text-center text-blue-4">اختصارات المتجر:</h4>
            <div className="flex items-center justify-center gap-1 flex-wrap flex-1 ">
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
    // Calculate current day working hours
    const today = new Date().getDay();
    const dayValue = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][today];
    const workingTime = store.workingtimes?.find((wt) => wt.day === dayValue);

    const formatTime = (time: string) => {
        if (!time) return "";
        const [hoursStr, minutesStr] = time.split(":");
        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours || 12;
        const minutesDisplay = minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : '';
        return `${hours}${minutesDisplay}${ampm}`;
    };

    let workingHours = "غير متوفر";
    if (workingTime) {
        if (workingTime.open_always) {
            workingHours = "مفتوح 24 ساعة";
        } else if (workingTime.closed_always) {
            workingHours = "";
        } else {
            workingHours = `${formatTime(workingTime.from)} - ${formatTime(workingTime.to)}`;
        }
    }

    // Member since
    const memberSince = store.owner?.created_at
        ? new Date(store.owner.created_at).getFullYear()
        : "غير متوفر";

    return (
        <div className="flex flex-col lg:flex-row gap-6" dir="rtl">
            {/* Right Side: Store Owner Card */}
            <div className="w-full lg:w-[280px] shrink-0 order-1 lg:order-2">
                <StoreShortcuts store={store} />
                <StoreOwnerCard store={store} />
            </div>

            {/* Left Side: Description + Stats */}
            <div className="grid grid-cols-12 md:grid-cols-8 gap-6 w-full">
                {/* Stats Row */}
                <div className="flex flex-row md:justify-start justify-center md:flex-col gap-6 col-span-12 md:col-span-1">
                    <StoreStatItem
                        icon={<img src="/icons/clock.svg" alt="" className="w-6 h-6" />}
                        label="مواعيد العمل"
                        value={store.open_status === "open" ? "مفتوح الآن" : "مغلق"}
                        sub={workingHours}
                        color={store.open_status === "open" ? "text-green-600" : "text-red-500"}
                    />
                    <StoreStatItem
                        icon={<img src="/icons/heart2.svg" alt="" className="w-6 h-6" />}
                        label="مشاركه"
                        value={String(store.followers_count || 0)}
                    />
                    <StoreStatItem
                        icon={<img src="/icons/member.svg" alt="" className="w-6 h-6" />}
                        label="عضو منذ"
                        value={String(memberSince)}
                    />
                </div>
                {/* Description */}
                <div
                    className="prose prose-lg max-w-none leading-relaxed font-sans text-sm col-span-12 md:col-span-7"
                    dangerouslySetInnerHTML={{ __html: store.description || "<p>لا يوجد وصف</p>" }}
                />
            </div>
        </div>
    );
}

function StoreOwnerCard({ store }: { store: StoreProfile }) {
    const ownerName = store.owner
        ? (store.owner.first_name || "") + " " + (store.owner.last_name || "")
        : store.name;
    const ownerAvatar = store.owner?.avatar_url || store.logo_url;

    return (
        <div className="bg-white border border-[#e0dfdc] rounded-lg p-4 flex flex-col items-center gap-4">
            <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-gray-100">
                <Image
                    src={ownerAvatar || "/default-avatar.png"}
                    alt={ownerName}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="flex flex-col items-center gap-1">
                <h3 className="text-[17px] font-medium text-[#4d4d4d] capitalize">
                    {ownerName}
                </h3>
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
            <p className="text-xs text-gray-2 leading-[17px] text-center">
                {store.description?.slice(0, 150) || "لا يوجد وصف"}
            </p>
            <div className="flex items-center gap-2 w-full">
                <button className="flex-1 flex items-center justify-center gap-1 bg-linear-to-r from-[#5b89ba] to-[#3a5c7f] border border-[#5e8cbe] text-white rounded-full h-[25px] text-[11px] font-medium whitespace-nowrap cursor-pointer">
                    <MessageSquare size={13} />
                    تواصل مع البائع
                </button>
                <ReportAbuse type="store" id={store.id}>
                    <button className="flex cursor-pointer items-center justify-center gap-1 border border-[#b75959] text-[#b75959] rounded-full px-4 h-[25px] text-[11px] font-medium whitespace-nowrap">
                        <Flag size={13} />
                        ابلغ عن إساءة
                    </button>
                </ReportAbuse>
            </div>
        </div>
    );
}



function StoreStatItem({ icon, label, value, sub, color }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
    color?: string;
}) {
    return (
        <div className="flex flex-col items-center text-center gap-1 min-w-[80px]">
            <div className="w-10 h-10  flex items-center justify-center">
                {icon}
            </div>
            <span className="text-xs text-gray-500">{label}</span>
            <span className={cn("text-sm font-medium", color || "text-gray-2")}>{value}</span>
            {sub && <span className="text-[11px] text-gray-400">{sub}</span>}
        </div>
    );
}

function StoreReviewsSection({ slug, summary }: { slug: string; summary: { count: number; rate: number } }) {
    const formRef = useRef<ReviewFormRef>(null);
    const [parentId, setParentId] = useState<number | null>(null);
    const [replyToName, setReplyToName] = useState<string | null>(null);
    const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
    const [mediaViewerState, setMediaViewerState] = useState<{
        isOpen: boolean;
        media: string[];
        index: number;
    }>({ isOpen: false, media: [], index: 0 });

    const { data, isLoading } = useGetStoreReviews(slug);
    const { mutate: addReview, isPending } = useAddStoreReview();

    const handleReply = (id: number, userName: string) => {
        setParentId(id);
        setReplyToName(userName);
        formRef.current?.scrollToForm();
        formRef.current?.focusTextarea();
    };

    const handleCancelReply = () => {
        setParentId(null);
        setReplyToName(null);
    };

    const handleSubmit = (formData: { content: string; rate: number; images: File[]; parent_id?: number | null }) => {
        return new Promise<void>((resolve, reject) => {
            addReview(
                { slug, payload: { content: formData.content, rate: String(formData.rate), images: formData.images, parent_id: formData.parent_id } },
                {
                    onSuccess: () => {
                        setParentId(null);
                        setReplyToName(null);
                        if (formData.parent_id) {
                            setExpandedReplies((prev) => new Set(prev).add(formData.parent_id!));
                        }
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

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-3" /></div>;

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
        <div className="space-y-6">
            {statistics && (
                <ReviewStatisticsDisplay stats={statistics} />
            )}

            {reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <StoreReviewWithReplies
                            key={review.id}
                            review={review as unknown as SharedReview}
                            slug={slug}
                            onOpenMedia={openMedia}
                            onReply={handleReply}
                            showReplies={expandedReplies.has(review.id)}
                            onToggleReplies={handleToggleReplies}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">لا توجد مراجعات بعد</p>
                </div>
            )}

            {mediaViewerState.isOpen && (
                <MediaViewer
                    isOpen={mediaViewerState.isOpen}
                    onClose={() => setMediaViewerState((prev) => ({ ...prev, isOpen: false }))}
                    media={mediaViewerState.media}
                    initialIndex={mediaViewerState.index}
                />
            )}

            <ReviewForm
                ref={formRef}
                onSubmit={handleSubmit}
                isSubmitting={isPending}
                parentId={parentId}
                replyToName={replyToName}
                onCancelReply={handleCancelReply}
            />
        </div>
    );
}

function StoreReviewWithReplies({
    review,
    slug,
    onOpenMedia,
    onReply,
    showReplies,
    onToggleReplies,
}: {
    review: SharedReview;
    slug: string;
    onOpenMedia: (media: string[], index: number) => void;
    onReply: (id: number, userName: string) => void;
    showReplies: boolean;
    onToggleReplies: (id: number) => void;
}) {
    const { data: repliesData, isLoading: loadingReplies } = useGetStoreReviewReplies(
        showReplies ? slug : "",
        showReplies ? review.id : 0
    );

    return (
        <ReviewItem
            review={review}
            onOpenMedia={onOpenMedia}
            onReply={onReply}
            showReplies={showReplies}
            onToggleReplies={onToggleReplies}
            replies={repliesData?.reviews as unknown as SharedReview[]}
            isLoadingReplies={loadingReplies}
        />
    );
}
