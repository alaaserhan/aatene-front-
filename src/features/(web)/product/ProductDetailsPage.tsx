"use client";

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

export default function ProductDetailsPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const { data, isLoading, isError } = useGetProductBySlug(slug);
    const { data: pageData } = useGetProductPageDataBySlug(slug);

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
            />

            {/* Component 3: Store Info Bar */}
            <StoreInfoBar store={store} />

            {/* Component 5: Cross-Sells Bundle */}
            {product.crossSells && product.crossSells.length > 0 && (
                <CrossSellsSection
                    crossSells={product.crossSells}
                    crossSellsPrice={product.cross_sells_price}
                    crossSellsName={product.cross_sells_name || undefined}
                    crossSellsDescription={product.cross_sells_description || undefined}
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
