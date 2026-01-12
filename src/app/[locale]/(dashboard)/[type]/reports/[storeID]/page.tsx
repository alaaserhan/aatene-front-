import { ReportsPage } from "@/src/features/(dashboard)/reports/components/ReportsPage";

export default async function Page({ params }: { params: { storeID: number } }) {
  const param = await params;
  return <ReportsPage storeId={param.storeID} />;
}