"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { useLanguage } from "@/src/hooks/use-language";
import { useDebounce } from "@/src/hooks/use-debounce";
import { FinancialStatsCards } from "./FinancialStatsCards";
import { FinancialFilters } from "./FinancialFilters";
import { FinancialTransactionsTable } from "./FinancialTransactionsTable";
import { FinancialChart } from "./FinancialChart";
import { useGetCoinsTransactions } from "../../coins/hooks";

const PER_PAGE = 10;

export function FinancialRecordPage({ storeId }: { storeId?: number }) {
    const lang = useLanguage();
    const [currentPage, setCurrentPage] = useState(1);
    const [createdAtFrom, setCreatedAtFrom] = useState("");
    const [createdAtTo, setCreatedAtTo] = useState("");
    const [transactionType, setTransactionType] = useState("purchase");
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 400);

    const transactionsParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("per_page", String(PER_PAGE));
        if (transactionType) params.set("type", transactionType);
        if (createdAtFrom) params.set("created_at_from", createdAtFrom);
        if (createdAtTo) params.set("created_at_to", createdAtTo);
        // Not in the Postman contract yet; the backend ignores it until it supports search.
        if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
        return params;
    }, [currentPage, createdAtFrom, createdAtTo, transactionType, debouncedSearch]);

    const { data, isLoading, isFetching } = useGetCoinsTransactions(transactionsParams, storeId);
    const transactions = data?.transactions ?? [];
    const totalRecords = data?.recordsFiltered ?? data?.recordsTotal ?? 0;
    const totalPages = Math.ceil(totalRecords / PER_PAGE);

    const breadcrumbItems = [
        { label: "الرئيسية", href: `/${lang}/admin/home` },
        { label: "الفواتير والسجل المالي" },
    ];

    return (
        <div className="flex flex-col gap-6 sm:p-6 p-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Breadcrumb items={breadcrumbItems} className="mb-2 p-0 bg-transparent" />
                    <h1 className="text-2xl font-bold">الفواتير والسجل المالي</h1>
                </div>

                <Button asChild className="bg-blue-3 gap-2">
                    <Link href={`/${lang}/admin/coins/buy`}>
                        <Plus className="w-4 h-4" />
                        <span>شراء عملات</span>
                    </Link>
                </Button>
            </div>

            <FinancialStatsCards storeId={storeId} />

            <FinancialFilters
                createdAtFrom={createdAtFrom}
                onCreatedAtFromChange={(val) => { setCreatedAtFrom(val); setCurrentPage(1); }}
                createdAtTo={createdAtTo}
                onCreatedAtToChange={(val) => { setCreatedAtTo(val); setCurrentPage(1); }}
                transactionType={transactionType}
                onTransactionTypeChange={(val) => { setTransactionType(val); setCurrentPage(1); }}
                searchQuery={searchQuery}
                onSearchQueryChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
                isLoading={isFetching}
            />

            <FinancialTransactionsTable
                transactions={transactions}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                onPageChange={setCurrentPage}
            />

            <FinancialChart storeId={storeId} />
        </div>
    );
}
