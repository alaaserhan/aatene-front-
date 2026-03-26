import { Metadata } from "next";
import { AiPhotographerPage } from "@/src/features/(dashboard)/ai-photographer/components/AiPhotographerPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("aiPhotographer");

export default function Page() {
  return <AiPhotographerPage />;
}
