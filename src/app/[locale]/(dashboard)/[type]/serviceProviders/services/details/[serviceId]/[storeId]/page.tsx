import { ServiceDetailsPage } from "@/src/features/(dashboard)/services/components/ServiceDetailsPage";

export default async function Page({ params }: { params: { storeId: number , serviceId: number } }) {
  const param = await params;
  return <ServiceDetailsPage serviceId={param.serviceId}  storeId={param.storeId}/>;
}