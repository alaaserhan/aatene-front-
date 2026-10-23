"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Star, Trash2, Maximize2, PlusCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { formatPrice } from "@/src/lib/format-price";
import { normalizeAskForPrice } from "@/src/lib/normalizeAskForPrice";
import type { ChatTarget } from "@/src/lib/chat-links";
import { useOpenChat } from "@/src/hooks/use-open-chat";
import { getProductBySlug } from "@/src/features/(web)/product/api";
import { getService } from "@/src/features/(web)/services/api";
import { productAskForPriceButtonClassName } from "@/src/features/(web)/product/components/productAskForPriceButton";
import {
    useGetProductCompareList,
    useGetServiceCompareList,
    useRemoveProductFromCompare,
    useRemoveServiceFromCompare,
} from "./hooks";
import { FavoriteButton } from "../fav/components/FavoriteButton";
import { ProductCompareItem, ServiceCompareItem } from "./api";
import { SafeHTML } from "@/src/components/ui/SafeHTML";
import { VideoOrImage } from "@/src/components/ui/VideoOrImage";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";

type CompareType = "products" | "services";

const FAVORITE_BUTTON_CLASS =
    "w-9 h-9 border border-gray-200 rounded-md hover:scale-100 hover:bg-red-50 text-gray-500";

export default function ComparePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const compareType: CompareType = searchParams.get("type") === "services" ? "services" : "products";

    const setCompareType = (type: CompareType) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("type", type);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    const { data: productData, isLoading: isLoadingProducts } = useGetProductCompareList();
    const { data: serviceData, isLoading: isLoadingServices } = useGetServiceCompareList();

    const { mutate: removeProduct } = useRemoveProductFromCompare();
    const { mutate: removeService } = useRemoveServiceFromCompare();

    const products = productData?.compares || [];
    const services = serviceData?.services || [];
    const isLoading = compareType === "products" ? isLoadingProducts : isLoadingServices;

    const handleAddItem = () => {
        router.push(`/${compareType}?compare=${compareType}`);
    };

    const handleRemoveItem = (id: number) => {
        if (compareType === "products") {
            removeProduct(id);
        } else {
            removeService(id);
        }
    };

    const columns = compareType === "products"
        ? ["المنتج", "الوصف", "السعر", "التقييمات", "الإجراءات"]
        : ["الخدمة", "الوصف", "السعر", "التقييمات", "الإجراءات"];

    return (
        <div className="container mx-auto my-10 px-4 md:px-6" dir="rtl">
            <div className="flex flex-col gap-8">
                {/* Header Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Image src="/icons/Compare2.svg" alt="" width={40} height={40} />
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-medium text-black">المقارنة</h1>
                            <p className="text-gray-2 text-sm">اختر أي {compareType === "products" ? "منتج" : "خدمة"} لإظهار تفاصيلها</p>
                        </div>
                    </div>
                    <Tabs value={compareType} onValueChange={(value) => setCompareType(value as CompareType)}>
                        <TabsList>
                            <TabsTrigger value="products" className="group">
                                مقارنة المنتجات
                                <TabCount count={products.length} />
                            </TabsTrigger>
                            <TabsTrigger value="services" className="group">
                                مقارنة الخدمات
                                <TabCount count={services.length} />
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Compare Table */}
                <div className="w-full overflow-x-auto pb-6 -mb-6">
                    <div className="flex flex-col gap-4 min-w-[900px] pb-4">
                        {/* Table Header */}
                        <div className="bg-white border border-gray-200 rounded-lg flex items-center h-14 px-6 md:px-12 gap-6">
                            {columns.map((col, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "text-center text-sm font-medium text-gray-700",
                                        i === 0 ? "w-36 shrink-0" : "flex-1"
                                    )}
                                >
                                    {col}
                                </div>
                            ))}
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-20 bg-white border border-gray-200 rounded-lg">
                                <div className="w-8 h-8 border-4 border-blue-3 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        {/* Data Rows */}
                        {!isLoading && compareType === "products" && products.map((item) => (
                            <ProductCompareRow
                                key={item.id}
                                item={item}
                                onRemove={() => handleRemoveItem(item.id)}
                            />
                        ))}

                        {!isLoading && compareType === "services" && services.map((item) => (
                            <ServiceCompareRow
                                key={item.id}
                                item={item}
                                onRemove={() => handleRemoveItem(item.id)}
                            />
                        ))}

                        <div className="bg-white border border-c2-neutral-200 rounded-lg flex items-center px-6 md:px-12 py-6">
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="group w-36 h-36 shrink-0 rounded-3xl border-2 border-dashed border-c2-navy-300 bg-c2-navy-50 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer hover:border-c2-primary hover:bg-c2-navy-100"
                            >
                                <PlusCircle className="size-12 text-c2-primary transition-transform group-hover:scale-110" aria-hidden="true" />
                                <span className="text-sm font-medium text-c2-primary">أضف عنصرًا</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabCount({ count }: { count: number }) {
    if (count <= 0) return null;

    return (
        <span
            dir="ltr"
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-c2-navy-50 px-1.5 font-digits text-xs font-semibold leading-none tabular-nums text-c2-navy-700 group-data-[state=active]:bg-white"
        >
            {count}
        </span>
    );
}

// A missing or zero price is shown as "ask for price" even when the flag is off.
function isAskForPrice(askForPrice: unknown, price: number) {
    return normalizeAskForPrice(askForPrice) === true || !Number.isFinite(price) || price <= 0;
}

function toStoreId(value: number | string | null | undefined): number | null {
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
}

// Compare items carry no store, so it is looked up on click before opening the chat.
function AskForPriceButton({
    resolveStoreId,
    chatTarget,
    fallbackHref,
}: {
    resolveStoreId: () => Promise<number | null>;
    chatTarget: (storeId: number) => ChatTarget;
    fallbackHref: string | null;
}) {
    const router = useRouter();
    const { openChat, isOpening } = useOpenChat();
    const [isResolving, setIsResolving] = useState(false);
    const isBusy = isResolving || isOpening;

    const handleClick = async () => {
        let storeId: number | null = null;
        setIsResolving(true);
        try {
            storeId = await resolveStoreId();
        } catch {
            toast.error("تعذر تحميل بيانات المتجر. حاول مرة أخرى.");
        } finally {
            setIsResolving(false);
        }
        if (!storeId) {
            if (fallbackHref) router.push(fallbackHref);
            else toast.error("لا يمكن فتح المحادثة لهذا العنصر.");
            return;
        }
        openChat(chatTarget(storeId));
    };

    return (
        <button
            type="button"
            disabled={isBusy}
            onClick={handleClick}
            className={cn(productAskForPriceButtonClassName, isBusy && "opacity-75 cursor-wait pointer-events-none")}
        >
            {isBusy ? "جاري الفتح…" : "اطلب السعر"}
        </button>
    );
}

// ─── Product Row ─────────────────────────────────────────────

function ProductCompareRow({ item, onRemove }: { item: ProductCompareItem; onRemove: () => void }) {
    const price = parseFloat(item.price || "0");
    const priceAfterDiscount = parseFloat(item.price_after_discount || "0");
    const hasDiscount = item.discount_present > 0 && priceAfterDiscount > 0;
    const askForPrice = isAskForPrice(item.ask_for_price, hasDiscount ? priceAfterDiscount : price);
    const rating = parseFloat(item.review_rate || "0");
    const reviewCount = parseInt(item.review_count || "0");
    const router = useRouter();

    return (
        <div className="bg-white border border-gray-200/80 rounded-lg flex items-center px-6 md:px-12 py-6 gap-6">
            {/* Product Image + Name */}
            <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="relative w-36 h-36 rounded-3xl overflow-hidden bg-gray-100">
                    <VideoOrImage
                        src={item.cover || "/placeholder.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                       
                    />
                </div>
                <p className="font-medium text-xs text-gray-700 text-right w-36 line-clamp-3 leading-relaxed">
                    {item.name}
                </p>
            </div>

            <div
                className="flex-1 text-right text-xs text-black leading-relaxed line-clamp-6"
            >
                <SafeHTML html={item.description || item.short_description} fallback="لا يوجد وصف" />
            </div>



            {/* Price */}
            <div className="flex-1 flex flex-col items-center justify-center gap-1">
                {askForPrice ? (
                    <AskForPriceButton
                        resolveStoreId={async () => {
                            if (!item.slug) return null;
                            const res = await getProductBySlug(item.slug);
                            return res.status ? toStoreId(res.store?.id) : null;
                        }}
                        chatTarget={(storeId) => ({ type: "store", id: storeId, productId: item.id, askPrice: true })}
                        fallbackHref={item.slug ? `/products/${item.slug}` : null}
                    />
                ) : (
                    <>
                        <span className="text-2xl text-gray-700">
                            {formatPrice(hasDiscount ? priceAfterDiscount : price)} ₪
                        </span>
                        {hasDiscount && (
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-red-500 line-through">{formatPrice(price)} ₪</span>
                                <span className="bg-black text-white text-xs font-medium px-3 py-0.5 rounded-full">
                                    {item.discount_present}% off
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Rating */}
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <span className="text-3xl font-medium text-amber-400">{rating.toFixed(1)}</span>
                <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                            key={s}
                            className="w-4 h-4"
                            style={{
                                color: s <= Math.round(rating) ? "#FFBC1F" : "#D1D5DB",
                                fill: s <= Math.round(rating) ? "#FFBC1F" : "none",
                            }}
                        />
                    ))}
                </div>
                <span className="text-sm text-gray-500">( {reviewCount} مراجعة )</span>
            </div>
            {/* Action Buttons */}
            <div className="flex-1 flex items-center justify-center gap-2">
                <button onClick={onRemove} className="w-9 h-9 border border-gray-200 rounded-md flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4 text-gray-500" />
                </button>
                <FavoriteButton
                    id={item.id}
                    type="product"
                    isFavorite={item.is_favorite}
                    className={cn(FAVORITE_BUTTON_CLASS, item.is_favorite && "bg-red-50 border-red-200")}
                    iconClassName="size-4"
                />
                <button onClick={() => router.push(`/products/${item.slug}`)} className="w-9 h-9 border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <Maximize2 className="w-4 h-4 text-gray-500" />
                </button>
            </div>

        </div>
    );
}

// ─── Service Row ─────────────────────────────────────────────

function ServiceCompareRow({ item, onRemove }: { item: ServiceCompareItem; onRemove: () => void }) {
    const price = parseFloat(item.price || "0");
    const rating = parseFloat(item.review_rate || "0");
    const reviewCount = parseInt(item.review_count || "0");
    const router = useRouter();

    return (
        <div className="bg-white border border-gray-200/80 rounded-lg flex items-center px-6 md:px-12 py-6 gap-6">
            {/* Service Image + Name */}
            <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="relative w-36 h-36 rounded-3xl overflow-hidden bg-gray-100">
                    <VideoOrImage
                        src={item.image_url || item.images_urls?.[0] || "/placeholder.png"}
                        alt={item.title}
                        fill
                        className="object-cover"
                    />
                </div>
                <p className="font-medium text-xs text-gray-700 text-right w-36 line-clamp-3 leading-relaxed">
                    {item.title}
                </p>
            </div>

            <div
                className="flex-1 text-right text-xs text-black leading-relaxed line-clamp-6"
            >
                <SafeHTML html={item.description} fallback="لا يوجد وصف" />
            </div>

            {/* Price */}
            <div className="flex-1 flex flex-col items-center justify-center gap-1">
                {isAskForPrice(item.ask_for_price, price) ? (
                    <AskForPriceButton
                        resolveStoreId={async () => {
                            const res = await getService(item.slug);
                            return res.status ? toStoreId(res.service?.store?.id) : null;
                        }}
                        chatTarget={(storeId) => ({ type: "store", id: storeId, serviceId: item.id, askPrice: true })}
                        fallbackHref={`/services/${item.slug}`}
                    />
                ) : (
                    <span className="text-2xl text-gray-700">
                        {formatPrice(price)} ₪
                    </span>
                )}
            </div>

            {/* Execute Type */}
            {/* <div className="flex-1 text-center text-sm text-gray-700">
                {item.execute_type || "عند الطلب"}
            </div> */}

            {/* Rating */}
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <span className="text-3xl font-medium text-amber-400">{rating.toFixed(1)}</span>
                <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                            key={s}
                            className="w-4 h-4"
                            style={{
                                color: s <= Math.round(rating) ? "#FFBC1F" : "#D1D5DB",
                                fill: s <= Math.round(rating) ? "#FFBC1F" : "none",
                            }}
                        />
                    ))}
                </div>
                <span className="text-sm text-gray-500">( {reviewCount} مراجعة )</span>
            </div>

            {/* Action Buttons */}
            <div className="flex-1 flex items-center justify-center gap-2">
                <button onClick={onRemove} className="w-9 h-9 border border-gray-200 rounded-md flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4 text-gray-500" />
                </button>
                <FavoriteButton
                    id={item.id}
                    type="service"
                    isFavorite={item.is_favorite}
                    className={cn(FAVORITE_BUTTON_CLASS, item.is_favorite && "bg-red-50 border-red-200")}
                    iconClassName="size-4"
                />
                <button onClick={() => router.push(`/services/${item.slug}`)} className="w-9 h-9 border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <Maximize2 className="w-4 h-4 text-gray-500" />
                </button>
            </div>
        </div>
    );
}
