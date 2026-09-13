import { Suspense } from "react";
import { Metadata } from "next";
import { NewslettersPage } from "@/src/features/(dashboard)/newsletters/components/NewslettersPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardNewsletters");

export default function NewslettersRoute() {
    return (
        <Suspense>
            <NewslettersPage />
        </Suspense>
    );
}
