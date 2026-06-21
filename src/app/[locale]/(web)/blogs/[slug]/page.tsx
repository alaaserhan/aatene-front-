import { Metadata } from "next";
import BlogDetailsPage from "@/src/features/(web)/blogs/components/BlogDetailsPage";
import { generateDynamicMetadata } from "@/src/lib/seo.config";

// TODO: replace static metadata with generateMetadata() — fetch blog by slug and use
// generateDynamicMetadata({ title: blog.title, description: blog.description, image: blog.image })
export const metadata: Metadata = generateDynamicMetadata({
  title: "تفاصيل المقال",
  description: "اقرأ المقال كاملاً على مدونة أعطيني.",
});

// TODO: convert to ISR (export const revalidate = 60) — BlogDetailsPage is fully client-side
// Plan: prefetch blog data server-side via React Query HydrationBoundary,
// and slim BlogDetailsPage down to a thin client shell (composition pattern).
export default function Page() {
  return <BlogDetailsPage />;
}
