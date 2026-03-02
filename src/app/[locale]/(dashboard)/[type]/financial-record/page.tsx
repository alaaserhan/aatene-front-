import { Metadata } from "next";
import { FinancialRecordPage } from "@/src/features/(dashboard)/financial/components/FinancialRecordPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardFinancial");

export default function Page() {
    return <FinancialRecordPage />;
}
