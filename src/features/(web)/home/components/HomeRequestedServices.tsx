"use client";

import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import RequestedServiceCard from "../../requested-services/components/RequestedServiceCard";
import { RequestedService } from "../types";
import { RequestedService as PropsRequestedService } from "../../requested-services/types";
import { useRequestedServices } from "../hooks";
import HomeViewAllLink from "./HomeViewAllLink";
import { useLanguage } from "@/src/hooks/use-language";
import { MessageSquarePlus } from "lucide-react";

interface HomeRequestedServicesProps {
  requests?: RequestedService[];
}

export default function HomeRequestedServices({ requests: initialRequests }: HomeRequestedServicesProps) {
  const lang = useLanguage();
  const { data: response } = useRequestedServices();
  const requests = initialRequests || response?.data || [];
  const hasRequests = requests.length > 0;

  return (
    <section className="py-12 bg-gray-50 bg-linear-to-b from-white to-gray-50" dir="rtl">
      <MaxWidthWrapper>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl text-blue-4 font-medium relative inline-block">
            طلبات الخدمات الغير موجودة
          </h2>
          <HomeViewAllLink href={`/${lang}/requested-services`} />
        </div>

        {hasRequests ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.slice(0, 2).map((request) => (
              <RequestedServiceCard
                key={request.id}
                service={request as unknown as PropsRequestedService}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-4">
              <MessageSquarePlus className="h-6 w-6" />
            </div>
            <p className="text-base font-medium text-gray-700">لا توجد طلبات خدمات حالياً</p>
            <p className="mt-1 text-sm text-gray-400">ستظهر هنا طلبات الخدمات التي يبحث عنها المستخدمون.</p>
          </div>
        )}
      </MaxWidthWrapper>
    </section>
  );
}
