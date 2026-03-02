import { UserFormPage } from "@/src/features/(dashboard)/users/components/UserFormPage";
import { Metadata } from "next";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardUsersAdd");

export default function Page() {
  return <UserFormPage />;
}