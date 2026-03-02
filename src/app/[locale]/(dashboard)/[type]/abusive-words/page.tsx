import { Metadata } from "next";
import { AbusiveWordsPage } from "@/src/features/(dashboard)/abusiveWords/components/AbusiveWordsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardAbusiveWords");

export default function AbusiveWordsPageRoute() {
    return <AbusiveWordsPage />;
}
