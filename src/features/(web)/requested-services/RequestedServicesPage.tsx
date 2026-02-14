"use client";

import { useState, useMemo } from "react";
import { useRequestedServices } from "./hooks";
import { Pagination } from "@/src/components/ui/Pagination";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";
import { Search, Clock, User, CirclePlus } from "lucide-react";
import { RequestedService } from "./types";
import Image from "next/image";
import Link from "next/link";

const PER_PAGE = 10;

function ServiceCard({ service }: { service: RequestedService }) {
    return (
        <div className="border border-gray-4 rounded-[14px] p-6 flex gap-4 items-start hover:shadow-md transition-shadow">
            <div className="shrink-0 w-[60px] h-[60px] rounded-full overflow-hidden">
                <Image
                    src={service.user.avatar_url}
                    alt={`${service.user.first_name} ${service.user.last_name}`}
                    width={60}
                    height={60}
                    className="object-cover w-full h-full"
                />
            </div>
            <div className="flex-1 flex flex-col gap-5 min-w-0">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-black-1 text-base capitalize leading-normal line-clamp-1">
                            {service.title}
                        </p>
                    </div>
                    <p className="text-gray-1 text-base leading-[1.705] line-clamp-2 text-right">
                        {service.content}
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-4">
                    <div className="flex items-center gap-1">
                        <span className="text-blue-2 text-sm leading-[1.705]">
                            {getRelativeTimeArabic(service.created_at)}
                        </span>
                        <Clock className="w-4 h-4 text-blue-2" />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-blue-2 text-sm leading-[1.705]">
                            {service.user.first_name} {service.user.last_name}
                        </span>
                        <User className="w-4 h-4 text-blue-2" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ServiceCardSkeleton() {
    return (
        <div className="border border-gray-4 rounded-[14px] p-6 flex gap-4 items-start animate-pulse">
            <div className="shrink-0 w-[60px] h-[60px] rounded-full bg-gray-200" />
            <div className="flex-1 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
                <div className="flex items-center justify-end gap-4">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
            </div>
        </div>
    );
}

export default function RequestedServicesPage() {
    const [page, setPage] = useState(1);
    const [searchValue, setSearchValue] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const params = useMemo(
        () => ({
            page,
            per_page: PER_PAGE,
            orderBy: "id",
            orderDir: "desc",
            title: searchQuery || undefined,
        }),
        [page, searchQuery]
    );

    const { data, isLoading } = useRequestedServices(params);

    const totalPages = Math.ceil((data?.recordsFiltered || 0) / PER_PAGE);

    const handleSearch = () => {
        setSearchQuery(searchValue);
        setPage(1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12" dir="rtl">
            <div className="flex flex-col gap-4 max-w-[1240px] mx-auto">
                <div className="flex flex-col gap-3 text-right">
                    <h1 className="text-black-1 text-2xl md:text-[36px] font-medium leading-normal">
                        طلبات الخدمات الغير موجودة
                    </h1>
                    <p className="text-gray-1 text-base leading-[1.705]">
                        هل تمتلك مهارات رائعة؟ ابحث عن ما يحتاجه عملاؤنا، وابدأ بتقديم
                        خدماتك بكل احتراف — النجاح يبدأ من هنا!
                    </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-4 sm:gap-[35px] items-stretch sm:items-center">
                    <Link
                        href="/requested-services/create"
                        className="bg-blue-2 flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-white text-base shrink-0 hover:bg-blue-3 transition-colors"
                    >
                        <span>موضوع جديد</span>
                        <CirclePlus className="w-6 h-6" />
                    </Link>
                    <div className="flex-1 flex items-center border border-blue-2 rounded-[42px] overflow-hidden backdrop-blur-[11px]">
                        <button
                            onClick={handleSearch}
                            className="bg-blue-2 p-[11px] rounded-full m-2 shrink-0 hover:bg-blue-3 transition-colors cursor-pointer"
                        >
                            <Search className="w-[18px] h-[18px] text-white" />
                        </button>
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="بحث"
                            className="flex-1 text-right text-base text-gray-2 outline-none bg-transparent px-5 py-2 placeholder:text-gray-2"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[35px] mt-4">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <ServiceCardSkeleton key={i} />
                        ))
                        : data?.data?.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                </div>

                {!isLoading && data?.data?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Search className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-1 text-lg">
                            لا توجد نتائج
                        </p>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <Pagination
                            totalPages={totalPages}
                            currentPage={page}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
