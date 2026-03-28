"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { FinancialStatsCards } from "./FinancialStatsCards";
import { FinancialFilters } from "./FinancialFilters";
import { FinancialTransactionsTable } from "./FinancialTransactionsTable";
import { FinancialChart } from "./FinancialChart";
import { useGetCoinsTransactions } from "../../coins/hooks";

export function FinancialRecordPage({ storeId }: { storeId?: number }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [createdAtFrom, setCreatedAtFrom] = useState("");
    const [createdAtTo, setCreatedAtTo] = useState("");
    const [transactionType, setTransactionType] = useState("purchase");
    const [searchQuery, setSearchQuery] = useState("");

    const transactionsParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("per_page", "5");
        if (storeId) params.set("store_id", String(storeId));

        if (createdAtFrom) params.set("created_at_from", createdAtFrom);
        if (createdAtTo) params.set("created_at_to", createdAtTo);
        if (transactionType && transactionType !== "all") params.set("type", transactionType);
        if (searchQuery) params.set("search", searchQuery);

        return params;
    }, [currentPage, storeId, createdAtFrom, createdAtTo, transactionType, searchQuery]);

    const { data: transactionsData, isLoading: isLoadingTransactions, isFetching } = useGetCoinsTransactions(transactionsParams, storeId);

    const transactions = transactionsData?.transactions || [];
    const totalRecords = transactionsData?.recordsFiltered || 0;
    const totalPages = Math.ceil(totalRecords / 5);

    const breadcrumbItems = [
        { label: "الرئيسية", href: "/admin/home" },
        { label: "فواتير والسجل المالي" },
    ];

    return (
        <div className="flex flex-col gap-6 sm:p-6 p-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Breadcrumb items={breadcrumbItems} className="mb-2 p-0 bg-transparent" />
                    <h1 className="text-2xl font-bold">فواتير والسجل المالي</h1>
                </div>

                <Link href={`/admin/coins/buy`}>
                    <Button className="bg-blue-3   gap-2">
                        <Plus className="w-4 h-4" />
                        <span>شراء عملات</span>
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <FinancialStatsCards storeId={storeId} />

            {/* Filters */}
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

            {/* Transactions Table */}
            <FinancialTransactionsTable
                transactions={transactions}
                isLoading={isLoadingTransactions}
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                onPageChange={setCurrentPage}
            />

            {/* Analysis Chart */}
            <FinancialChart storeId={storeId} />
        </div>
    );
}
