import { Metadata } from "next";
import { UsersPage } from "@/src/features/(dashboard)/users/components/UsersPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardUsers");

export default function Page() {
  return <UsersPage />;
}