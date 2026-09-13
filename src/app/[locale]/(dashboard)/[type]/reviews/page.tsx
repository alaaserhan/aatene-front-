import { Suspense } from "react";
import { Metadata } from "next";
import { ReviewsPage } from "@/src/features/(dashboard)/reviews/components/ReviewsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardReviews");

export default function ReviewsRoute() {
    return (
        <Suspense>
            <ReviewsPage />
        </Suspense>
    );
}
