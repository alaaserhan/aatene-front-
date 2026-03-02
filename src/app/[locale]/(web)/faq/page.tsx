import { Metadata } from "next";
import { generatePageMetadata } from "@/src/lib/seo.config";
import FaqPage from "@/src/features/(web)/pages/components/FaqPage";

export const metadata: Metadata = generatePageMetadata("faq");

export default function Page() {
    return <FaqPage />;
}
