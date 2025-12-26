import { RequestedServiceDetailsPage } from "@/src/features/(dashboard)/requested-services/components/RequestedServiceDetailsPage";

export default async function Page({ params }: { params: { id: number } }) {
  const param = await params;
  return <RequestedServiceDetailsPage id={param.id} />;
}