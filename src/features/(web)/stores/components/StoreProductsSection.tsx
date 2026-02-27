"use client";

import { useState, useEffect } from "react";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/src/lib/utils";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import ServiceCard from "@/src/features/(web)/services/components/ServiceCard";
import { Pagination } from "@/src/components/ui/Pagination";
import { useStoreProducts } from "../hooks";
import { useSearchServices } from "@/src/features/(web)/searchAndFilter/hooks";

interface StoreProductsSectionProps {
    storeId: number;
    storeType?: string;
    sections: { id: number; name: string; products_count: string }[];
}

export default function StoreProductsSection({ storeId, storeType, sections }: StoreProductsSectionProps) {
    const [selectedSection, setSelectedSection] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const isService = storeType === "services" || storeType === "service";

    // Products query
    const { data: productsData, isLoading: isLoadingProducts } = useStoreProducts(storeId, selectedSection, page, debouncedSearch, !isService);

    // Services query
    const { data: servicesData, isLoading: isLoadingServices } = useSearchServices({
        store_id: storeId,
        search: debouncedSearch,
        category_id: selectedSection || undefined,
        page,
        per_page: 12
    }, isService);

    const items = isService ? (servicesData?.services || []) : (productsData?.products || []);
    const totalItems = isService ? (servicesData?.total || 0) : (productsData?.total || 0);
    const totalPages = Math.ceil(totalItems / 12) || 1;
    const isLoading = isService ? isLoadingServices : isLoadingProducts;

    const handleSectionChange = (sectionId: number | null) => {
        setSelectedSection(sectionId);
        setPage(1);
    };

    if (!sections || sections.length === 0) return null;

    return (
        <div className="my-8 mt-16">
            <h2 className=" text-2xl font-medium mb-4 " dir="rtl">{isService ? "كل الخدمات" : "كل المنتجات"}</h2>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" dir="rtl">
                <aside className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-4">
                        <h3 className="font-medium mb-5 text-base border-none pb-0">أقسام المتجر</h3>
                        <ul className="space-y-4">
                            <li>
                                <button
                                    onClick={() => handleSectionChange(null)}
                                    className={cn(
                                        "w-full flex items-center justify-between transition-colors cursor-pointer",
                                        selectedSection === null
                                            ? "text-blue-3 font-medium border-r-2 border-blue-3 pr-2 bg-transparent"
                                            : "text-gray-600 hover:text-gray-900 font-medium border-r-2 border-transparent pr-2 bg-transparent"
                                    )}
                                >
                                    <span className="text-[15px]">الكل</span>
                                    <span className="text-[15px]" dir="ltr">({sections.reduce((acc, s) => acc + Number(s.products_count || 0), 0)})</span>
                                </button>
                            </li>
                            {sections.map(section => (
                                <li key={section.id}>
                                    <button
                                        onClick={() => handleSectionChange(section.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between transition-colors cursor-pointer",
                                            selectedSection === section.id
                                                ? "text-blue-3 font-medium border-r-2 border-blue-3 pr-2 bg-transparent"
                                                : "text-gray-600 hover:text-gray-900 font-medium border-r-2 border-transparent pr-2 bg-transparent"
                                        )}
                                    >
                                        <span className="text-[15px]">{section.name}</span>
                                        <span className="text-[15px]" dir="ltr">({section.products_count})</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="relative w-full bg-white rounded-full">
                        <input
                            type="text"
                            placeholder={isService ? "ابحث عن خدمة..." : "ابحث عن منتج..."}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pr-4 py-3 border border-blue-4 rounded-full text-sm focus:outline-none focus:border-blue-3 focus:ring-1 focus:ring-blue-3 transition-colors"
                        />
                        <div className="w-8 h-8 bg-blue-4 rounded-full  absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none flex  items-center justify-center">
                            <Search className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-10">
                            <Loader2 className="animate-spin text-blue-3" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">{isService ? "لا توجد خدمات" : "لا توجد منتجات"}</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {items.map((item: any) => (
                                    isService ? (
                                        <ServiceCard
                                            key={item.id}
                                            service={item}
                                        />
                                    ) : (
                                        <ProductCard
                                            key={item.id}
                                            id={item.id}
                                            name={item.name}
                                            slug={item.slug}
                                            cover={item.cover || "/placeholder.png"}
                                            price={item.price}
                                            priceAfterDiscount={item.price_after_discount}
                                            discountPercent={item.discount_present}
                                            reviewRate={item.review_rate}
                                            reviewCount={item.review_count}
                                            isFavorite={item.is_favorite}
                                        />
                                    )
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <div className="mt-6 flex justify-center w-full" dir="rtl">
                                    <Pagination
                                        totalPages={totalPages}
                                        currentPage={page}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
