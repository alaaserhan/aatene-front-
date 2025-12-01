// src/app/(dashboard)/admin/products/[id]/edit/page.tsx

import { EditProductPage } from "@/src/features/(dashboard)/products/components/EditProductPage";


interface EditProductRouteProps {
  params: {
    id: string;
  };
}

export default function EditProductRoute({ params }: EditProductRouteProps) {
  return <EditProductPage productId={Number(params.id)} />;
}