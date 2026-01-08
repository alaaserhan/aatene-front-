// src/features/(dashboard)/services/components/RejectServiceModal.tsx
"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { FormInput } from "@/src/components/ui/FormInput";
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

    // استبدال useGetReportTypes بالقيم الثابتة
    const reasons = [
        "الوصف غير واضح أو ناقص",
        "معلومات الخدمة غير دقيقة",
        "يخالف سياسات وشروط المنصة",
        "الخدمة مكررة أو مشابهة لخدمات موجودة",
        "الجودة لا تتوافق مع معايير المنصة",
        "صور أو وسائط غير مطابقة للمعايير"
    ];

    // تحويل البيانات لتناسب ReusableDropdown
    const reasonOptions = useMemo(() => {
        return reasons.map((reason) => ({
            label: reason,
            value: reason, // القيمة هي نفس النص
        }));
    }, []);

    const handleConfirm = () => {
        setTouched(true);
        
        // المنطق المطلوب: إذا تم ملء "سبب آخر" نستخدمه، وإلا نستخدم القائمة المنسدلة
        const finalReason = note.trim() ? note.trim() : reasonId;

        if (!finalReason) return; // يجب اختيار أحدهما على الأقل

        // نرسل النص في الحقل الثاني (note/reason) ونترك الأول (id) فارغاً
        // لأننا نرسل نصاً وليس ID قاعدة بيانات
        onConfirm("", finalReason);
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
                            placeholder="اختر من هنا السبب"
                            error={touched && !reasonId && !note.trim() ? "يرجى اختيار سبب الرفض أو كتابة سبب آخر" : undefined}
                            className="h-12"
                        />
                    </div>

                    {/* استبدال Input بـ FormInput */}
                    <div className="flex flex-col gap-1">
                        <FormInput
                            label="سبب اخر"
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