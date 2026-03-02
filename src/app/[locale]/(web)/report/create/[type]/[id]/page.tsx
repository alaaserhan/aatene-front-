import { Metadata } from "next";
import CreateReportPage from "@/src/features/(web)/reports/components/CreateReportPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("reportCreate");

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
