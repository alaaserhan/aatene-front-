import { AddEditMyBlogPage } from "@/src/features/(web)/blogs/components/AddEditMyBlogPage";

interface EditBlogPageProps {
    params: {
        id: string;
    };
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
    return <AddEditMyBlogPage blogId={params.id} isEdit={true} />;
}
