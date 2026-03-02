import { Metadata } from "next";
import SearchResultsPage from "@/src/features/(web)/search/SearchResultsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("search");

export default function SearchPage() {
    return <SearchResultsPage />;
}
