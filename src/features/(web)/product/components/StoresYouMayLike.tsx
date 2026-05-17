"use client";

import { useCallback, useMemo } from "react";
import StoreCard from "@/src/features/(web)/stores/components/StoreCard";
import { StoreInPageData } from "../types";
import { Store } from "@/src/features/(web)/searchAndFilter/api";

interface StoresYouMayLikeProps {
    stores: StoreInPageData[];
}

export default function StoresYouMayLike({ stores }: StoresYouMayLikeProps) {


    const transformedStores = useMemo(() => {
        if (!stores) return [];
        return stores.map((storeData) => ({
            ...storeData,
            email: storeData.email || "",
            location_cities: [],
            service_cities: []
        } as unknown as Store));
    }, [stores]);

    if (!stores || stores.length === 0) return null;

    return (
        <div className="mt-16 mb-8">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold">متاجر قد تنال اعجابك</h2>
            </div>

            {/* Stores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {transformedStores.map((store, index) => (
                    <StoreCard
                        key={store.id}
                        store={store}
                        isFollowing={stores[index].am_i_following}
                    />
                ))}
            </div>
        </div>
    );
}
