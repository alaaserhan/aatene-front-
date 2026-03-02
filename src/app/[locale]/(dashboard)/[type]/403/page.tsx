import { Metadata } from "next";
import { generatePageMetadata } from "@/src/lib/seo.config";
import Forbidden403 from "@/src/components/shared/Forbidden403";

export const metadata: Metadata = generatePageMetadata("dashboard403");

export default function Forbidden403Route() {
    return <Forbidden403 />;
}
