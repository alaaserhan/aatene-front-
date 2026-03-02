import { Metadata } from "next";
import { generatePageMetadata } from "@/src/lib/seo.config";
import ContentManagementPage from "@/src/features/(dashboard)/content-management/components/ContentManagementPage";

export const metadata: Metadata = generatePageMetadata("dashboardContentManagement");

export default function Page() {
    return <ContentManagementPage />;
}
