import { Metadata } from "next";
import { AddEditMyBlogPage } from "@/src/features/(web)/blogs/components/AddEditMyBlogPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("blogs", {
    title: "إنشاء مقال جديد",
    description: "المدونة الخاصة بك على أعطيني",
});

export default function CreateBlogPage() {
    return <AddEditMyBlogPage />;
}
