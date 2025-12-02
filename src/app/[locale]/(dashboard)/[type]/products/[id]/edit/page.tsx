// src/app/[locale]/[type]/products/[id]/edit/page.tsx
import { EditProductPage } from "@/src/features/(dashboard)/products/components/EditProductPage";

interface PageProps {
  params: Promise<{
    id: string;
    locale: string;
    type: string;
  }>;
}

export default async function EditProductRoute({ params }: PageProps) {
  const resolvedParams = await params;
  const productId = Number(resolvedParams.id);

  return <EditProductPage productId={productId} />;
}