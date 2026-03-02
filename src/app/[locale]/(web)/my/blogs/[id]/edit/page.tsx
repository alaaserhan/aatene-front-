import { Metadata } from "next";
import { AddEditMyBlogPage } from "@/src/features/(web)/blogs/components/AddEditMyBlogPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("blogs", {
    title: "تعديل المقال",
    description: "تعديل مقالك الخاص على أعطيني",
});

interface EditBlogPageProps {
    params: {
        id: string;
    };
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
    return <AddEditMyBlogPage blogId={params.id} isEdit={true} />;
}
