// src/features/(dashboard)/services/components/RejectServiceModal.tsx
"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { useCreateReportType } from "@/src/features/(dashboard)/reports/hooks";
import { useGetReportTypes as useGetWebReportTypes } from "@/src/features/(web)/reports/hooks";
import { Loader2 } from "lucide-react";

interface RejectServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** نص السبب المختار من القائمة + التوضيح الاختياري (يُدمَج في الصفحة الأم كما في المنتجات) */
    onConfirm: (reasonText: string, details: string) => void;
    isLoading: boolean;
}

export function RejectServiceModal({ isOpen, onClose, onConfirm, isLoading }: RejectServiceModalProps) {
    const [reasonId, setReasonId] = useState<string>("");
    const [details, setDetails] = useState<string>("");
    const [touched, setTouched] = useState(false);
    const [isAddingReason, setIsAddingReason] = useState(false);
    const [newReason, setNewReason] = useState("");
    const { mutate: createReason, isPending: isCreatingReason } = useCreateReportType();

    const { data: typesData, isLoading: isLoadingTypes } = useGetWebReportTypes();
    const allReasons = useMemo(
        () => (Array.isArray(typesData?.report_types) ? typesData.report_types : []),
        [typesData]
    );
    const reasons = useMemo(() => {
        const isRejectServiceCategory = (rawCategory?: string) => {
            const normalized = (rawCategory || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
            return normalized === "reject-service";
        };
        return allReasons.filter((reason) => isRejectServiceCategory(reason.category));
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

        const selectedReason = reasons.find((r) => String(r.id) === reasonId);
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
            { name: newReason, is_active: 1, category: "reject-service" },
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
                    أضف سبب رفض الخدمة هنا مع التوضيح لمقدّم الخدمة
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

                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium">التوضيح</label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="اكتب توضيحًا إضافيًا لمقدّم الخدمة (اختياري)..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:border-blue-4 text-sm resize-none"
                        />
                    </div>

                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading || isAddingReason}
                        className="w-full h-11 bg-[#EF4444] hover:bg-[#d93a3a] text-white font-bold rounded-md mt-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "رفض الخدمة"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
