"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { FormInput } from "@/src/components/ui/FormInput";
import { NotificationTemplate } from "../api";
import { useCreateNotificationTemplate, useUpdateNotificationTemplate } from "../hooks";

interface CreateTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: NotificationTemplate | null;
}

const DEFAULT_CONTENT = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<title>عرض خاص في سلتك</title>
<style>
body {
  font-family: Tahoma, Arial, sans-serif;
  background-color: #f9f9f9;
  margin: 0;
  padding: 0;
  direction: rtl;
}
.container {
  max-width: 600px;
  margin: 30px auto;
  background-color: #ffffff;
  padding: 30px;
}
</style>`;

export function CreateTemplateModal({
    isOpen,
    onClose,
    initialData,
}: CreateTemplateModalProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [content, setContent] = useState(initialData?.content || DEFAULT_CONTENT);

    const createMutation = useCreateNotificationTemplate();
    const updateMutation = useUpdateNotificationTemplate();

    const handleSubmit = () => {
        if (!title.trim() || !content.trim()) return;

        if (initialData) {
            updateMutation.mutate({
                id: initialData.id,
                payload: {
                    key: initialData.key,
                    title,
                    content,
                    is_active: initialData.is_active,
                }
            }, {
                onSuccess: () => {
                    onClose();
                }
            });
        } else {
            createMutation.mutate({
                key: title.toLowerCase().replace(/\s+/g, "_"), // Simple slug generation
                title,
                content,
                is_active: true
            }, {
                onSuccess: () => {
                    onClose();
                }
            });
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl p-0 overflow-hidden text-right" dir="rtl">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-5">
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                        {initialData ? "تعديل قالب ايميل" : "اضافة قالب ايميل"}
                    </DialogTitle>
                </div>

                <div className="p-6 space-y-6">
                    <FormInput
                        label="عنوان القالب"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="عنوان القالب"
                        maxLength={50}
                        showCounter
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            كود القالب html <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            className="w-full h-[350px] p-3 text-sm border border-gray-300 rounded-md focus:border-blue-3 focus:ring-1 focus:ring-blue-3 outline-none dir-ltr font-mono"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            dir="ltr"
                        />
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                        disabled={isLoading}
                    >
                        الغاء
                    </button>
                    <button
                        className="px-6 py-2 rounded-md bg-blue-3 text-white font-medium hover:bg-blue-4 transition-colors disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? "جاري الحفظ..." : "حفظ"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
