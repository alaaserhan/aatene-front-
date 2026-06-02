"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Star, Share2, Flag, ChevronLeft, ChevronRight, Play, Phone, MoreVertical, Send, Eye, FolderOpen } from "lucide-react";
import { Product, Store, Attribute, AttributeOption } from "../api";
import { FavoriteButton } from "@/src/features/(web)/fav/components/FavoriteButton";
import { useAddProductToCompare, useRemoveProductFromCompare } from "@/src/features/(web)/compares/hooks";
import { cn, isVideoFile, sanitizeMediaUrl } from "@/src/lib/utils";
import { formatPrice } from "@/src/lib/format-price";
import { shouldShowAskForPrice } from "@/src/lib/normalizeAskForPrice";
import Cookies from "js-cookie";

import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { ReportAbuseModal } from "../../reports/components/ReportAbuseModal";
import { ShareModal } from "@/src/components/ui/ShareModal";
import Link from "next/link";
import { useAuthStore } from "@/src/stores/auth-store";
import { productAskForPriceButtonClassName } from "./productAskForPriceButton";

const PRODUCT_CONDITION_LABELS: Record<string, string> = {
    new: "جديد",
    used: "مستعمل",
};

interface ProductHeroProps {
    product: Product;
    store: Store;
    attributes: Attribute[];
}

export default function ProductHero({ product, store, attributes }: ProductHeroProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showMenu, setShowMenu] = useState(false);
    const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
    const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
    const [isFavorite, setIsFavorite] = useState(product.is_favorite);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isInCompare, setIsInCompare] = useState(product.in_compare);

    const { user } = useAuthStore();
    const params = useParams();
    const lang = params?.locale || params?.lang || "ar";

    useEffect(() => {
        setIsFavorite(product.is_favorite);
    }, [product.is_favorite]);

    const selectedVariation = useMemo(() => {
        if (!product.variations || product.variations.length === 0) return null;
        if (!attributes || Object.keys(selectedVariations).length !== attributes.length) return null;

        return product.variations.find(v => {
            const options = v.attribute_options || v.attributeOptions;
            if (!options) return false;
            return options.every(opt => {
                const selectedVal = selectedVariations[String(opt.attribute_id)];
                return selectedVal && selectedVal === String(opt.option_id);
            });
        });
    }, [product.variations, selectedVariations, attributes]);

    const allMedia = useMemo(() => {
        const items: { type: "image" | "video"; url: string }[] = [];
        const seen = new Set<string>();

        const addMedia = (url: string | null | undefined) => {
            const sanitized = sanitizeMediaUrl(url);
            if (!sanitized || seen.has(sanitized)) return;
            seen.add(sanitized);
            items.push({
                type: isVideoFile(sanitized) ? "video" : "image",
                url: sanitized,
            });
        };

        addMedia(product.cover);
        product.gallery?.forEach((url) => addMedia(url));
        addMedia(product.video);
        product.variations?.forEach((v) => addMedia(v.image));

        return items;
    }, [product.cover, product.gallery, product.video, product.variations]);

    const currentStoreId = Cookies.get("current_store_id");
    const isProductOwner = !!currentStoreId && !!product.store_id && Number(currentStoreId) === product.store_id;

    const { mutate: addToCompare } = useAddProductToCompare();
    const { mutate: removeFromCompare } = useRemoveProductFromCompare();
    const router = useRouter();

    const currentMedia = allMedia[selectedIndex] || allMedia[0];
    const rating = parseFloat(product.review_rate || "0");
    const hasDiscount = !selectedVariation && product.price_after_discount && product.price_after_discount !== product.price;
    const displayPrice = selectedVariation ? String(selectedVariation.price) : (product.price_after_discount || product.price);
    const shouldAskForPrice = shouldShowAskForPrice(product.ask_for_price, displayPrice);

    const conditionLabel =
        PRODUCT_CONDITION_LABELS[product.condition] ?? product.condition;
    const storePhone = normalizeDisplayPhone(store.phone);

    const handlePrev = () => {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1));
    };

    const handleNext = () => {
        setSelectedIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0));
    };

    const handleAddToCompare = () => {
        addToCompare(product.id);
        setIsInCompare(true);
    };

    const handleRemoveFromCompare = () => {
        removeFromCompare(product.id);
        setIsInCompare(false);
    };

    // عند اختيار تباين كامل، انتقل لصورته في المعرض
    useEffect(() => {
        if (!selectedVariation?.image) return;
        const sanitizedVarImg = sanitizeMediaUrl(selectedVariation.image);
        const index = allMedia.findIndex((item) => item.url === sanitizedVarImg);
        if (index !== -1) {
            setSelectedIndex(index);
        }
    }, [selectedVariation?.image, allMedia]);

    return (
        <div className="flex flex-col gap-5">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm">
                <Link href="/search?type=products" className="text-gray-500">قائمة المنتجات</Link>
                <ChevronLeft className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{product.name}</span>
            </nav>

            {/* Main Content: Info Left, Gallery Right */}
            <div className="flex flex-col min-[573px]:flex-col-reverse lg:flex-row gap-10">
                {/* Right Side: Image Gallery */}
                <div className="flex flex-col-reverse lg:flex-row gap-3 lg:w-[55%] lg:items-start">
                    {/* Thumbnails Strip — موبايل: تمرير أفقي | ديسكتوب: تمرير عمودي عند كثرة الصور */}
                    {allMedia.length > 1 && (
                        <div
                            className={cn(
                                "flex shrink-0 gap-2.5",
                                "flex-row h-[100px] w-full overflow-x-auto overflow-y-hidden",
                                "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                                "lg:flex-col lg:h-auto lg:max-h-[min(600px,70vh)] lg:min-h-0 lg:w-[100px]",
                                "lg:overflow-x-hidden lg:overflow-y-auto",
                                "lg:scrollbar-thin lg:[scrollbar-width:thin] lg:[&::-webkit-scrollbar]:w-1.5",
                                "lg:[&::-webkit-scrollbar-thumb]:rounded-full lg:[&::-webkit-scrollbar-thumb]:bg-gray-300"
                            )}
                        >
                            {allMedia.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedIndex(index)}
                                    className={cn(
                                        "relative w-[100px] h-[100px] rounded-md overflow-hidden shrink-0 border-2 transition-colors",
                                        selectedIndex === index
                                            ? "border-blue-4"
                                            : "border-transparent hover:border-gray-300"
                                    )}
                                >
                                    {item.type === "video" ? (
                                        <div className="relative w-full h-full">
                                            <video
                                                src={item.url}
                                                className="w-full h-full object-cover pointer-events-none"
                                                muted
                                                playsInline
                                                preload="metadata"
                                            />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                                                <div className="w-[40px] h-[40px] bg-white/90 rounded-full flex items-center justify-center">
                                                    <Play className="w-5 h-5 text-gray-700 fill-gray-700" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={item.url}
                                            alt={`${product.name} - ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = "/images/placeholders/product-placeholder.svg";
                                                e.currentTarget.onerror = null;
                                            }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                    {/* Main Image */}
                    <div className="flex-1 relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
                        {currentMedia?.type === "video" ? (
                            <video
                                key={currentMedia.url}
                                src={currentMedia.url}
                                controls
                                playsInline
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <img
                                src={currentMedia?.url || "/images/placeholders/product-placeholder.svg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "/images/placeholders/product-placeholder.svg";
                                    e.currentTarget.onerror = null;
                                }}
                            />
                        )}

                        {/* Navigation Arrows */}
                        {allMedia.length > 1 && (
                            <>
                                <button
                                    onClick={handleNext}
                                    className="absolute top-1/2 right-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white/60 shadow-lg flex items-center justify-center hover:bg-white/80 transition-colors backdrop-blur-sm"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-700" />
                                </button>
                                <button
                                    onClick={handlePrev}
                                    className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white/60 shadow-lg flex items-center justify-center hover:bg-white/80 transition-colors backdrop-blur-sm"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                                </button>
                            </>
                        )}
                    </div>


                </div>
                {/* Left Side: Product Info */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Price Row */}
                    <div className="flex items-center flex-wrap gap-3">
                        {shouldAskForPrice ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!user) {
                                        router.push(`/${lang}/login`);
                                        return;
                                    }
                                    router.push(`/${lang}/chat?type=store&id=${store.id}&productId=${product.id}&askPrice=1`);
                                }}
                                className={productAskForPriceButtonClassName}
                            >
                                اطلب السعر
                            </button>
                        ) : (
                            <>
                                {/* Countdown timer placeholder */}
                                {hasDiscount && product.discount_present && product.discount_present > 0 && (
                                    <div className="bg-gradient-to-t from-[#d54102] to-[#ff530a] text-white text-xs font-medium px-4 py-1.5 rounded-full">
                                        عرض محدود
                                    </div>
                                )}

                                <span className="text-2xl font-normal text-gray-800">
                                    {formatPrice(displayPrice)} ₪
                                </span>

                                {hasDiscount && (
                                    <span className="text-sm text-red-500 line-through">
                                        {formatPrice(product.price)} ₪
                                    </span>
                                )}

                                {hasDiscount && product.discount_present && product.discount_present > 0 && (
                                    <div className="bg-gradient-to-t pb-0.5 from-[rgba(20,97,70,0.3)] to-[rgba(0,255,166,0.3)]  text-xs font-medium px-3 py-1 rounded-full">
                                        {product.discount_present}% off
                                    </div>
                                )}

                                {/* Separator */}
                                <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block" />
                            </>
                        )}

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "w-4 h-4",
                                            i < Math.round(rating)
                                                ? "fill-[#FB923C] text-[#FB923C]"
                                                : "fill-gray-200 text-gray-200"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-600">
                                ( {product.review_count || 0} مراجعة )
                            </span>
                        </div>
                    </div>

                    {/* Title Row */}
                    <div className="flex items-start justify-between gap-3">
                        <h1 className="text-2xl font-medium  leading-relaxed">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-2 shrink-0">
                            <FavoriteButton
                                id={product.id}
                                type="product"
                                isFavorite={isFavorite}
                                className="w-8 h-8 rounded-full"
                                iconClassName="w-5 h-5"
                                onSuccess={() => setIsFavorite((prev) => !prev)}
                            />
                            {/* More menu (share/report) */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                </button>
                                {showMenu && (
                                    <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px] z-30">
                                        <button
                                            onClick={() => {
                                                setIsShareOpen(true);
                                                setShowMenu(false);
                                            }}
                                            className="flex cursor-pointer items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Share2 className="w-4 h-4" />
                                            مشاركة المنتج
                                        </button>
                                        {isProductOwner ? (
                                            <button
                                                disabled
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 cursor-not-allowed opacity-60"
                                            >
                                                <Flag className="w-4 h-4" />
                                                ابلاغ عن المنتج
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setIsReportOpen(true);
                                                    setShowMenu(false);
                                                }}
                                                className="flex cursor-pointer items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <Flag className="w-4 h-4" />
                                                ابلاغ عن المنتج
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <ReportAbuseModal
                                isOpen={isReportOpen}
                                onClose={() => setIsReportOpen(false)}
                                type="product"
                                id={product.id}
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-200" />

                    {product.condition && conditionLabel && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-[15px]">الحالة :</span>
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                                {conditionLabel}
                            </span>
                        </div>
                    )}

                    {attributes && attributes.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {attributes.map((attr) => (
                                <ReusableDropdown
                                    key={attr.id}
                                    placeholder={`اختر ${attr.title}`}
                                    options={attr.options?.map((option: AttributeOption) => ({
                                        value: option.id.toString(),
                                        label: option.title,
                                    })) || []}
                                    value={selectedVariations[attr.id] || ""}
                                    onChange={(val) => {
                                        const newSelections: Record<string, string> = {
                                            ...selectedVariations,
                                            [attr.id]: val,
                                        };
                                        setSelectedVariations(newSelections);
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-3">
                        {/* Phone Button */}
                        {storePhone && (
                            <a
                                href={`tel:${storePhone}`}
                                onClick={(e) => {
                                    if (!isPhoneRevealed) {
                                        e.preventDefault();
                                        setIsPhoneRevealed(true);
                                    }
                                }}
                                className="flex items-center justify-center gap-2 bg-blue-3 text-white h-11 rounded-full font-medium hover:opacity-90 transition-opacity"
                            >
                                <span dir="ltr">
                                    {isPhoneRevealed 
                                        ? storePhone
                                        : maskDisplayPhone(storePhone)}
                                </span>
                                <Phone className="w-5 h-5" />
                            </a>
                        )}

                        {/* Chat Button */}
                        <button
                            onClick={() => {
                                if (!user) { router.push(`/${lang}/login`); return; }
                                router.push(`/${lang}/chat?type=store&id=${store.id}&productId=${product.id}`);
                            }}
                            className="flex items-center justify-center gap-2 bg-white border border-blue-3 text-blue-3 h-11 cursor-pointer rounded-full font-medium  hover:bg-gray-50 transition-colors"
                        >
                            دردش
                            <Send className="w-5 h-5" />
                        </button>

                        {/* Compare Link */}
                        {!isInCompare ? (
                            <button
                                onClick={handleAddToCompare}
                                className="text-blue-4 text-sm font-medium underline underline-offset-4 cursor-pointer"
                            >
                                أضف هذا المنتج للمقارنة
                            </button>
                        ) : (
                            <button
                                onClick={handleRemoveFromCompare}
                                className="text-red-500 text-sm font-medium underline underline-offset-4 cursor-pointer"
                            >
                                إزالة من المقارنة
                            </button>
                        )}
                    </div>
                </div>


            </div>

            <ShareModal
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                shareUrl={typeof window !== "undefined" ? window.location.href : ""}
                title={product.name}
                description="قم بمشاركة هذا المنتج مع أصدقائك"
            />
        </div>
    );
}

function normalizeDisplayPhone(phone: unknown): string {
    if (phone == null) return "";
    const value = String(phone).trim();
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 4) return "";
    return value;
}

function maskDisplayPhone(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    if (digits.length <= 6) return phone;
    return phone.replace(/^\+?(\d{3}).*/, "+$1 *** ***");
}
