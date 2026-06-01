"use client";

import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import RequestedServiceCard from "../../requested-services/components/RequestedServiceCard";
import { RequestedService } from "../types";
import { RequestedService as PropsRequestedService } from "../../requested-services/types";
import { useRequestedServices } from "../hooks";
import HomeViewAllLink from "./HomeViewAllLink";
import { useLanguage } from "@/src/hooks/use-language";

interface HomeRequestedServicesProps {
  requests?: RequestedService[];
}

export default function HomeRequestedServices({ requests: initialRequests }: HomeRequestedServicesProps) {
  const lang = useLanguage();
  const { data: response } = useRequestedServices();
  const requests = initialRequests || response?.data || [];

  if (!requests || requests.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50 bg-linear-to-b from-white to-gray-50" dir="rtl">
      <MaxWidthWrapper>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl text-blue-4 font-medium relative inline-block">
            طلبات الخدمات الغير موجودة
          </h2>
          <HomeViewAllLink href={`/${lang}/requested-services`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.slice(0, 2).map((request) => (
            <RequestedServiceCard
              key={request.id}
              service={request as unknown as PropsRequestedService}
            />
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
