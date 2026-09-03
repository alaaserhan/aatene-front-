"use client";

import { Section } from "@/src/components/shared/Container";
import { Loader2 } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CrossSellsSection, { resolveCrossSellsCopy } from "./components/CrossSellsSection";
import ProductHero from "./components/ProductHero";
import ProductsChooseForYou from "./components/ProductsChooseForYou";
import ProductTabs from "./components/ProductTabs";
import ShippingPolicies from "./components/ShippingPolicies";
import { useGetProductBySlug, useGetProductPageDataBySlug } from "./hooks";

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
    const crossSellsCopy = resolveCrossSellsCopy(product);

    return (
        <div dir="rtl" className="bg-white">
            {/* Tinted band: hero + the tabs triggers (rendered by ProductTabs, which
                is full-bleed so it can close this band and open the white one). */}
            <Section className="bg-c2-neutral-50 pt-8 pb-6 lg:pb-8">
                <ProductHero
                    product={product}
                    store={store}
                    attributes={attributes}
                    crossSells={
                        product.crossSells &&
                        product.crossSells.length > 0 && (
                            <CrossSellsSection
                                crossSells={product.crossSells}
                                crossSellsPrice={product.cross_sells_price}
                                crossSellsName={crossSellsCopy.name}
                                crossSellsDescription={crossSellsCopy.description}
                                orderTarget={{
                                    type: "store",
                                    id: store.id,
                                    productId: product.id,
                                    bundleProductId: product.id,
                                }}
                                className="white-card mb-6"
                            />
                        )
                    }
                    shipping={
                        <ShippingPolicies
                            product={product}
                            store={store}
                            shippingCompany={pageData?.shippingCompany}
                            shippingDetails={pageData?.shippingDetails}
                            allShippingCompanies={pageData?.allShippingCompanies}
                            deliveryType={pageData?.delivery_type ?? store.delivery_type}
                            onCityChange={(city) => setSelectedDeliveryCityId(city.id)}
                            className="mt-6"
                        />
                    }
                />
            </Section>

            <ProductTabs product={product} store={store} />

            {pageData?.productsChooseForYou && pageData.productsChooseForYou.length > 0 && (
                <Section className="bg-c2-neutral-50 pt-8 pb-6 lg:pb-8">
                    <ProductsChooseForYou products={pageData.productsChooseForYou} />
                </Section>
            )}
        </div>
    );
}
