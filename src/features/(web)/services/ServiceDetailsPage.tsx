"use client";

import { Section } from "@/src/components/shared/Container";
import { useParams } from "next/navigation";
import ServiceDetailsSkeleton from "./components/ServiceDetailsSkeleton";
import ServiceHero from "./components/ServiceHero";
import ServiceTabs from "./components/ServiceTabs";
import ServicesChooseForYou from "./components/ServicesChooseForYou";
import SimilarServices from "./components/SimilarServices";
import { useGetService, useGetServicePageData } from "./hooks";

export default function ServiceDetailsPage({
  slug: slugFromServer,
}: {
  /** Passed by the route so the first render matches the server-prefetched cache. */
  slug?: string;
}) {
  const params = useParams();
  const slug = slugFromServer ?? (params?.slug as string);

  const { data, isLoading, isError } = useGetService(slug);
  const { data: pageData } = useGetServicePageData(slug);

  if (isLoading) {
    return <ServiceDetailsSkeleton />;
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
        <Section className="bg-c2-neutral-50 pt-8 pb-6 lg:pb-8">
          <ServicesChooseForYou services={pageData.chooseForYou} />
        </Section>
      )}

      {pageData?.similar && pageData.similar.length > 0 && (
        <Section className="bg-c2-neutral-50 pt-8 pb-6 lg:pb-8">
          <SimilarServices services={pageData.similar} />
        </Section>
      )}
    </div>
  );
}
