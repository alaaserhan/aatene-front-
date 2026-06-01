"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "../api";
import { formatPrice } from "@/src/lib/format-price";

interface CrossSellsSectionProps {
    crossSells: Product[];
    crossSellsPrice: string;
    crossSellsName?: string;
    crossSellsDescription?: string;
}

const PAGE_SIZE = 3;

function parsePrice(price?: string | null) {
    const value = Number.parseFloat(price || "0");
    return Number.isFinite(value) ? value : 0;
}

export default function CrossSellsSection({
    crossSells,
    crossSellsPrice,
    crossSellsName,
    crossSellsDescription
}: CrossSellsSectionProps) {
    const bundlePrice = parsePrice(crossSellsPrice);
    const originalTotal = crossSells.reduce((sum, product) => sum + parsePrice(product.price), 0);
    const totalPages = Math.ceil(crossSells.length / PAGE_SIZE);
    const [page, setPage] = useState(0);

    const visibleProducts = crossSells.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    if (crossSells.length === 0 || bundlePrice <= 0) {
        return null;
    }

    const savings = Math.max(0, originalTotal - bundlePrice);

    return (
        <section className="my-12 md:my-16 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" dir="rtl">
            <div className="flex flex-col gap-4 border-b border-gray-100 px-4 py-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-2">
                    <p className="text-xs font-semibold text-blue-4">عرض مجمع</p>
                    <h3 className="text-xl font-bold text-gray-900 md:text-2xl">
                        {crossSellsName || "اشترِ المنتجات معاً بسعر أفضل"}
                    </h3>
                    {crossSellsDescription && (
                        <p className="max-w-3xl break-words text-sm leading-7 text-gray-500 md:text-base">
                            {crossSellsDescription}
                        </p>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center gap-2 self-start">
                        <button
                            type="button"
                            onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                            disabled={page === totalPages - 1}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-blue-3 hover:text-blue-4 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="التالي"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <span className="min-w-10 text-center text-xs font-medium text-gray-500">
                            {page + 1} / {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPage((current) => Math.max(0, current - 1))}
                            disabled={page === 0}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-blue-3 hover:text-blue-4 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="السابق"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1fr_260px] lg:items-stretch">
                <div className="grid gap-3 sm:grid-cols-3">
                    {visibleProducts.map((product, index) => (
                        <div key={product.id} className="relative">
                            <Link
                                href={`/product/${product.slug}`}
                                className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors hover:border-blue-3"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                                    <Image
                                        src={product.cover || "/placeholder.png"}
                                        alt={product.name}
                                        fill
                                        sizes="(min-width: 1024px) 260px, (min-width: 640px) 33vw, 100vw"
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col gap-2 p-3">
                                    <p className="line-clamp-2 min-h-10 break-words text-sm font-semibold leading-5 text-gray-800 transition-colors group-hover:text-blue-4">
                                        {product.name}
                                    </p>
                                    <span className="mt-auto text-sm font-bold text-gray-900">
                                        {formatPrice(product.price)} <span className="text-xs font-medium">₪</span>
                                    </span>
                                </div>
                            </Link>

                            {index < visibleProducts.length - 1 && (
                                <span
                                    className="absolute left-1/2 top-full z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-4 text-lg font-semibold text-white shadow-sm sm:left-0 sm:top-1/2 sm:translate-x-1/2"
                                    aria-hidden="true"
                                >
                                    +
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex flex-col justify-between rounded-lg bg-gray-50 p-4 text-center lg:text-start">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">سعر العرض</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {formatPrice(crossSellsPrice)} <span className="text-base font-semibold">₪</span>
                        </p>
                        {originalTotal > bundlePrice && (
                            <p className="text-sm text-gray-500">
                                بدلاً من{" "}
                                <span className="font-semibold line-through">{formatPrice(originalTotal)} ₪</span>
                            </p>
                        )}
                    </div>

                    {savings > 0 && (
                        <div className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-1">
                            وفر {formatPrice(savings)} ₪
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
