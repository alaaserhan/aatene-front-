import { Metadata } from "next";
import { CitiesPage } from "@/src/features/(dashboard)/cities/components/CitiesPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardCities");

export default function Page() {
  return <CitiesPage />;
}