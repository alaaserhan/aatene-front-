import { Metadata } from "next";
import BlogDetailsPage from "@/src/features/(web)/blogs/components/BlogDetailsPage";
import { generateDynamicMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generateDynamicMetadata({
    title: "تفاصيل المقال",
    description: "اقرأ المقال كاملاً على مدونة أعطيني.",
});

export default function Page() {
    return <BlogDetailsPage />;
}
