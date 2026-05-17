import { Metadata } from "next";
import FavoritesPage from "@/src/features/(web)/fav/FavoritesPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

import { Suspense } from "react";

export const metadata: Metadata = generatePageMetadata("favourites");

export default function Page() {
    return (
        <Suspense fallback={<div className="text-center py-10">جاري التحميل...</div>}>
            <FavoritesPage />
        </Suspense>
    );
}
