import { AddEditBlogPage } from "@/src/features/(dashboard)/blogs/components/AddEditBlogPage";

export default async function Page({ params }: { params: { blogId: number, storeId: number } }) {
  const param = await params;
  return <AddEditBlogPage blogId={param.blogId} storeId={param.storeId} isEdit={true} />;
}