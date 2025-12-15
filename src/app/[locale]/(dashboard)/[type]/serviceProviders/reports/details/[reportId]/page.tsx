import { ReportDetailsPage } from "@/src/features/(dashboard)/reports/components/ReportDetailsPage";

export default async function Page({ params }: { params: { reportId: number } }) {
  const param = await params;
  return <ReportDetailsPage reportId={String(param.reportId)} />;
}