import { Metadata } from "next";
import BlogsPage from "@/src/features/(web)/blogs/components/BlogsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("blogs");

export default function Page() {
    return <BlogsPage />;
}
