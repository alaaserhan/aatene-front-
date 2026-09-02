"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { sanitizeHtmlDocument } from "@/src/lib/utils";

interface NotificationBodyModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    /** Raw notification body — a full HTML email document coming from the backend. */
    body: string;
}

export function NotificationBodyModal({ isOpen, onClose, title, body }: NotificationBodyModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden" dir="rtl">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-c2-neutral-200">
                    <DialogTitle className="text-lg font-bold text-c2-navy-900">
                        {title || "محتوى الإشعار"}
                    </DialogTitle>
                </DialogHeader>

                {/*
                    Email bodies are complete HTML documents with their own <style>
                    block and layout. They render in a sandboxed iframe so their CSS
                    stays scoped to the iframe document instead of leaking into the
                    app, and so any script/form in the markup stays inert.
                */}
                <iframe
                    title={title || "محتوى الإشعار"}
                    srcDoc={sanitizeHtmlDocument(body)}
                    sandbox="allow-popups allow-popups-to-escape-sandbox"
                    referrerPolicy="no-referrer"
                    className="w-full h-[70vh] border-0 bg-white"
                />
            </DialogContent>
        </Dialog>
    );
}
