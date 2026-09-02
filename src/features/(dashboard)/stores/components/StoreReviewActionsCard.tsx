"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { ConfirmationDialog } from "@/src/components/ui/ConfirmationDialog";
import { cn } from "@/src/lib/utils";
import { useUpdateStoreStatus } from "../hooks";
import { Store, StoreStatus } from "../api";
import { RejectStoreModal } from "./RejectStoreModal";

const STATUS_LABELS: Record<StoreStatus, string> = {
  approved: "تمت الموافقة عليه",
  pending: "قيد المراجعة",
  rejected: "مرفوض",
};

interface StoreReviewActionsCardProps {
  store: Store;
  className?: string;
}

/**
 * Admin accept/reject card for a store, shared by the full details page and the
 * admin store preview page. Owns the status mutation and both confirm modals.
 */
export function StoreReviewActionsCard({
  store,
  className,
}: StoreReviewActionsCardProps) {
  const router = useRouter();
  const routeParams = useParams<{ locale?: string; type?: string }>();
  const storesBasePath =
    typeof routeParams.locale === "string" && typeof routeParams.type === "string"
      ? `/${routeParams.locale}/${routeParams.type}/stores`
      : "/admin/stores";
  const reviewRedirectUrl = `${storesBasePath}?status=pending`;

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);

  const { mutate: updateStatusMutation, isPending: isUpdatingStatus } =
    useUpdateStoreStatus();

  const currentStatus = store.status;

  const handleConfirmApprove = () => {
    const wasInReview = currentStatus === "pending";
    updateStatusMutation(
      { id: store.id, payload: { status: "approved" } },
      {
        onSuccess: () => {
          if (wasInReview) router.push(reviewRedirectUrl);
        },
      }
    );
  };

  const confirmReject = (reasonText: string, details: string) => {
    const wasInReview = currentStatus === "pending";
    const fullReason = details ? `${reasonText} - ${details}` : reasonText;
    updateStatusMutation(
      { id: store.id, payload: { status: "rejected", reject_reason: fullReason } },
      {
        onSuccess: () => {
          setRejectModalOpen(false);
          if (wasInReview) router.push(reviewRedirectUrl);
        },
      }
    );
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-c2-neutral-200 bg-white rounded-[10px]">
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold">اختر الإجراء المناسب للمتجر</h2>
          <span
            className={cn(
              "w-fit rounded-full px-3 py-1 text-xs font-bold",
              currentStatus === "approved" && "bg-emerald-50 text-emerald-600",
              currentStatus === "pending" && "bg-amber-50 text-amber-600",
              currentStatus === "rejected" && "bg-red-50 text-red-600"
            )}
          >
            {STATUS_LABELS[currentStatus] ?? STATUS_LABELS.pending}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {currentStatus !== "approved" && (
            <Button
              type="button"
              onClick={() => setApproveModalOpen(true)}
              disabled={isUpdatingStatus}
              className="w-full sm:w-auto bg-c2-green-600 hover:bg-c2-green-600/90 text-white px-6 sm:px-8 h-10 font-bold rounded-lg"
            >
              {isUpdatingStatus
                ? "جاري التحديث..."
                : currentStatus === "rejected"
                  ? "قبول المتجر مرة أخرى"
                  : "قبول المتجر"}
            </Button>
          )}
          {currentStatus !== "rejected" && (
            <Button
              type="button"
              onClick={() => setRejectModalOpen(true)}
              disabled={isUpdatingStatus}
              className="w-full sm:w-auto bg-c2-danger hover:bg-c2-danger/90 text-white px-6 sm:px-8 h-10 font-bold rounded-lg"
            >
              رفض المتجر
            </Button>
          )}
        </div>
      </div>

      <RejectStoreModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={confirmReject}
        isLoading={isUpdatingStatus}
      />

      <ConfirmationDialog
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={handleConfirmApprove}
        title={`هل أنت متأكد من قبول متجر "${store.name}"؟`}
      />
    </div>
  );
}
