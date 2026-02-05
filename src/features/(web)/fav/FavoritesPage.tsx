"use client";

import { useState } from "react";
import FavoritesSidebar from "./components/FavoritesSidebar";
import FavoritesContent from "./components/FavoritesContent";

export type FavoritesType = "all" | "product" | "store" | "service";

export default function FavoritesPage() {
    const [selectedType, setSelectedType] = useState<FavoritesType>("all");

    return (
        <div className="container mx-auto my-8 min-h-[calc(100vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <FavoritesSidebar
                        selectedType={selectedType}
                        onSelect={setSelectedType}
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
