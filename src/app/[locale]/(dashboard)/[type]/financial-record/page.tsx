import { Metadata } from "next";
import { notFound } from "next/navigation";
import { FinancialRecordPage } from "@/src/features/(dashboard)/financial/components/FinancialRecordPage";
import { generatePageMetadata } from "@/src/lib/seo.config";
import { isCoinsEnabled } from "@/src/config/features";

export const metadata: Metadata = generatePageMetadata("dashboardFinancial");

export default function Page() {
    if (!isCoinsEnabled()) notFound();
    return <FinancialRecordPage />;
}
