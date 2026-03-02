import { ReportDetailsPage } from "@/src/features/(dashboard)/reports/components/ReportDetailsPage";
import { Metadata } from "next";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardReportsDetails");

export default async function Page({ params }: { params: { reportId: number } }) {
  const param = await params;
  return <ReportDetailsPage reportId={String(param.reportId)} />;
}