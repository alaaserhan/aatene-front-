import { Metadata } from "next";
import { AllReportsPage } from "@/src/features/(dashboard)/reports/components/AllReportsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardAllReports");

export default function AllReportsRoute() {
    return <AllReportsPage />;
}
