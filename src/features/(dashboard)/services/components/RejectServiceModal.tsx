// src/features/(dashboard)/services/components/RejectServiceModal.tsx
"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { FormInput } from "@/src/components/ui/FormInput";
import { Loader2 } from "lucide-react";
import { useCreateReportType } from "@/src/features/(dashboard)/reports/hooks";

interface RejectServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reasonId: string, note: string) => void;
    isLoading: boolean;
    reasonsList?: any[];
    isLoadingReasons?: boolean;
}

export function RejectServiceModal({ isOpen, onClose, onConfirm, isLoading, reasonsList = [], isLoadingReasons = false }: RejectServiceModalProps) {
    const [reasonId, setReasonId] = useState<string>("");
    const [note, setNote] = useState<string>("");
    const [touched, setTouched] = useState(false);

    const [isAddingReason, setIsAddingReason] = useState(false);
    const [newReason, setNewReason] = useState("");
    const { mutate: createReason, isPending: isCreatingReason } = useCreateReportType();

    // استخدام البيانات الممررة عبر Props
    const reasons = reasonsList || [];

    const reasonOptions = useMemo(() => {
        return reasons.map((reason) => ({
            label: reason.name,
            value: String(reason.id),
        }));
    }, [reasons]);

    const handleConfirm = () => {
        setTouched(true);

        // إذا كتب ملاحظة يدوية نعتبرها، وإلا نبحث عن نص السبب المختار
        let finalReason = note.trim();

        if (!finalReason && reasonId) {
            const selected = reasons.find(r => String(r.id) === reasonId);
            if (selected) finalReason = selected.name;
        }

        if (!finalReason) return;

        // نرسل النص في الحقل الثاني (note) كما كان في الكود السابق
        onConfirm("", finalReason);
    };

    const handleClose = () => {
        setReasonId("");
        setNote("");
        setNewReason("");
        setIsAddingReason(false);
        setTouched(false);
        onClose();
    };

    const handleCreateReason = () => {
        if (!newReason.trim()) return;
        createReason(
            { name: newReason, is_active: 1 },
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
                <DialogTitle className="text-lg font-medium  mb-2">
                    أضف سبب رفض الخدمة هنا مع التوضيح للعميل
                </DialogTitle>

                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-700">
                            سبب الرفض <span className="text-red-500">*</span>
                        </label>
                        {!isAddingReason ? (
                            <ReusableDropdown
                                options={reasonOptions}
                                value={reasonId}
                                onChange={(val) => setReasonId(val)}
                                placeholder={isLoadingReasons ? "جاري التحميل..." : "اختر من هنا السبب"}
                                error={touched && !reasonId && !note.trim() ? "يرجى اختيار سبب الرفض أو كتابة سبب آخر" : undefined}
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
                        disabled={isLoading || isAddingReason}
                        className="w-full h-12 bg-blue-4 hover:bg-[#4a5d72] text-white font-bold rounded-md mt-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "أرسل"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}