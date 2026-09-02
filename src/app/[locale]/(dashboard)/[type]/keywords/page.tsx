import { Metadata } from "next";
import { KeywordsPage } from "@/src/features/(dashboard)/keywords/components/KeywordsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardKeywords");

export default function Page() {
  return <KeywordsPage />;
}
