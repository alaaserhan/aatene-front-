"use client";

import { useRouter, useSearchParams } from "next/navigation";
import FavoritesSidebar from "./components/FavoritesSidebar";
import FavoritesContent from "./components/FavoritesContent";

export type FavoritesType = "all" | "product" | "store" | "service";

export default function FavoritesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get type from URL or default to "all"
    const selectedType = (searchParams.get("type") as FavoritesType) || "all";

    const handleTypeSelect = (type: FavoritesType) => {
        // Update URL when type changes
        const params = new URLSearchParams(searchParams.toString());
        if (type === "all") {
            params.delete("type");
        } else {
            params.set("type", type);
        }
        router.push(`?${params.toString()}`);
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
