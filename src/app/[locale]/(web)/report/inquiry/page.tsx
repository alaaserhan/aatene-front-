import { Metadata } from "next";
import ReportInquiryPage from "@/src/features/(web)/reports/components/ReportInquiryPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("reportInquiry");

export default function Page() {
    return <ReportInquiryPage />;
}
