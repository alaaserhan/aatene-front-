import { notFound } from "next/navigation";
import { AdminStoreDetailsPage } from "@/src/features/(dashboard)/stores/components/AdminStoreDetailsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const id = Number(storeId);
  if (!Number.isFinite(id) || id < 1) {
    notFound();
  }

  return <AdminStoreDetailsPage storeId={id} />;
}
