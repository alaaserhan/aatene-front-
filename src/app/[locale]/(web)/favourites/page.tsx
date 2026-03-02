import { Metadata } from "next";
import FavoritesPage from "@/src/features/(web)/fav/FavoritesPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("favourites");

export default function Page() {
    return <FavoritesPage />;
}
