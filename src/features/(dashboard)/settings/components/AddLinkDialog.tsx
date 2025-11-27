// src/features/(dashboard)/settings/components/AddLinkDialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

interface AddLinkDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialText?: string;
    initialUrl?: string;
    onSave: (text: string, url: string) => void;
}

export function AddLinkDialog({
    isOpen,
    onClose,
    initialText = "",
    initialUrl = "",
    onSave,
}: AddLinkDialogProps) {
    const [text, setText] = useState(initialText);
    const [url, setUrl] = useState(initialUrl);

    const handleSave = () => {
        if (url.trim()) {
            onSave(text, url);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold  mb-4">
                        إضافة لينك
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium  block">النص</Label>
                        <Input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="معرفة المزيد عن التكنولوجيا"
                            className=""
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium block">اللينك</Label>
                        <Input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center gap-4 mt-4">
                    <Button
                        onClick={handleSave}
                        className="bg-[#3A5779] text-white hover:bg-[#2c425e] min-w-[100px]"
                    >
                        حفظ
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        className="bg-gray-200 text-gray-700 hover:bg-gray-300 min-w-[100px]"
                    >
                        إلغاء واغلاق
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}