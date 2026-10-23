"use client";

import { memo, useState, type MouseEvent } from "react";
import { Service, getService } from "../api";
import { cn, isVideoFile, resolveImageSrc, sanitizeMediaUrl } from "@/src/lib/utils";
import { formatPrice } from "@/src/lib/format-price";
import { shouldShowAskForPrice } from "@/src/lib/normalizeAskForPrice";
import { Star, MapPin, User } from "lucide-react";
import Image from "next/image";
import { CompareCheckbox } from "@/src/features/(web)/compares/components/CompareCheckbox";
import { FavoriteButton } from "@/src/features/(web)/fav/components/FavoriteButton";
import { CardLink, CARD_ACTION } from "@/src/components/shared/CardLink";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useOpenChat } from "@/src/hooks/use-open-chat";
import { useLanguage } from "@/src/hooks/use-language";
import { toast } from "sonner";
import { productAskForPriceButtonClassName } from "@/src/features/(web)/product/components/productAskForPriceButton";
import { HoverPlayVideo } from "@/src/components/ui/HoverPlayVideo";

interface ServiceCardProps {
    service: Service;
    className?: string;
    onFavoriteClick?: (id: number) => void;
}

function normalizeStoreId(v: number | string | undefined | null): number | null {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
}

function ServiceCard({ service, className, onFavoriteClick }: ServiceCardProps) {
    const router = useRouter();
    const lang = useLanguage();
    const qc = useQueryClient();
    const { openChat, isOpening: isOpeningChat } = useOpenChat();
    const [askPriceLoading, setAskPriceLoading] = useState(false);
    const [logoError, setLogoError] = useState(false);

    const href = `/${lang}/services/${service.slug}`;
    const price = parseFloat(service.price || "0");
    const shouldAskForPrice = shouldShowAskForPrice(service.ask_for_price, service.price);
    const cityName = service.store?.city?.name || "فلسطين";
    const providerName = service.store?.name || "مقدم الخدمة";
    // The rating in the provider row belongs to the store. Some payloads (favorites
    // rows, for one) ship the service without store review fields, so fall back to
    // the service's own rating instead of leaving the row blank.
    const storeReviewCount = Number(service.store?.review_count || 0);
    const storeReviewRate = parseFloat(service.store?.review_rate || "0");
    const hasStoreRating = storeReviewCount > 0 && storeReviewRate > 0;
    const reviewCount = hasStoreRating ? storeReviewCount : Number(service.review_count || 0);
    const reviewRate = hasStoreRating ? storeReviewRate : parseFloat(service.review_rate || "0");

    const handleAskForPriceClick = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        let sid = normalizeStoreId(service.store?.id);
        if (!sid) {
            setAskPriceLoading(true);
            try {
                const res = await getService(service.slug);
                if (res.status && res.service?.store?.id != null) {
                    sid = normalizeStoreId(res.service.store.id);
                }
            } catch {
                toast.error("تعذر تحميل بيانات المتجر. حاول مرة أخرى.");
            } finally {
                setAskPriceLoading(false);
            }
        }
        if (!sid) {
            router.push(href);
            return;
        }
        openChat({ type: "store", id: sid, serviceId: service.id, askPrice: true });
    };

    const serviceImage = sanitizeMediaUrl(
        service.image_url || service.images_urls?.[0] || ""
    );
    const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
    const isVideoCover = isVideoFile(serviceImage);
    // `logo` is the raw storage path; `logo_url` is the absolute one the API exposes.
    const serviceLogoSrc = sanitizeMediaUrl(service.store?.logo_url || "");
    // The link overlay covers the video, so the card reports hover on its behalf.
    const [isHovered, setIsHovered] = useState(false);

    return (
        <article
            className={cn(
                "bg-white overflow-hidden flex flex-col group hover:shadow-sm rounded transition-all duration-300 w-full relative isolate",
                className
            )}
            dir="rtl"
            onMouseEnter={isVideoCover ? () => setIsHovered(true) : undefined}
            onMouseLeave={isVideoCover ? () => setIsHovered(false) : undefined}
        >
            <CompareCheckbox id={service.id} type="service" className={CARD_ACTION} />

            <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
                {isVideoCover ? (
                    <HoverPlayVideo
                        src={serviceImage}
                        className="absolute inset-0"
                        videoClassName="transition-transform duration-700 group-hover:scale-110"
                        hovered={isHovered}
                    />
                ) : serviceImage ? (
                    <Image
                        src={resolveImageSrc(serviceImage, failedImageUrl, "product")}
                        alt={service.title && !service.title.startsWith("http") ? service.title : "صورة الخدمة"}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 320px"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={() => setFailedImageUrl(serviceImage)}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Image src="/images/placeholders/product-placeholder.svg" alt="" width={100} height={100} className="opacity-40" />
                    </div>
                )}

                <div className="absolute top-3 left-3 z-2 w-10 h-10 rounded-full bg-[#ffffffc9] flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                    <FavoriteButton
                        id={service.id}
                        type="service"
                        isFavorite={service.is_favorite}
                        onSuccess={() => {
                            qc.invalidateQueries();
                            router.refresh();
                            onFavoriteClick?.(service.id);
                        }}
                        className="w-full h-full rounded-full"
                        iconClassName="w-5 h-5"
                    />
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-base text-right mb-2 leading-snug line-clamp-2 min-h-10 group-hover:text-[#3D5E83] transition-colors">
                    <CardLink href={href} className="after:rounded">
                        {service.title}
                    </CardLink>
                </h3>

                <div className="flex justify-start w-full mb-4 h-9 items-center">
                    {shouldAskForPrice ? (
                        <button
                            type="button"
                            disabled={askPriceLoading || isOpeningChat}
                            className={cn(
                                productAskForPriceButtonClassName,
                                CARD_ACTION,
                                "w-full max-w-full sm:w-auto",
                                (askPriceLoading || isOpeningChat) && "opacity-75 cursor-wait pointer-events-none"
                            )}
                            onClick={handleAskForPriceClick}
                        >
                            {askPriceLoading || isOpeningChat ? "جاري الفتح…" : "اطلب السعر"}
                        </button>
                    ) : (
                        <p className="flex font-medium items-baseline gap-1 h-9">
                            <span>{formatPrice(price)}</span>
                            <span className="text-xl">₪</span>
                        </p>
                    )}
                </div>

                <div className="h-px bg-gray-200 w-full mb-2" />

                {/* Store info and rating share one row, wrapping to two lines when the card is narrow. */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1 basis-37.5">
                        <div className="relative w-10 h-10 shrink-0 rounded-full overflow-hidden shadow-sm ring-1 ring-gray-100 flex items-center justify-center bg-gray-50">
                            {serviceLogoSrc && !logoError ? (
                                <Image
                                    src={serviceLogoSrc}
                                    alt={providerName}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <User className="w-6 h-6 text-gray-400" />
                            )}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{providerName}</p>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                                <MapPin className="w-3 h-3 shrink-0 text-[#3D5E83] mb-px" />
                                <span className="truncate pt-0.5">{cityName}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs shrink-0">
                        <Star
                            className={cn(
                                "w-3 h-3",
                                reviewCount
                                    ? "fill-[#FFC220] text-[#FFC220]"
                                    : "fill-gray-200 text-gray-200"
                            )}
                        />
                        <span
                            className={cn(
                                "font-medium pt-1",
                                reviewCount ? "text-[#FB923C]" : "text-gray-400"
                            )}
                        >
                            {reviewRate.toFixed(1)}
                        </span>
                        <span className="whitespace-nowrap pt-1 text-gray-400">
                            ({reviewCount})
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default memo(ServiceCard);
