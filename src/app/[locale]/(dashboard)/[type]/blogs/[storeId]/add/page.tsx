import { AddEditBlogPage } from "@/src/features/(dashboard)/blogs/components/AddEditBlogPage";

export default async function Page({ params }: { params: { storeId: number } }) {
  const param = await params;
  return <AddEditBlogPage storeId={param.storeId} isEdit={false} />;
}