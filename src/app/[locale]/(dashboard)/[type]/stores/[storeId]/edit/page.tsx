import { EditStorePage } from "@/src/features/(dashboard)/stores/components/EditStorePage";


export default async function Page({ params }: { params: { storeId: number } }) {
  const param = await params;

  return <EditStorePage storeId={param.storeId} />;
}