"use client";

import { useMemo, useState } from "react";
import { Code2, Eye } from "lucide-react";
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
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
.title {
  color: #2d496a;
  font-size: 24px;
  margin: 0 0 12px;
}
.text {
  color: #555555;
  font-size: 15px;
  line-height: 1.8;
}
.button {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 24px;
  background-color: #2d496a;
  color: #ffffff;
  text-decoration: none;
  border-radius: 6px;
}
</style>
</head>
<body>
  <div class="container">
    <h1 class="title">عرض خاص في سلتك</h1>
    <p class="text">مرحباً، لديك عرض جديد يمكنك الاستفادة منه الآن.</p>
    <a class="button" href="#">مشاهدة العرض</a>
  </div>
</body>
</html>`;

export function CreateTemplateModal({
    isOpen,
    onClose,
    initialData,
}: CreateTemplateModalProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [content, setContent] = useState(initialData?.content || DEFAULT_CONTENT);
    const previewHtml = useMemo(() => content || "<!DOCTYPE html><html><body></body></html>", [content]);

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
            <DialogContent className="max-w-6xl p-0 overflow-hidden flex flex-col max-h-[92vh] text-right" dir="rtl">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-5">
                    <DialogTitle className="text-lg font-medium">
                        {initialData ? "تعديل قالب ايميل" : "اضافة قالب ايميل"}
                    </DialogTitle>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <section className="min-w-0 border-b border-gray-200 lg:border-b-0 lg:border-l">
                                <div className="flex h-10 items-center justify-between border-b border-gray-100 bg-gray-50 px-3">
                                    <span className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                        <Code2 className="h-4 w-4 text-blue-3" />
                                        محرر HTML
                                    </span>
                                    <span className="text-xs text-gray-400">{content.length} حرف</span>
                                </div>
                                <textarea
                                    className="h-[420px] w-full resize-none bg-white p-4 font-mono text-[13px] leading-6 text-gray-800 outline-none selection:bg-blue-100 placeholder:text-gray-400"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    dir="ltr"
                                    spellCheck={false}
                                    placeholder="<!DOCTYPE html>"
                                />
                            </section>

                            <section className="min-w-0">
                                <div className="flex h-10 items-center justify-between border-b border-gray-100 bg-gray-50 px-3">
                                    <span className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                        <Eye className="h-4 w-4 text-blue-3" />
                                        معاينة القالب
                                    </span>
                                    <span className="text-xs text-gray-400">iframe</span>
                                </div>
                                <div className="h-[420px] bg-gray-100 p-3">
                                    <iframe
                                        title="معاينة قالب البريد الإلكتروني"
                                        srcDoc={previewHtml}
                                        sandbox=""
                                        className="h-full w-full rounded-md border border-gray-200 bg-white"
                                    />
                                </div>
                            </section>
                        </div>
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
