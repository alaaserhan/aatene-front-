import { Metadata } from "next";
import { StoriesPage } from "@/src/features/(dashboard)/stories/components/StoriesPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

// Notice we reuse general dashboard title for stories since it's not explicitly in our seo.config
export const metadata: Metadata = generatePageMetadata("dashboardHome", {
  title: "القصص",
  description: "إدارة القصص الخاصة بك على منصة أعطيني.",
});

export default function StoriesPageComponent() {
  return (
    <StoriesPage />
  );
}