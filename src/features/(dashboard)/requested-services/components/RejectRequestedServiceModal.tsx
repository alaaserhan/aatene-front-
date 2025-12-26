// src/features/(dashboard)/requested-services/components/RejectRequestedServiceModal.tsx
"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { useGetReportTypes } from "@/src/features/(dashboard)/reports/hooks"; 
import { Loader2 } from "lucide-react";

interface RejectRequestedServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reasonText: string) => void;
    isLoading: boolean;
}

export function RejectRequestedServiceModal({ isOpen, onClose, onConfirm, isLoading }: RejectRequestedServiceModalProps) {
    const [reasonId, setReasonId] = useState<string>("");
    const [touched, setTouched] = useState(false);

    // جلب أسباب الرفض (نفترض استخدام نفس قائمة أنواع البلاغات أو أسباب الرفض العامة)
    const { data: typesData, isLoading: isLoadingTypes } = useGetReportTypes();
    const reasons = typesData?.data || [];

    const reasonOptions = useMemo(() => {
        return reasons.map((reason) => ({
            label: reason.name,
            value: String(reason.id),
        }));
    }, [reasons]);

    const handleConfirm = () => {
        setTouched(true);
        if (!reasonId) return;

        // ✅ البحث عن نص السبب لإرساله بدلاً من الـ ID
        const selectedReason = reasons.find(r => String(r.id) === reasonId);
        if (selectedReason) {
            onConfirm(selectedReason.name);
        }
    };

    const handleClose = () => {
        setReasonId("");
        setTouched(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-xl p-6 rounded-3xl gap-6" dir="rtl">
                <DialogTitle className="text-lg font-medium mb-2">
                   أضف سبب رفض الخدمة هنا مع التوضيح للعميل
                </DialogTitle>

                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium">
                            سبب الرفض <span className="text-red-500">*</span>
                        </label>
                        <ReusableDropdown
                            options={reasonOptions}
                            value={reasonId}
                            onChange={(val) => setReasonId(val)}
                            placeholder={isLoadingTypes ? "جاري التحميل..." : "اختر من هنا السبب"}
                            error={touched && !reasonId ? "يرجى اختيار سبب الرفض" : undefined}
                            className="h-12"
                        />
                    </div>

                    <Button 
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="w-full h-11 bg-[#EF4444] hover:bg-[#d93a3a] text-white font-bold rounded-md mt-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "رفض الخدمة"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}