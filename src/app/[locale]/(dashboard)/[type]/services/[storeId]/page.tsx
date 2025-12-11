import { ServicesPage } from "@/src/features/(dashboard)/services/components/ServicesPage";

export default async function Page({ params }: { params: { storeId: number } }) {
  const param = await params;
  return <ServicesPage storeId={param.storeId} />;
}