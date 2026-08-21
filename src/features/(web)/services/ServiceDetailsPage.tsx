"use client";

import { Section } from "@/src/components/shared/Container";
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
    <div dir="rtl" className="bg-white">
      {/* Tinted band: hero + the tabs triggers (rendered by ServiceTabs, which
          is full-bleed so it can close this band and open the white one). */}
      <Section className="bg-c2-neutral-50 pt-8 pb-6 lg:pb-8">
        <ServiceHero service={data.service} />
      </Section>

      <ServiceTabs service={data.service} />

      {pageData?.chooseForYou && pageData.chooseForYou.length > 0 && (
        <Section>
          <ServicesChooseForYou services={pageData.chooseForYou} />
        </Section>
      )}

      {pageData?.similar && pageData.similar.length > 0 && (
        <Section className="pb-8">
          <SimilarServices services={pageData.similar} />
        </Section>
      )}
    </div>
  );
}
