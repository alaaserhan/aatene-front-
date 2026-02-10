import CreateReportPage from "@/src/features/(web)/reports/components/CreateReportPage";

interface PageProps {
    params: Promise<{
        type: string;
        id: string;
    }>;
}

export default async function Page({ params }: PageProps) {
    const { type, id } = await params;
    return <CreateReportPage type={type} id={id} />;
}
