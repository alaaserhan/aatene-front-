import { Metadata } from "next";
import { generatePageMetadata } from "@/src/lib/seo.config";
import SafetyRulesPage from "@/src/features/(web)/pages/components/SafetyRulesPage";

export const metadata: Metadata = generatePageMetadata("safetyRules");

export default function Page() {
    return <SafetyRulesPage />;
}
