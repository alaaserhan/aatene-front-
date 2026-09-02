// src/features/(dashboard)/related-products/components/RelatedProductsPage.tsx
"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HelpCircle, Plus, Search } from "lucide-react";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { useDebounce } from "@/src/hooks/use-debounce";
import { useCrossSellingOffers, useDeleteCrossSellingOffer, useUpdateCrossSellingOfferStatus } from "../hooks";
import type { CrossSellingOffer } from "../types";
import { CreateOfferDialog } from "./create/CreateOfferDialog";
import { RelatedProductsEmptyState } from "./RelatedProductsEmptyState";
import { RelatedProductsTable } from "./RelatedProductsTable";

const PER_PAGE = 15;

const HELP_TEXT =
    "المنتجات المرتبطة تظهر للعميل كاقتراحات إضافية عند تصفح هذا المنتج، مما يزيد من فرص البيع.";

export function RelatedProductsPage() {
    const router = useRouter();
    const routeParams = useParams<{ locale?: string; type?: string }>();
    const dashboardBase = `/${routeParams?.locale || "ar"}/${routeParams?.type || "admin"}`;
    const featureBase = `${dashboardBase}/related-products`;

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [offerToDelete, setOfferToDelete] = useState<CrossSellingOffer | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const debouncedSearch = useDebounce(searchQuery, 400);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const params = useMemo(
        () => ({ page: currentPage, per_page: PER_PAGE, search: debouncedSearch }),
        [currentPage, debouncedSearch]
    );

    const { data, isLoading } = useCrossSellingOffers(params);
    const offers = data?.data || [];
    const totalPages = Math.ceil((data?.recordsFiltered || 0) / PER_PAGE);

    const { mutate: updateStatus } = useUpdateCrossSellingOfferStatus();
    const { mutate: deleteOffer } = useDeleteCrossSellingOffer();

    const handleToggleStatus = (offer: CrossSellingOffer) => {
        updateStatus({
            productId: offer.id,
            status: offer.cross_sells_status === "active" ? "inactive" : "active",
        });
    };

    const handleConfirmDelete = () => {
        if (!offerToDelete) return;
        deleteOffer(offerToDelete.id);
        setOfferToDelete(null);
    };

    // Only a store with no offers at all gets the illustrated empty state —
    // an empty search result keeps the search box and table shell visible.
    const showEmptyState = !isLoading && offers.length === 0 && !debouncedSearch;

    return (
        <div className="flex min-h-[calc(100vh-80px)] flex-col">
            <header className="mt-6">
                <div className="heading-card">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-xl font-bold text-c2-neutral-800 md:text-2xl">
                            منتجات مرتبطة
                        </h1>
                        <Tooltip
                            trigger={
                                <div className="flex cursor-pointer items-center gap-1 text-c2-navy-500 transition-colors hover:text-c2-navy-600">
                                    <HelpCircle className="size-3.5" />
                                    <span className="pt-px text-xs font-medium">
                                        ما هي المنتجات المرتبطة؟
                                    </span>
                                </div>
                            }
                            content={HELP_TEXT}
                        />
                    </div>

                    <p className="mt-1 text-sm text-c2-slate-600">
                        قم باختيار منتجات لترشيحها في قائمة المنتج
                    </p>

                    <Button
                        size="lg"
                        className="mt-6 gap-2 bg-c2-primary text-white"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <Plus className="size-5" />
                        <span className="pt-1">اختر منتجات</span>
                    </Button>
                </div>
            </header>

            <main className="flex-1 py-6">
                {showEmptyState ? (
                    <RelatedProductsEmptyState />
                ) : (
                    <>
                        <div className="relative mb-6 rounded-lg border border-c2-neutral-200 bg-white">
                            <Search className="pointer-events-none absolute end-3 top-1/2 size-5 -translate-y-1/2 text-c2-neutral-500" />
                            <Input
                                value={searchQuery}
                                onChange={(event) => handleSearchChange(event.target.value)}
                                placeholder="بحث عن العرض أو المنتج..."
                                className="h-12 border-none pe-10 shadow-none focus-visible:ring-0"
                            />
                        </div>

                        <RelatedProductsTable
                            offers={offers}
                            isLoading={isLoading}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            onToggleStatus={handleToggleStatus}
                            onView={(offer) => router.push(`${featureBase}/${offer.id}`)}
                            onEdit={(offer) => router.push(`${featureBase}/${offer.id}/edit`)}
                            onDelete={setOfferToDelete}
                        />
                    </>
                )}
            </main>

            <CreateOfferDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

            <ConfirmDeleteModal
                isOpen={!!offerToDelete}
                onClose={() => setOfferToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="هل أنت متأكد من حذف العرض؟"
                description="سيتم حذف العرض نهائياً ولن تظهر المنتجات المرتبطة في صفحة المنتج."
            />
        </div>
    );
}
