import { ReportsPage } from "@/src/features/(dashboard)/reports/components/ReportsPage";
import { Metadata } from "next";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardReports");

export default async function Page({ params }: { params: { storeID: number } }) {
  const param = await params;
  return <ReportsPage storeId={param.storeID} />;
}