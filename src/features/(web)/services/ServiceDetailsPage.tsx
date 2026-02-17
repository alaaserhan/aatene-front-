"use client";

import { useParams } from "next/navigation";
import { useGetService, useGetServicePageData } from "./hooks";
import ServiceHero from "./components/ServiceHero";
import { Loader2 } from "lucide-react";
import StoreInfoBar from "../product/components/StoreInfoBar";
import ServiceTabs from "./components/ServiceTabs";
import ServicesChooseForYou from "./components/ServicesChooseForYou";
import SimilarServices from "./components/SimilarServices";

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
        <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8 lg:px-16 py-8" dir="rtl">
            <ServiceHero service={data.service} />

            {data.service.store && (
                <div className="mt-8">
                    <StoreInfoBar store={data.service.store} />
                </div>
            )}

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
