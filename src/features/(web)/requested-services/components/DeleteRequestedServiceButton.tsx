"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { cn } from "@/src/lib/utils";
import { useDeleteRequestedService } from "../hooks";

interface DeleteRequestedServiceButtonProps {
    serviceId: number | string;
    /** "button" is the bordered header action; "link" is the inline text action on cards. */
    variant?: "button" | "link";
    onDeleted?: () => void;
    className?: string;
}

export function DeleteRequestedServiceButton({
    serviceId,
    variant = "button",
    onDeleted,
    className,
}: DeleteRequestedServiceButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { mutate, isPending } = useDeleteRequestedService();

    const handleConfirm = () => {
        mutate(serviceId, {
            onSuccess: () => {
                setIsOpen(false);
                onDeleted?.();
            },
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className={cn(
                    "flex shrink-0 cursor-pointer items-center font-medium transition-colors",
                    variant === "button"
                        ? "gap-2 rounded-md border border-c2-danger/30 bg-white px-4 py-2 text-xs text-c2-danger hover:bg-c2-danger hover:text-white"
                        : "gap-1 text-xs text-c2-danger hover:underline",
                    className,
                )}
            >
                <Trash2 className={variant === "button" ? "h-4 w-4" : "h-3 w-3"} />
                <span>حذف الطلب</span>
            </button>

            <ConfirmDeleteModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onConfirm={handleConfirm}
                title="هل أنت متأكد من حذف هذا الطلب؟"
                description="لا يمكن استرجاع الطلب بعد حذفه."
                confirmPosition="start"
                isLoading={isPending}
                autoCloseOnConfirm={false}
            />
        </>
    );
}
