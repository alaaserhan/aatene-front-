import { EditServicePage } from "@/src/features/(dashboard)/services/components/EditServicePage";

export default async function Page({ params }: { params: { storeId: number , serviceId: number } }) {
  const param = await params;
  return <EditServicePage serviceId={param.serviceId}  storeId={param.storeId}/>;
}