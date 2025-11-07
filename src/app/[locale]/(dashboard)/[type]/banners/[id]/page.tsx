import { BannerFormPage } from "@/src/features/(dashboard)/banners/components/BannerFormPage";

export default function Page({ params }: { params: { id: string } }) {
    const bannerId = params.id;
    return <BannerFormPage mode="edit" bannerId={bannerId} />;
}