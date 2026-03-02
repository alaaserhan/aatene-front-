import { Metadata } from "next";
import ReportsPage from "@/src/features/(dashboard)/analytics/components/reports/ReportPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardHome", {
  title: "التقارير",
  description: "تقارير مفصلة في لوحة تحكم أعطيني.",
});

export default function Page() {
  return <ReportsPage />;
}