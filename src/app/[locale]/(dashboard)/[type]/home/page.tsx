import { Metadata } from "next";
import AnalyticsOverviewPage from "@/src/features/(dashboard)/analytics/components/overview";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardHome", {
  title: "الرئيسية",
  description: "نظرة عامة على الإحصائيات في لوحة تحكم أعطيني.",
});

export default function Page() {
  return <AnalyticsOverviewPage />;
}