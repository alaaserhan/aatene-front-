import { SectionsPage } from "@/src/features/(dashboard)/sections/components/SectionsPage";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  const storeId = resolvedSearchParams.store_id;

  return (
    <SectionsPage
      storeId={storeId ? Number(storeId) : undefined}
    />
  );
}