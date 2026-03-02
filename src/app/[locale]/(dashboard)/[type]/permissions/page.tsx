import { Metadata } from "next";
import { PermissionsPage } from "@/src/features/(dashboard)/permissions/components/PermissionsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardPermissions");

export default function Page() {
  return <PermissionsPage />;
}