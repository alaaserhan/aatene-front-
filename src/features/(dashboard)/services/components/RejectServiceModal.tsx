// src/features/(dashboard)/services/components/RejectServiceModal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
// استيراد هوك أنواع التقارير كما طلبت لاستخدامه كأسباب للرفض
import { useGetReportTypes } from "@/src/features/(dashboard)/reports/hooks"; 
import { Loader2 } from "lucide-react";

interface RejectServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reasonId: string, note: string) => void;
    isLoading: boolean;
}

export function RejectServiceModal({ isOpen, onClose, onConfirm, isLoading }: RejectServiceModalProps) {
    const [reasonId, setReasonId] = useState<string>("");
    const [note, setNote] = useState<string>("");

    // استخدام هوك أنواع التقارير لملء القائمة
    const { data: typesData, isLoading: isLoadingTypes } = useGetReportTypes();
    const reasons = typesData?.data || [];

    const handleConfirm = () => {
        if (!reasonId) return;
        onConfirm(reasonId, note);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl p-8 rounded-3xl gap-6">
                <div className="flex flex-col gap-2 mb-2">
                    <h2 className="text-xl font-bold text-[#1A2D42] text-right">أضف سبب رفض الخدمة هنا مع التوضيح للعميل</h2>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-700 text-right">سبب الحذف</label>
                        <Select value={reasonId} onValueChange={setReasonId}>
                            <SelectTrigger className="h-14 border-gray-200 bg-white text-right px-4 rounded-xl focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="اختر من هنا السبب" />
                            </SelectTrigger>
                            <SelectContent>
                                {isLoadingTypes ? (
                                    <div className="p-2 text-center text-sm text-gray-500">جاري التحميل...</div>
                                ) : (
                                    reasons.map((reason) => (
                                        <SelectItem key={reason.id} value={String(reason.id)} className="text-right justify-end" dir="rtl">
                                            {reason.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-700 text-right">التوضيح</label>
                        <Input 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="اكتب توضيح"
                            className="h-14 border-gray-200 bg-white text-right px-4 rounded-xl focus-visible:ring-0"
                        />
                    </div>

                    <Button 
                        onClick={handleConfirm}
                        disabled={!reasonId || isLoading}
                        className="w-full h-14 bg-[#5A7189] hover:bg-[#4a5d72] text-white font-bold text-lg rounded-xl mt-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "أرسل"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}