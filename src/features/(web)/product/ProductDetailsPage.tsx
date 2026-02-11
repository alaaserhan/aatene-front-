"use client";

import { useParams } from "next/navigation";
import { useGetProductBySlug } from "./hooks";
import { Loader2 } from "lucide-react";
import ProductHero from "./components/ProductHero";
import ShippingPolicies from "./components/ShippingPolicies";
import StoreInfoBar from "./components/StoreInfoBar";
import CrossSellsSection from "./components/CrossSellsSection";

export default function ProductDetailsPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const { data, isLoading, isError } = useGetProductBySlug(slug);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-40">
                <Loader2 className="w-10 h-10 animate-spin text-blue-3" />
            </div>
        );
    }

    if (isError || !data?.product) {
        return (
            <div className="text-center py-40" dir="rtl">
                <p className="text-gray-500 text-lg">عذراً، لم يتم العثور على المنتج</p>
            </div>
        );
    }

    const { product, store, attributes, similar, categories } = data;

    return (
        <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8 lg:px-16 py-8" dir="rtl">
            {/* Component 1: Product Hero with Image Gallery & Info */}
            <ProductHero
                product={product}
                store={store}
                attributes={attributes}
            />

            {/* Component 2: Shipping & Policies */}
            <ShippingPolicies product={product} store={store} />

            {/* Component 3: Store Info Bar */}
            <StoreInfoBar store={store} />

            {/* Component 4: Cross-Sells Bundle */}
            {product.crossSells && product.crossSells.length > 0 && (
                <CrossSellsSection
                    crossSells={product.crossSells}
                    crossSellsPrice={product.cross_sells_price}
                />
            )}
        </div>
    );
}
