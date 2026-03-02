import { Metadata } from "next";
import { generatePageMetadata } from "@/src/lib/seo.config";
import TermsPage from "@/src/features/(web)/pages/components/TermsOfUsePage";

export const metadata: Metadata = generatePageMetadata("termsOfUse");

export default function Page() {
    return <TermsPage />;
}
