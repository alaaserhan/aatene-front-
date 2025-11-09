import { BannerFormPage } from "@/src/features/(dashboard)/banners/components/BannerFormPage";

export default async function Page({ params }: { params: { id: string } }) {
    const param = await params;
    
    return <BannerFormPage mode="edit" bannerId={param.id} />;
}