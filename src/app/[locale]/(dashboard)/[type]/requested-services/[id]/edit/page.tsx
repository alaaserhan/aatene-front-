import { EditRequestedServicePage } from "@/src/features/(dashboard)/requested-services/components/EditRequestedServicePage";

export default async function Page({ params }: { params: { id: number } }) {
  const param = await params;
  return <EditRequestedServicePage id={param.id} />;
}