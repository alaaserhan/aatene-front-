// src/features/(dashboard)/services/components/RejectServiceModal.tsx
"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { FormInput } from "@/src/components/ui/FormInput";
import { useGetReportTypes } from "@/src/features/(dashboard)/reports/hooks"; 
import { Loader2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // في حال أردت إخفاء العنوان، لكننا سنستخدمه كعنوان ظاهر

interface RejectServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reasonId: string, note: string) => void;
    isLoading: boolean;
}

export function RejectServiceModal({ isOpen, onClose, onConfirm, isLoading }: RejectServiceModalProps) {
    const [reasonId, setReasonId] = useState<string>("");
    const [note, setNote] = useState<string>("");
    const [touched, setTouched] = useState(false); // لمعرفة هل حاول المستخدم الارسال

    const { data: typesData, isLoading: isLoadingTypes } = useGetReportTypes();
    const reasons = typesData?.data || [];

    // تحويل البيانات لتناسب ReusableDropdown
    const reasonOptions = useMemo(() => {
        return reasons.map((reason) => ({
            label: reason.name,
            value: String(reason.id),
        }));
    }, [reasons]);

    const handleConfirm = () => {
        setTouched(true);
        if (!reasonId) return;
        onConfirm(reasonId, note);
    };

    // إعادة تعيين الحالة عند الإغلاق
    const handleClose = () => {
        setReasonId("");
        setNote("");
        setTouched(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-xl p-6 rounded-3xl gap-6" dir="rtl">
                {/* حل مشكلة Accessibility بإضافة DialogTitle */}
                <DialogTitle className="text-lg font-medium  mb-2">
                    أضف سبب رفض الخدمة هنا مع التوضيح للعميل
                </DialogTitle>

                <div className="flex flex-col gap-6">
                    {/* استبدال Select بـ ReusableDropdown */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-700">
                            سبب الحذف <span className="text-red-500">*</span>
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

                    {/* استبدال Input بـ FormInput */}
                    <div className="flex flex-col gap-1">
                        <FormInput
                            label="التوضيح"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="اكتب توضيح (اختياري)"
                            className="h-12 bg-white"
                        />
                    </div>

                    <Button 
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="w-full h-12 bg-blue-4 hover:bg-[#4a5d72] text-white font-bold rounded-md mt-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "أرسل"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}