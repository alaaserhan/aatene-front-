import { Metadata } from "next";
import { HomePage } from "@/src/features/(dashboard)/ai-agent/home/components/HomePage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardMosa3edy");

export default function Page() {
  return <HomePage />;
}