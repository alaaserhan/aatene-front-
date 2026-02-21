import StoreProfilePage from "@/src/features/(web)/stores/pages/StoreProfilePage";
import { use } from "react";

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    return <StoreProfilePage slug={resolvedParams.slug} />;
}
