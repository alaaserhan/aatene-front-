import { ProductsPage } from "@/src/features/(dashboard)/products/components/ProductsPage";

export default async function Page({ params }: { params: { storeId: number } }) {
  const param = await params;
  return <ProductsPage storeId={param.storeId} />;
}
