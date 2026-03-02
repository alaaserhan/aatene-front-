import { Metadata } from "next";
import AddEditRequestedServicePage from "@/src/features/(web)/requested-services/components/AddEditRequestedServicePage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("createRequestedService");

export default function CreateRequestedServicePage() {
    return <AddEditRequestedServicePage />;
}
