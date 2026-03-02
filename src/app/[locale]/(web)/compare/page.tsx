import { Metadata } from "next";
import ComparePage from "@/src/features/(web)/compares/ComparePage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("compare");

export default function CompareRoute() {
    return <ComparePage />;
}
