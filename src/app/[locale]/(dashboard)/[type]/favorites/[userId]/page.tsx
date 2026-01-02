import { UserFavoritesPage } from "@/src/features/(dashboard)/favorites/components/UserFavoritesPage";

interface PageProps {
    params: Promise<{ userId: string }>;
}

export default async function Page({ params }: PageProps) {
    const { userId } = await params;
    return <UserFavoritesPage userId={userId} />;
}