import { Metadata } from "next";
import { generatePageMetadata } from "@/src/lib/seo.config";
import AboutPage from "@/src/features/(web)/pages/components/AboutPage";

export const metadata: Metadata = generatePageMetadata("about");

export default function Page() {
    return <AboutPage />;
}
