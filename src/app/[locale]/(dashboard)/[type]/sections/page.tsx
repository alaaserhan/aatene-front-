import { Metadata } from "next";
import { SectionsPage } from "@/src/features/(dashboard)/sections/components/SectionsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardSections");

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