"use client";

import { useState, useMemo } from "react";
import { useRequestedServices } from "./hooks";
import { Pagination } from "@/src/components/ui/Pagination";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";
import { Search, CirclePlus, Flag } from "lucide-react";
import { RequestedService } from "./types";
import Image from "next/image";
import Link from "next/link";
import { ReportAbuse } from "../reports/components/ReportAbuse";

const PER_PAGE = 10;

function ServiceCard({ service }: { service: RequestedService }) {
    const user = service.user;
    return (
        <div className="border border-gray-200 rounded-lg p-6 flex flex-col gap-4 ">
            <div className="flex gap-4 items-start">
                <div className="shrink-0 w-[50px] h-[50px] rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                    {user?.avatar_url ? (
                        <Image
                            src={user.avatar_url}
                            alt={`${user.first_name || ""} ${user.last_name || ""}`}
                            width={50}
                            height={50}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200" />
                    )}
                </div>
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <Link href={`/requested-services/${service.slug}`} className="font-medium leading-normal line-clamp-2 hover:text-blue-2 transition-colors">
                            {service.title}
                        </Link>

                        <ReportAbuse type="requested_service" id={service.id}>
                            <button
                                className="flex cursor-pointer items-center gap-1 text-[#F00] font-medium text-xs hover:underline shrink-0"
                            >
                                <Flag className="w-3 h-3" />
                                <span>بلغ عن إساءة</span>
                            </button>
                        </ReportAbuse>
                    </div>
                    <p className="text-gray-2 text-sm leading-[1.7] line-clamp-2">
                        {service.content}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5 text-blue-3">
                            <img src="/icons/Profile.svg" alt="Profile" />
                            <span className="text-sm">
                                {user ? `${user.first_name} ${user.last_name}` : "مستخدم"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-3">
                            <img src="/icons/Time.svg" alt="Time" />
                            <span className="text-xs">
                                {getRelativeTimeArabic(service.created_at)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            {user?.avatar_url ? (
                                <Image
                                    src={user.avatar_url}
                                    alt="User"
                                    width={24}
                                    height={24}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200" />
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-blue-3">
                            <span>آخر تفاعل</span>
                            <span className="text-black-1">
                                {getRelativeTimeArabic(service.updated_at)}
                            </span>
                            <span>من قبل</span>
                            <span className="text-blue-3">
                                {user ? `${user.first_name} ${user.last_name}` : "مستخدم"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ServiceCardSkeleton() {
    return (
        <div className="border border-gray-200 rounded-lg p-6 flex gap-4 items-start animate-pulse">
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
        <div className="container mx-auto px-4 md:px-6 my-4 md:my-8" >
            <div className="flex flex-col gap-4 max-w-[1240px] mx-auto">
                <div className="flex flex-col gap-3 ">
                    <h1 className=" text-2xl md:text-3xl font-medium leading-normal">
                        طلبات الخدمات الغير موجودة
                    </h1>
                    <p className="text-gray-2 text-sm">
                        هل تمتلك مهارات رائعة؟ ابحث عن ما يحتاجه عملاؤنا، وابدأ بتقديم
                        خدماتك بكل احتراف — النجاح يبدأ من هنا!
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
                            className="flex-1  text-base text-gray-2 outline-none bg-transparent px-4 py-1 placeholder:text-gray-2"
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
                        className="bg-blue-4 flex items-center justify-center gap-2.5 px-8 py-2 h-10 rounded-full text-white text-sm"
                    >
                        <CirclePlus className="w-5 h-5" />
                        <span>موضوع جديد</span>
                    </Link>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
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
                        <p className="text-gray-2 text-lg">
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
