import { AddServicePage } from "@/src/features/(dashboard)/services/components/AddServicePage";

export default async function Page({ params }: { params: { storeId: number } }) {
  const param = await params;
  return <AddServicePage storeId={param.storeId} />;
}