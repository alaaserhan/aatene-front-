// src/features/(dashboard)/products/components/RejectProductModal.tsx
"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { useGetReportTypes, useCreateReportType } from "@/src/features/(dashboard)/reports/hooks";
import { Loader2 } from "lucide-react";

interface RejectProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reasonText: string, details: string) => void;
    isLoading: boolean;
}

export function RejectProductModal({ isOpen, onClose, onConfirm, isLoading }: RejectProductModalProps) {
    const [reasonId, setReasonId] = useState<string>("");
    const [details, setDetails] = useState<string>("");
    const [touched, setTouched] = useState(false);
    const [isAddingReason, setIsAddingReason] = useState(false);
    const [newReason, setNewReason] = useState("");
    const { mutate: createReason, isPending: isCreatingReason } = useCreateReportType();

    const { data: typesData, isLoading: isLoadingTypes } = useGetReportTypes({ enabled: isOpen });
    const allReasons = typesData?.data ?? typesData?.report_types ?? [];
    const reasons = useMemo(() => {
        const hasCategoryInfo = allReasons.some((reason) => typeof reason.category === "string" && reason.category.length > 0);
        if (!hasCategoryInfo) {
            // Fallback for responses that don't include category: keep previous behavior and show all.
            return allReasons;
        }
        return allReasons.filter(
            (reason) => reason.category === "reject-product" || reason.category === "product"
        );
    }, [allReasons]);

    const reasonOptions = useMemo(() => {
        return reasons.map((reason) => ({
            label: reason.name,
            value: String(reason.id),
        }));
    }, [reasons]);

    const handleConfirm = () => {
        setTouched(true);
        if (!reasonId) return;

        const selectedReason = reasons.find(r => String(r.id) === reasonId);
        if (selectedReason) {
            onConfirm(selectedReason.name, details.trim());
        }
    };

    const handleClose = () => {
        setReasonId("");
        setDetails("");
        setNewReason("");
        setIsAddingReason(false);
        setTouched(false);
        onClose();
    };

    const handleCreateReason = () => {
        if (!newReason.trim()) return;
        createReason(
            { name: newReason, is_active: 1, category: "reject-product" },
            {
                onSuccess: () => {
                    setIsAddingReason(false);
                    setNewReason("");
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-xl p-6 rounded-3xl gap-6" dir="rtl">
                <DialogTitle className="text-lg font-medium mb-2">
                    أضف سبب رفض المنتج هنا مع التوضيح للتاجر
                </DialogTitle>

                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium">
                            سبب الرفض <span className="text-red-500">*</span>
                        </label>
                        {!isAddingReason ? (
                            <ReusableDropdown
                                options={reasonOptions}
                                value={reasonId}
                                onChange={(val) => setReasonId(val)}
                                placeholder={isLoadingTypes ? "جاري التحميل..." : "اختر من هنا السبب"}
                                error={touched && !reasonId ? "يرجى اختيار سبب الرفض" : undefined}
                                className="h-12"
                                onAddNew={() => setIsAddingReason(true)}
                                addNewLabel="إضافة سبب رفض جديد"
                            />
                        ) : (
                            <div className="flex gap-2 items-start">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={newReason}
                                        onChange={(e) => setNewReason(e.target.value)}
                                        placeholder="ادخل سبب الرفض الجديد..."
                                        className="w-full h-12 px-4 border border-gray-200 rounded-md focus:outline-none focus:border-blue-4 text-sm"
                                        autoFocus
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleCreateReason}
                                    disabled={isCreatingReason || !newReason.trim()}
                                    className="h-12 px-4 bg-blue-4 text-white"
                                >
                                    {isCreatingReason ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddingReason(false);
                                        setNewReason("");
                                    }}
                                    className="h-12 px-4"
                                >
                                    إلغاء
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* التوضيح */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium">
                            التوضيح
                        </label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="اكتب توضيحًا إضافيًا للتاجر (اختياري)..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:border-blue-4 text-sm resize-none"
                        />
                    </div>

                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading || isAddingReason}
                        className="w-full h-11 bg-[#EF4444] hover:bg-[#d93a3a] text-white font-bold rounded-md mt-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "رفض المنتج"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
