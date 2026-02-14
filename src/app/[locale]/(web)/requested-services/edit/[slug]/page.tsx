import AddEditRequestedServicePage from "@/src/features/(web)/requested-services/components/AddEditRequestedServicePage";

interface EditPageProps {
    params: {
        slug: string;
    };
}

export default function EditRequestedServicePage({ params }: EditPageProps) {
    const { slug } = params;
    return <AddEditRequestedServicePage slug={slug} isEdit={true} />;
}
