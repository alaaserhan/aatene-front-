import { StoreType } from "@/src/features/(dashboard)/stores/api";
import { AddStorePage } from "@/src/features/(dashboard)/stores/components/AddStorePage";

export default async function Page({ params }: { params: { storeType: StoreType } }) {
  const param = await params;

  return <AddStorePage storeType={param.storeType} />;
}