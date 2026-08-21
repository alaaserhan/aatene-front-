"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import ServiceHero from "./components/ServiceHero";
import ServiceTabs from "./components/ServiceTabs";
import ServicesChooseForYou from "./components/ServicesChooseForYou";
import SimilarServices from "./components/SimilarServices";
import { useGetService, useGetServicePageData } from "./hooks";

export default function ServiceDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data, isLoading, isError } = useGetService(slug);
  const { data: pageData } = useGetServicePageData(slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-10 h-10 animate-spin text-blue-3" />
      </div>
    );
  }

  if (isError || !data?.service) {
    return (
      <div className="text-center py-40" dir="rtl">
        <p className="text-gray-500 text-lg">عذراً، لم يتم العثور على الخدمة</p>
      </div>
    );
  }

  return (
    <div
      className="max-w-[1280px] mx-auto w-full px-4 md:px-8 lg:px-16 py-8"
      dir="rtl"
    >
      <ServiceHero service={data.service} />

      <div className="mt-8">
        <ServiceTabs service={data.service} />
      </div>

      {pageData?.chooseForYou && pageData.chooseForYou.length > 0 && (
        <ServicesChooseForYou services={pageData.chooseForYou} />
      )}

      {pageData?.similar && pageData.similar.length > 0 && (
        <SimilarServices services={pageData.similar} />
      )}
    </div>
  );
}
