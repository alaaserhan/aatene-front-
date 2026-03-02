import { Metadata } from "next";
import { generatePageMetadata } from "@/src/lib/seo.config";
import PrivacyPage from "@/src/features/(web)/pages/components/PrivacyPolicyPage";

export const metadata: Metadata = generatePageMetadata("privacyPolicy");

export default function Page() {
    return <PrivacyPage />;
}
