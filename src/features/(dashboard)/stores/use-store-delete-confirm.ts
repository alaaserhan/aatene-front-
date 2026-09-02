// src/features/(dashboard)/stores/use-store-delete-confirm.ts
"use client";

import { useState } from "react";
import { useDeleteStore } from "./hooks";

const MODAL_TEXTS = {
  title: "هل أنت متأكد من حذف هذا المتجر؟",
  description: "لا يمكن استرجاع المتجر بعد حذفه",
  confirmText: "نعم، قم بالحذف",
  cancelText: "إلغاء",
};

interface UseStoreDeleteConfirmOptions {
  /** يُستدعى بعد نجاح الحذف (توجيه، تحديث قائمة، ...) */
  onDeleted?: (storeId: number) => void;
}

/**
 * Shared "delete a store" flow: holds the pending store, runs the mutation and
 * hands back ready-made props for ConfirmDeleteModal so every entry point
 * (stores list, store details) behaves and reads the same.
 */
export function useStoreDeleteConfirm({ onDeleted }: UseStoreDeleteConfirmOptions = {}) {
  const [pendingStoreId, setPendingStoreId] = useState<number | null>(null);
  /** يبقى true بعد التأكيد حتى ينجح الحذف — يُستخدم لإيقاف جلب بيانات متجر محذوف */
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);

  const { mutate: deleteStore, isPending: isDeleting } = useDeleteStore();

  const requestDelete = (storeId: number) => setPendingStoreId(storeId);

  const cancelDelete = () => setPendingStoreId(null);

  const confirmDelete = () => {
    if (pendingStoreId == null) return;

    const storeId = pendingStoreId;
    setIsDeleteConfirmed(true);

    deleteStore(storeId, {
      onSuccess: () => {
        setPendingStoreId(null);
        onDeleted?.(storeId);
      },
      onError: () => {
        // إعادة التفعيل في حال فشل الحذف فقط
        setIsDeleteConfirmed(false);
        setPendingStoreId(null);
      },
    });
  };

  return {
    pendingStoreId,
    isDeleting,
    isDeleteConfirmed,
    requestDelete,
    confirmDelete,
    cancelDelete,
    /** تُمرَّر مباشرة إلى ConfirmDeleteModal */
    confirmModalProps: {
      isOpen: pendingStoreId !== null,
      onClose: cancelDelete,
      onConfirm: confirmDelete,
      ...MODAL_TEXTS,
    },
  };
}
