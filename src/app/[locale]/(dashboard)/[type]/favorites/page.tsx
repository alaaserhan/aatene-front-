import { Metadata } from "next";
import { FavoritesUsersPage } from "@/src/features/(dashboard)/favorites/components/FavoritesUsersPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardFavorites");

export default async function Page() {
    return <FavoritesUsersPage />;
}