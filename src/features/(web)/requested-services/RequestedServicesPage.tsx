"use client";

import { useState, useMemo } from "react";
import { useRequestedServices } from "./hooks";
import { Pagination } from "@/src/components/ui/Pagination";
import { Search, CirclePlus } from "lucide-react";
import { RequestedService } from "./types";
import Link from "next/link";
import RequestedServiceCard, { RequestedServiceCardSkeleton } from "./components/RequestedServiceCard";
import { useLanguage } from "@/src/hooks/use-language";

const PER_PAGE = 10;

// Local ServiceCard were removed and moved to RequestedServiceCard.tsx

export default function RequestedServicesPage() {
    const lang = useLanguage();
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

    const recordsFiltered = data?.recordsFiltered || (data as unknown as { total?: number })?.total || 0;
    let totalPages = Math.ceil(recordsFiltered / PER_PAGE);

    // Fallback for incorrect API totals: If the current page returns fewer items than PER_PAGE,
    // it means there are no more items after this page.
    if (data?.data && data.data.length < PER_PAGE) {
        totalPages = Math.min(totalPages || page, page);
    }

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
                        href={`/${lang}/requested-services/create`}
                        className="bg-blue-4 flex items-center font-medium justify-center gap-2.5 px-8 py-2 h-10 rounded-full text-white text-sm cursor-pointer"
                    >
                        <CirclePlus className="w-5 h-5" />
                        <span>موضوع جديد</span>
                    </Link>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <RequestedServiceCardSkeleton key={i} />
                        ))
                        : data?.data?.map((service) => (
                            <RequestedServiceCard key={service.id} service={service as unknown as RequestedService} />
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
