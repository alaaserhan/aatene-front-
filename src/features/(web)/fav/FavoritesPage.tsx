"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FavoritesSidebar from "./components/FavoritesSidebar";
import FavoritesContent from "./components/FavoritesContent";

export type FavoritesType = "all" | "product" | "store" | "service";

export default function FavoritesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. Maintain local state for selectedType to provide instant, lag-free UI updates
    const urlType = (searchParams.get("type") as FavoritesType) || "all";
    const [prevUrlType, setPrevUrlType] = useState<FavoritesType>(urlType);
    const [selectedType, setSelectedType] = useState<FavoritesType>(urlType);

    // Sync state synchronously during render if the URL query parameter changes
    if (urlType !== prevUrlType) {
        setPrevUrlType(urlType);
        setSelectedType(urlType);
    }

    const handleTypeSelect = (type: FavoritesType) => {
        // Update local state instantly so the sidebar button selection updates without lag
        setSelectedType(type);

        // Update URL query parameter
        const params = new URLSearchParams(searchParams.toString());
        if (type === "all") {
            params.delete("type");
        } else {
            params.set("type", type);
        }
        
        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        
        // Use HTML5 pushState to update address bar instantly without making Next.js App Router RSC requests
        window.history.pushState(null, '', newUrl);
    };

    return (
        <div className="container mx-auto my-8 min-h-[calc(100vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <FavoritesSidebar
                        selectedType={selectedType}
                        onSelect={handleTypeSelect}
                    />
                </div>

                {/* Main Content */}
                <div className="lg:col-span-4 ">
                    <FavoritesContent selectedType={selectedType} />
                </div>
            </div>
        </div>
    );
}
