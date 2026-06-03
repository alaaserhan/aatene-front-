"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useGetProductBySlug, useGetProductPageDataBySlug } from "./hooks";
import { Loader2 } from "lucide-react";
import ProductHero from "./components/ProductHero";
import ShippingPolicies from "./components/ShippingPolicies";
import StoreInfoBar from "./components/StoreInfoBar";
import CrossSellsSection from "./components/CrossSellsSection";
import ProductTabs from "./components/ProductTabs";
import ProductsChooseForYou from "./components/ProductsChooseForYou";
import StoresYouMayLike from "./components/StoresYouMayLike";

function firstStringField(source: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim()) return value;
    }
    return undefined;
}

export default function ProductDetailsPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [selectedDeliveryCityId, setSelectedDeliveryCityId] = useState<number | null>(null);
    const { data, isLoading, isError } = useGetProductBySlug(slug);
    const { data: pageData } = useGetProductPageDataBySlug(slug, selectedDeliveryCityId);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const savedCity = localStorage.getItem("selected_delivery_city");
        if (!savedCity) return;

        try {
            const parsed = JSON.parse(savedCity) as { id?: number };
            if (parsed.id) setSelectedDeliveryCityId(parsed.id);
        } catch {
            return;
        }
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-40">
                <Loader2 className="w-10 h-10 animate-spin text-blue-3" />
            </div>
        );
    }

    if (isError || !data?.product) {
        notFound();
    }

    const { product, store, attributes } = data;
    const productRecord = product as unknown as Record<string, unknown>;
    const crossSellsName = firstStringField(productRecord, [
        "cross_sells_name",
        "cross_sells_title",
        "cross_sells_offer_name",
    ]);
    const crossSellsDescription = firstStringField(productRecord, [
        "cross_sells_description",
        "cross_sells_offer_description",
    ]);

    return (
        <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8 lg:px-16 py-8" dir="rtl">
            {/* Component 1: Product Hero with Image Gallery & Info */}
            <ProductHero
                product={product}
                store={store}
                attributes={attributes}
            />

            {/* Component 2: Shipping & Policies */}

            <ShippingPolicies
                product={product}
                store={store}
                shippingCompany={pageData?.shippingCompany}
                shippingDetails={pageData?.shippingDetails}
                allShippingCompanies={pageData?.allShippingCompanies}
                deliveryType={pageData?.delivery_type ?? store.delivery_type}
                onCityChange={(city) => setSelectedDeliveryCityId(city.id)}
            />

            {/* Component 3: Store Info Bar */}
            <StoreInfoBar store={store} />

            {/* Component 5: Cross-Sells Bundle */}
            {product.crossSells && product.crossSells.length > 0 && (
                <CrossSellsSection
                    crossSells={product.crossSells}
                    crossSellsPrice={product.cross_sells_price}
                    crossSellsName={crossSellsName}
                    crossSellsDescription={crossSellsDescription}
                />
            )}

            {/* Component 4: Description & Reviews Tabs */}
            <ProductTabs product={product} store={store} />

            {/* Component 5: Products Choose For You */}
            {pageData?.productsChooseForYou && pageData.productsChooseForYou.length > 0 && (
                <ProductsChooseForYou products={pageData.productsChooseForYou} />
            )}

            {/* Component 6: Stores You May Like */}
            {pageData?.storesYouMayLike && pageData.storesYouMayLike.length > 0 && (
                <StoresYouMayLike stores={pageData.storesYouMayLike} />
            )}
        </div>
    );
}
