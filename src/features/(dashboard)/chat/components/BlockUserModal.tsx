"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

interface BlockUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isLoading?: boolean;
}

export function BlockUserModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
}: BlockUserModalProps) {
    const [reason, setReason] = useState("");

    const handleSubmit = () => {
        onConfirm(reason);
    };

    const handleClose = () => {
        if (isLoading) return;
        setReason("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader className="">
                    <DialogTitle className="text-lg font-semibold ">
                        حظر المستخدم
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block text-right">
                            سبب الحظر
                        </label>
                        <Input
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="أضف سبب الحظر هنا"
                            className="text-right"
                            dir="rtl"
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? "جاري الحظر..." : "أرسل"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
