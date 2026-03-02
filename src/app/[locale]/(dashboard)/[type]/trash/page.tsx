import { Metadata } from "next";
import { TrashPage } from "@/src/features/(dashboard)/trash/components/TrashPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardHome", {
  title: "سلة المحذوفات",
  description: "عرض العناصر المحذوفة في لوحة تحكم أعطيني.",
});

export default function Page() {
  return <TrashPage />;
}
