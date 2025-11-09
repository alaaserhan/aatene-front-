import { BannerDetailsPage } from "@/src/features/(dashboard)/banners/components/BannerDetailsPage";

type PageProps = { params: { id: string } };

export default async function BannerPage({ params }: PageProps) {
    const { id } = await params;
  
  return <BannerDetailsPage bannerId={id} />
  
}