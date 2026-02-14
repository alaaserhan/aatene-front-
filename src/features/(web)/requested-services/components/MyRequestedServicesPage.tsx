"use client";

import { useState, useMemo } from "react";
import { useMyRequestedServices } from "../hooks";
import { Pagination } from "@/src/components/ui/Pagination";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";
import { Search, CirclePlus } from "lucide-react";
import { RequestedService } from "../types";

import Link from "next/link";
import { cn } from "@/src/lib/utils";

const PER_PAGE = 10;

const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-600" },
    active: { label: "نشط", color: "bg-blue-100 text-blue-600" },
    closed: { label: "مغلق", color: "bg-red-100 text-red-600" },
    rejected: { label: "مرفوض", color: "bg-red-100 text-red-600" },
    approved: { label: "نشط", color: "bg-blue-100 text-blue-600" }, // Mapping approved to active if needed
};

function MyRequestedServiceCard({ service }: { service: RequestedService }) {
    const statusInfo = statusMap[service.status] || { label: service.status, color: "bg-gray-100 text-gray-600" };
    const user = service.user; // User object from API

    return (
        <div className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 flex flex-col gap-3 w-full">
                <div className="flex items-center justify-between">
                    <Link href={`/requested-services/${service.slug}`} className="text-base font-medium  hover:text-blue-600 transition-colors line-clamp-1">
                        {service.title}
                    </Link>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                    {service.content}
                </p>
                <div className="flex items-center gap-4 text-xs text-blue-3 mt-2">
                    <span className="flex items-center gap-1">
                        <img src="/icons/Time.svg" alt="Time" className="w-4 h-4" />
                        <span>منذ {getRelativeTimeArabic(service.created_at)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <img src="/icons/Profile.svg" alt="User" className="w-4 h-4" />
                        <span>{user ? `${user.first_name} ${user.last_name}` : "مستخدم"}</span>
                    </span>
                </div>
            </div>

            <div className="shrink-0 flex md:flex-col items-end gap-2 self-start md:self-center">
                <span className={cn("px-3 py-1 rounded-full text-xs font-medium w-fit whitespace-nowrap", statusInfo.color)}>
                    {statusInfo.label}
                </span>
            </div>
        </div>
    );
}

function ServiceCardSkeleton() {
    return (
        <div className="border border-gray-200 rounded-lg p-6 flex flex-col md:flex-row gap-4 items-center justify-between animate-pulse">
            <div className="flex-1 flex flex-col gap-3 w-full">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="flex gap-4 mt-2">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
            </div>
            <div className="shrink-0">
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
            </div>
        </div>
    );
}

export default function MyRequestedServicesPage() {
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

    const { data, isLoading } = useMyRequestedServices(params);

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
        <div className="container mx-auto px-4 md:px-6 my-8">
            <div className="flex flex-col gap-6 max-w-[1000px] mx-auto">
                <div className="flex flex-col gap-2 text-center md:text-right">
                    <h1 className="text-2xl md:text-3xl font-medium ">
                        طلباتي
                    </h1>
                    <p className="text-gray-2 text-sm">
                        هل تمتلك مهارات رائعة؟ ابحث عن ما يحتاجه عملاؤنا، وابدأ بتقديم خدماتك بكل احتراف
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center">
                    <div className="flex-1 h-11 flex items-center border border-blue-1 rounded-full overflow-hidden">
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="بحث"
                            className="flex-1 text-base text-gray-2 outline-none bg-transparent px-4 py-1 placeholder:text-gray-2"
                        />
                        <button
                            onClick={handleSearch}
                            className="bg-blue-4 p-2 rounded-full m-1 shrink-0 hover:bg-blue-3 transition-colors cursor-pointer"
                        >
                            <Search className="w-5 h-5 text-white" />
                        </button>
                    </div>
                    <Link
                        href="/requested-services/create"
                        className="bg-blue-4 flex items-center justify-center gap-2.5 px-8 py-2 h-10 rounded-full text-white text-sm shrink-0"
                    >
                        <CirclePlus className="w-5 h-5" />
                        <span>موضوع جديد</span>
                    </Link>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <ServiceCardSkeleton key={i} />
                        ))
                        : data?.data?.map((service) => (
                            <MyRequestedServiceCard key={service.id} service={service} />
                        ))}
                </div>

                {!isLoading && data?.data?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-300 rounded-lg">
                        <Search className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500">لا توجد طلبات حالياً</p>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
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
