"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Star, Trash2, Heart, Maximize2, PlusCircle, ArrowLeftRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { formatPrice } from "@/src/lib/format-price";
import { useQueryClient } from "@tanstack/react-query";
import {
    useGetProductCompareList,
    useGetServiceCompareList,
    useRemoveProductFromCompare,
    useRemoveServiceFromCompare,
    useClearProductCompareList,
    useClearServiceCompareList,
    COMPARE_QK,
} from "./hooks";
import { AddToFavoritesModal } from "../fav/components/AddToFavoritesModal";
import { useRemoveFromFavorites } from "../fav/hooks";
import { ProductCompareItem, ServiceCompareItem } from "./api";
import { SafeHTML } from "@/src/components/ui/SafeHTML";

type CompareType = "products" | "services";

export default function ComparePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { mutate: removeFromFav } = useRemoveFromFavorites();
    const initialType = searchParams.get("type") as CompareType;
    const [compareType, setCompareType] = useState<CompareType>(initialType === "services" ? "services" : "products");

    // Modal State
    const [isFavModalOpen, setIsFavModalOpen] = useState(false);
    const [favModalItem, setFavModalItem] = useState<{ id: number | string; isFavorite: boolean } | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (params.get("type") !== compareType) {
            params.set("type", compareType);
            router.replace(`?${params.toString()}`, { scroll: false });
        }
    }, [compareType, router, searchParams]);

    // Fetch compare lists
    const { data: productData, isLoading: isLoadingProducts } = useGetProductCompareList();
    const { data: serviceData, isLoading: isLoadingServices } = useGetServiceCompareList();

    // Mutations
    const { mutate: removeProduct } = useRemoveProductFromCompare();
    const { mutate: removeService } = useRemoveServiceFromCompare();
    const { mutate: clearProducts } = useClearProductCompareList();
    const { mutate: clearServices } = useClearServiceCompareList();

    const products = productData?.compares || [];
    const services = serviceData?.services || [];
    const isLoading = compareType === "products" ? isLoadingProducts : isLoadingServices;

    const handleAddItem = () => {
        router.push(`/search?type=${compareType}&compare=${compareType}`);
    };

    const handleRemoveItem = (id: number) => {
        if (compareType === "products") {
            removeProduct(id);
        } else {
            removeService(id);
        }
    };

    const handleClear = () => {
        if (compareType === "products") {
            clearProducts();
        } else {
            clearServices();
        }
    };


    const handleToggleFavorite = (item: { id: number | string; isFavorite: boolean }) => {
        if (item.isFavorite) {
            removeFromFav({
                favs_type: compareType === "products" ? "product" : "service",
                favs_id: item.id
            }, {
                onSuccess: () => {
                    handleFavSuccess();
                }
            });
        } else {
            setFavModalItem(item);
            setIsFavModalOpen(true);
        }
    };

    const handleFavSuccess = () => {
        // Invalidate specific compare list to update the heart icon
        if (compareType === "products") {
            queryClient.invalidateQueries({ queryKey: COMPARE_QK.products.list });
        } else {
            queryClient.invalidateQueries({ queryKey: COMPARE_QK.services.list });
        }
    };

    // Table columns
    const columns = compareType === "products"
        ? ["المنتج", "الوصف", "السعر", "رسوم التوصيل", "التقييمات", "الإجراءات"]
        : ["الخدمة", "الوصف", "السعر", "التقييمات", "الإجراءات"];

    return (
        <div className="container mx-auto my-10 px-4 md:px-6" dir="rtl">
            <div className="flex flex-col gap-8">
                {/* Header Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src="/icons/Compare2.svg" alt="compare" width={40} height={40} />
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-medium text-black">المقارنة</h1>
                            <p className="text-gray-2 text-sm">اختر أي {compareType === "products" ? "منتج" : "خدمة"} لإظهار تفاصيلها</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCompareType("products")}
                            className={cn(
                                "text-sm px-6 py-2 rounded-md font-medium transition-colors cursor-pointer",
                                compareType === "products"
                                    ? "bg-blue-4 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            مقارنة المنتجات
                        </button>
                        <button
                            onClick={() => setCompareType("services")}
                            className={cn(
                                "text-sm px-6 py-2 rounded-md font-medium transition-colors cursor-pointer",
                                compareType === "services"
                                    ? "bg-blue-4 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            مقارنة الخدمات
                        </button>
                    </div>
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
                                onToggleFavorite={() => handleToggleFavorite({ id: item.id, isFavorite: item.is_favorite })}
                            />
                        ))}

                        {!isLoading && compareType === "services" && services.map((item) => (
                            <ServiceCompareRow
                                key={item.id}
                                item={item}
                                onRemove={() => handleRemoveItem(item.id)}
                                onToggleFavorite={() => handleToggleFavorite({ id: item.id, isFavorite: item.is_favorite })}
                            />
                        ))}

                        {/* Empty Placeholder Row */}
                        <div className="bg-gray-50/70 border border-gray-200/60 rounded-lg flex items-center px-6 md:px-12 py-8 opacity-70 gap-6">
                            {/* Add Item Button */}
                            <div className="w-36 shrink-0 flex flex-col items-center justify-center gap-3">
                                <button
                                    onClick={handleAddItem}
                                    className="w-36 h-36 rounded-3xl bg-gray-100 border border-gray-200/50 flex flex-col items-center justify-center gap-2 hover:bg-gray-200/60 transition-colors cursor-pointer group"
                                >
                                    <PlusCircle className="w-14 h-14 text-blue-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-blue-3 text-[10px] font-medium">أضف عنصر</span>
                                </button>
                                {/* Placeholder info */}
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col gap-1">
                                        <div className="w-20 h-2 bg-gray-200/50 rounded-full" />
                                        <div className="w-20 h-2 bg-gray-200/50 rounded-full" />
                                    </div>
                                    <div className="w-6 h-6 bg-gray-200/50 rounded-full" />
                                </div>
                            </div>

                            {/* Description placeholder */}
                            <div className="flex-1 flex flex-col items-center justify-center gap-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-full h-2 bg-gray-200/50 rounded-full" />
                                ))}
                            </div>

                            {/* Price placeholder */}
                            <div className="flex-1 flex flex-col items-center justify-center gap-2">
                                <div className="w-16 h-4 bg-gray-200/50 rounded-full" />
                                <div className="w-12 h-2 bg-gray-200/50 rounded-full" />
                            </div>

                            {/* Delivery/Execute placeholder */}
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-16 h-3 bg-gray-200/50 rounded-full" />
                            </div>

                            {/* Rating placeholder */}
                            <div className="flex-1 flex flex-col items-center justify-center gap-2">
                                <div className="w-12 h-6 bg-gray-200/50 rounded-full" />
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="w-3 h-3 bg-gray-200/50 rounded-full" />
                                    ))}
                                </div>
                            </div>

                            {/* Action placeholders */}
                            <div className="flex-1 flex items-center justify-center gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-9 h-9 bg-gray-200/50 rounded-md" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {favModalItem && (
                <AddToFavoritesModal
                    isOpen={isFavModalOpen}
                    onClose={() => setIsFavModalOpen(false)}
                    type={compareType === "products" ? "product" : "service"}
                    itemId={favModalItem.id}
                    isFavorite={favModalItem.isFavorite}
                    onSuccess={handleFavSuccess}
                />
            )}
        </div>
    );
}

// ─── Product Row ─────────────────────────────────────────────

function ProductCompareRow({ item, onRemove, onToggleFavorite }: { item: ProductCompareItem; onRemove: () => void; onToggleFavorite: () => void }) {
    const price = parseFloat(item.price || "0");
    const priceAfterDiscount = parseFloat(item.price_after_discount || "0");
    const hasDiscount = item.discount_present > 0;
    const rating = parseFloat(item.review_rate || "0");
    const reviewCount = parseInt(item.review_count || "0");
    const router = useRouter();

    return (
        <div className="bg-white border border-gray-200/80 rounded-lg flex items-center px-6 md:px-12 py-6 gap-6">
            {/* Product Image + Name */}
            <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="relative w-36 h-36 rounded-3xl overflow-hidden bg-gray-100">
                    <Image
                        src={item.cover || "/placeholder.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                            e.currentTarget.src = "/placeholder.png";
                        }}
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
            </div>

            {/* Delivery Fee */}
            <div className="flex-1 text-center text-base text-black">
                {formatPrice(price)} ₪
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
                <button
                    onClick={onToggleFavorite}
                    className={cn(
                        "w-9 h-9 border border-gray-200 rounded-md flex items-center justify-center transition-colors cursor-pointer",
                        item.is_favorite ? "bg-red-50 border-red-200" : "hover:bg-red-50"
                    )}
                >
                    <Heart className={cn("w-4 h-4", item.is_favorite ? "text-red-500 fill-red-500" : "text-gray-500")} />
                </button>
                <button onClick={() => router.push(`/product/${item.slug}`)} className="w-9 h-9 border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <Maximize2 className="w-4 h-4 text-gray-500" />
                </button>
            </div>

        </div>
    );
}

// ─── Service Row ─────────────────────────────────────────────

function ServiceCompareRow({ item, onRemove, onToggleFavorite }: { item: ServiceCompareItem; onRemove: () => void; onToggleFavorite: () => void }) {
    const price = parseFloat(item.price || "0");
    const rating = parseFloat(item.review_rate || "0");
    const reviewCount = parseInt(item.review_count || "0");
    const router = useRouter();

    return (
        <div className="bg-white border border-gray-200/80 rounded-lg flex items-center px-6 md:px-12 py-6 gap-6">
            {/* Service Image + Name */}
            <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="relative w-36 h-36 rounded-3xl overflow-hidden bg-gray-100">
                    <Image
                        src={item.image_url || item.images_urls?.[0] || "/placeholder.png"}
                        alt={item.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                            e.currentTarget.src = "/placeholder.png";
                        }}
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
                <span className="text-2xl text-gray-700">
                    {formatPrice(price)} ₪
                </span>
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
                <button
                    onClick={onToggleFavorite}
                    className={cn(
                        "w-9 h-9 border border-gray-200 rounded-md flex items-center justify-center transition-colors cursor-pointer",
                        item.is_favorite ? "bg-red-50 border-red-200" : "hover:bg-red-50"
                    )}
                >
                    <Heart className={cn("w-4 h-4", item.is_favorite ? "text-red-500 fill-red-500" : "text-gray-500")} />
                </button>
                <button onClick={() => router.push(`/services/${item.slug}`)} className="w-9 h-9 border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <Maximize2 className="w-4 h-4 text-gray-500" />
                </button>
            </div>
        </div>
    );
}
