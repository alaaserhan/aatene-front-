"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Phone } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { joinPhoneCountryCode, splitPhoneCountryCode } from "@/src/lib/phone";
import { cn } from "@/src/lib/utils";

interface StorePhoneDialogProps {
    phone: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StorePhoneDialog({ phone, open, onOpenChange }: StorePhoneDialogProps) {
    const [copied, setCopied] = useState(false);
    // Stores often save the bare local number, so always show and dial it in
    // international form, falling back to the default country code.
    const { countryCode, nationalNumber } = splitPhoneCountryCode(phone);
    const fullNumber = joinPhoneCountryCode(countryCode, nationalNumber);
    const displayNumber = `${countryCode} ${fullNumber.slice(countryCode.length)}`;

    useEffect(() => {
        if (!copied) return;
        const timeout = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(timeout);
    }, [copied]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullNumber);
            setCopied(true);
            toast.success("تم نسخ رقم الهاتف");
        } catch {
            toast.error("تعذر نسخ رقم الهاتف");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                dir="rtl"
                className="max-w-md gap-6 rounded-3xl! px-6 pt-8 pb-6 [&>button:last-child]:top-6 [&>button:last-child]:end-6 [&>button:last-child>svg]:size-6"
            >
                <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold text-c2-primary">
                    <Phone className="size-5 fill-current" strokeWidth={0} />
                    رقم الهاتف
                </DialogTitle>

                <p dir="ltr" className="text-center text-xl font-medium text-c2-neutral-1000">
                    {displayNumber}
                </p>

                <div className="mt-4 flex items-center gap-2">
                    <Button
                        asChild
                        className="h-12 flex-1 rounded-full bg-c2-navy-600 text-base font-normal text-white hover:bg-c2-navy-700"
                    >
                        <a href={`tel:${fullNumber}`}>اتصل الآن</a>
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleCopy}
                        aria-label="نسخ رقم الهاتف"
                        className={cn(
                            "h-12 min-w-28 gap-2 rounded-full px-5 text-base font-medium transition-colors",
                            copied
                                ? "bg-c2-success/10 text-c2-success hover:bg-c2-success/10 hover:text-c2-success"
                                : "bg-c2-navy-50 text-c2-navy-700 hover:bg-c2-navy-100 hover:text-c2-navy-700"
                        )}
                    >
                        {copied ? (
                            <Check className="size-5" strokeWidth={2.5} />
                        ) : (
                            <Copy className="size-5" />
                        )}
                        {copied ? "تم النسخ" : "نسخ"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
