import { Metadata } from "next";
import { generatePageMetadata } from "@/src/lib/seo.config";
import ContactUsPage from "@/src/features/(web)/pages/components/ContactUsPage";

export const metadata: Metadata = generatePageMetadata("contactUs");

export default function Page() {
    return <ContactUsPage />;
}
