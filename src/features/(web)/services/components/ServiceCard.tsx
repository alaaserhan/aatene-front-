"use client";

import { useState, type MouseEvent } from "react";
import { Service, getService } from "../api";
import { cn, sanitizeMediaUrl } from "@/src/lib/utils";
import { formatPrice } from "@/src/lib/format-price";
import { shouldShowAskForPrice } from "@/src/lib/normalizeAskForPrice";
import { Star, MapPin, User } from "lucide-react";
import Image from "next/image";
import { CompareCheckbox } from "@/src/features/(web)/compares/components/CompareCheckbox";
import { FavoriteButton } from "@/src/features/(web)/fav/components/FavoriteButton";
import { useRouter, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useOpenChat } from "@/src/hooks/use-open-chat";
import { toast } from "sonner";
import { productAskForPriceButtonClassName } from "@/src/features/(web)/product/components/productAskForPriceButton";
import { VideoOrImage } from "@/src/components/ui/VideoOrImage";

interface ServiceCardProps {
    service: Service;
    className?: string;
    onClick?: () => void;
    onFavoriteClick?: (id: number) => void;
}

function normalizeStoreId(v: number | string | undefined | null): number | null {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
}

export default function ServiceCard({ service, className, onClick, onFavoriteClick }: ServiceCardProps) {
    const router = useRouter();
    const params = useParams();
    const lang = (params?.locale as string) || (params?.lang as string) || "ar";
    const qc = useQueryClient();
    const { openChat, isOpening: isOpeningChat } = useOpenChat();
    const [askPriceLoading, setAskPriceLoading] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [logoError, setLogoError] = useState(false);

    const price = parseFloat(service.price || "0");
    const shouldAskForPrice = shouldShowAskForPrice(service.ask_for_price, service.price);
    const cityName = service.store?.city?.name || "فلسطين";
    const providerName = service.store?.name || "مقدم الخدمة";
    // The rating in the provider row belongs to the store, not the service.
    const storeReviewCount = Number(service.store?.review_count || 0);
    const storeReviewRate = parseFloat(service.store?.review_rate || "0");

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            router.push(`/${lang}/services/${service.slug}`);
        }
    };

    const handleAskForPriceClick = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
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
            router.push(`/${lang}/services/${service.slug}`);
            return;
        }
        openChat({ type: "store", id: sid, serviceId: service.id, askPrice: true });
    };

    const serviceImage = sanitizeMediaUrl(
        service.image_url || service.images_urls?.[0] || ""
    );
    const serviceLogoSrc = sanitizeMediaUrl(service.store?.logo || "");

    return (
        <div
            className={cn(
                "bg-white overflow-hidden flex flex-col group cursor-pointer hover:shadow-sm rounded transition-all duration-300 w-full relative",
                className
            )}
            onClick={handleClick}
            dir="rtl"
        >
            <CompareCheckbox id={service.id} type="service" />

            <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
                {serviceImage && !imgError ? (
                    <VideoOrImage
                        src={serviceImage}
                        alt={service.title && !service.title.startsWith("http") ? service.title : "Service Image"}
                        fill
                        thumb
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Image src="/images/placeholders/product-placeholder.svg" alt="Placeholder" width={100} height={100} className="opacity-40" />
                    </div>
                )}

                <div
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="absolute top-3 left-3 z-10 w-10 h-10 rounded-full bg-[#ffffffc9] flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >
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
                    {service.title}
                </h3>

                <div className="flex justify-start w-full mb-4 h-9 items-center">
                    {shouldAskForPrice ? (
                        <button
                            type="button"
                            disabled={askPriceLoading || isOpeningChat}
                            className={cn(
                                productAskForPriceButtonClassName,
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

                <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10 shrink-0 rounded-full overflow-hidden shadow-sm ring-1 ring-gray-100 flex items-center justify-center bg-gray-50">
                        {serviceLogoSrc && !logoError ? (
                            <Image
                                src={serviceLogoSrc}
                                alt={providerName}
                                fill
                                className="object-cover"
                                onError={() => setLogoError(true)}
                            />
                        ) : (
                            <User className="w-6 h-6 text-gray-400" />
                        )}
                    </div>

                    <div className={"flex flex-col min-w-0 flex-1"}>
                        <p className="text-sm font-medium truncate">{providerName}</p>
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                <MapPin className="w-3 h-3 text-[#3D5E83] mb-px" />
                                <span className="truncate max-w-[60px] pt-0.5">{cityName}</span>
                            </div>
                            <div
                                className={cn("flex items-center gap-1 text-xs", {
                                hidden: !storeReviewCount,
                                })}
                            >
                                <Star className="w-3 h-3 fill-[#FFC220] text-[#FFC220]" />
                                <span className="font-medium text-[#FB923C] pt-1">
                                    {storeReviewRate.toFixed(1)}
                                </span>
                                <span className="whitespace-nowrap pt-1 text-gray-400">
                                    ({storeReviewCount})
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
