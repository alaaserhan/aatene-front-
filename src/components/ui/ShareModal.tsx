// src/components/ui/ShareModal.tsx
"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Copy, Facebook, Twitter, Instagram } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareUrl: string;       // تم تغيير الاسم من productUrl ليكون عاماً
    title?: string;         // عنوان المودال (اختياري)
    description?: string;   // وصف المودال (اختياري)
}

export function ShareModal({
    isOpen,
    onClose,
    shareUrl,
    title = "شارك هذا المحتوى",
    description = "قم بمشاركة الرابط مع أصدقائك عبر منصات التواصل الاجتماعي",
}: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("تم نسخ الرابط بنجاح");
        setTimeout(() => setCopied(false), 2000);
    };

    const socialLinks = [
        {
            name: "Twitter",
            icon: Twitter,
            color: "text-[#1DA1F2]",
            bgColor: "bg-[#1DA1F2]/10",
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                shareUrl
            )}`,
        },
        {
            name: "Facebook",
            icon: Facebook,
            color: "text-[#4267B2]",
            bgColor: "bg-[#4267B2]/10",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl
            )}`,
        },
        {
            name: "Instagram",
            icon: Instagram,
            color: "text-[#E1306C]",
            bgColor: "bg-[#E1306C]/10",
            href: "#",
        },
        {
            name: "WhatsApp",
            icon: WhatsAppIcon,
            color: "text-[#25D366]",
            bgColor: "bg-[#25D366]/10",
            href: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
        },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="sm:max-w-md p-0 overflow-hidden bg-white border-none shadow-xl"
                dir="rtl"
            >
                <VisuallyHidden>
                    <DialogTitle>{title}</DialogTitle>
                </VisuallyHidden>
                <div className="p-6 relative">

                    <div className="text-center space-y-2 mt-2">
                        <h2 className="text-2xl font-bold text-[#1A2D42]">
                            {title}
                        </h2>
                        <p className="text-sm text-gray-2">
                            {description}
                        </p>
                    </div>

                    <div className="flex justify-center gap-6 py-8">
                        {socialLinks.map((social) => (
                            <a
                                key={social.name}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 group cursor-pointer"
                            >
                                <div
                                    className={cn(
                                        "w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                                        social.bgColor
                                    )}
                                >
                                    <social.icon className={cn("w-7 h-7", social.color)} />
                                </div>
                                <span className={cn("text-xs font-medium", social.color)}>
                                    {social.name}
                                </span>
                            </a>
                        ))}
                    </div>

                    <div className="relative flex items-center mt-2">
                        <div
                            className="absolute left-3 flex items-center cursor-pointer p-2 hover:bg-gray-100 rounded-md transition-colors"
                            onClick={handleCopy}
                            title="نسخ الرابط"
                        >
                            <Copy
                                className={cn(
                                    "w-5 h-5 transition-colors",
                                    copied ? "text-green-500" : "text-gray-2"
                                )}
                            />
                        </div>
                        <Input
                            readOnly
                            value={shareUrl}
                            className="pr-4 pl-12 py-6 text-sm text-gray-2 bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-3 text-left w-full rounded-lg dir-ltr"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}