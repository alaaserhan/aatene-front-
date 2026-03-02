import { Metadata } from "next";
import { BlogsPage } from "@/src/features/(dashboard)/blogs/components/BlogsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardBlogs");

export default function Page() {
  return <BlogsPage />;
}