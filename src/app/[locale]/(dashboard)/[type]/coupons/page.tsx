import { Metadata } from "next";
import { CouponsPage } from "@/src/features/(dashboard)/coupons/components/CouponsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardCoupons");

export default function Page() {
    return <CouponsPage />;
}
