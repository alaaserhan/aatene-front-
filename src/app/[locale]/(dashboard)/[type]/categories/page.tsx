import { Metadata } from "next";
import { CategoriesPage } from "@/src/features/(dashboard)/categoriesAndAttributes/components/CategoriesPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardCategories");

export default function Page() {
  return <CategoriesPage />;
}