"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/src/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/src/components/ui/dialog";

// --- OTP digits input ---

interface OtpInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    autoFocus?: boolean;
    disabled?: boolean;
    hasError?: boolean;
    className?: string;
}

export function OtpInput({
    value,
    onChange,
    length = 4,
    autoFocus = false,
    disabled = false,
    hasError = false,
    className,
}: OtpInputProps) {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    const toDigits = (val: string) => {
        const arr = val.replace(/\D/g, "").split("").slice(0, length);
        while (arr.length < length) arr.push("");
        return arr;
    };

    // The boxes own their layout so a gap (e.g. box 3 filled before box 2) is kept in place;
    // the parent only ever sees the joined digits.
    const [digits, setDigits] = React.useState<string[]>(() => toDigits(value));

    // Re-sync when the value is changed from the outside (reset, prefill, ...)
    if (value !== digits.join("") || digits.length !== length) {
        setDigits(toDigits(value));
    }

    React.useEffect(() => {
        if (autoFocus) inputRefs.current[0]?.focus();
    }, [autoFocus]);

    const emit = (next: string[]) => {
        setDigits(next);
        onChange(next.join(""));
    };

    const handleChange = (index: number, val: string) => {
        if (!/^\d*$/.test(val)) return;

        const next = [...digits];
        next[index] = val.slice(-1);
        emit(next);

        if (val && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            return;
        }
        // Arrows follow the visual (LTR) order of the boxes
        if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault();
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < length - 1) {
            e.preventDefault();
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        if (!pasted) return;

        const next = pasted.split("").concat(Array(length).fill("")).slice(0, length);
        emit(next);

        const firstEmpty = next.findIndex((digit) => !digit);
        inputRefs.current[firstEmpty === -1 ? length - 1 : firstEmpty]?.focus();
    };

    return (
        <div className={cn("flex w-full justify-center gap-3 sm:gap-4", className)} dir="ltr">
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    disabled={disabled}
                    aria-label={`رقم ${index + 1}`}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                    className={cn(
                        "h-16 w-16 sm:h-19 sm:w-19 rounded-2xl border text-center text-2xl sm:text-3xl font-semibold text-gray-7",
                        "transition-colors focus:outline-none focus:border-[#3D5E83] focus:ring-1 focus:ring-[#3D5E83]",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        digit ? "bg-[#F5F5F5] border-transparent" : "bg-white border-gray-4",
                        hasError && "border-red-500"
                    )}
                />
            ))}
        </div>
    );
}

// --- Full verification panel ---

export interface OtpVerificationProps {
    /** Called with the full code once the user confirms. */
    onVerify: (code: string) => void;
    /** Omit to hide the resend timer and link. */
    onResend?: () => void;
    title?: string;
    description?: React.ReactNode;
    length?: number;
    isVerifying?: boolean;
    isResending?: boolean;
    error?: string;
    confirmLabel?: string;
    /**
     * Countdown, in seconds, before resending is allowed again. Pass the *remaining*
     * seconds when the countdown has to survive this component unmounting (e.g. a
     * dialog the user closed and reopened).
     */
    resendSeconds?: number;
    /** Change this value to restart the countdown (e.g. after a new code is sent). */
    resendKey?: string | number;
    autoFocus?: boolean;
    className?: string;
    /** Rendered as the title/description elements — lets the dialog pass Radix's own primitives. */
    titleAs?: React.ElementType;
    descriptionAs?: React.ElementType;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export function OtpVerification({
    onVerify,
    onResend,
    title = "تم إرسال كود التحقق",
    description,
    length = 4,
    isVerifying = false,
    isResending = false,
    error,
    confirmLabel = "تأكيد الكود",
    resendSeconds = 60,
    resendKey,
    autoFocus = true,
    className,
    titleAs: Title = "h2",
    descriptionAs: Description = "p",
}: OtpVerificationProps) {
    const [code, setCode] = React.useState("");
    const [timer, setTimer] = React.useState(onResend ? resendSeconds : 0);

    // Restart the countdown whenever a new code is sent
    const [lastResendKey, setLastResendKey] = React.useState(resendKey);
    if (resendKey !== lastResendKey) {
        setLastResendKey(resendKey);
        setTimer(onResend ? resendSeconds : 0);
    }

    React.useEffect(() => {
        if (timer <= 0) return;
        const id = setTimeout(() => setTimer((t) => t - 1), 1000);
        return () => clearTimeout(id);
    }, [timer]);

    const isComplete = code.length === length;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isComplete || isVerifying) return;
        onVerify(code);
    };

    const handleResend = () => {
        if (!onResend || timer > 0 || isResending) return;
        setCode("");
        onResend();
    };

    return (
        <form
            onSubmit={handleSubmit}
            dir="rtl"
            className={cn("w-full flex flex-col items-center text-center", className)}
        >
            <Title className="text-2xl sm:text-[28px] font-bold text-gray-7">{title}</Title>

            {description && (
                <Description className="mt-4 text-sm leading-relaxed text-[#717171]">
                    {description}
                </Description>
            )}

            <div className="mt-8 w-full">
                <OtpInput
                    value={code}
                    onChange={setCode}
                    length={length}
                    autoFocus={autoFocus}
                    disabled={isVerifying}
                    hasError={!!error}
                />
                {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
            </div>

            {onResend && timer > 0 && (
                <p className="mt-5 text-sm font-medium text-[#3D5E83]">
                    إعادة إرسال رمز في {formatTime(timer)}
                </p>
            )}

            <button
                type="submit"
                disabled={!isComplete || isVerifying}
                className={cn(
                    "mt-6 w-full h-12.5 rounded-full bg-[#3D5E83] text-base font-medium text-white",
                    "flex items-center justify-center transition-colors hover:bg-[#2c4460] cursor-pointer",
                    (!isComplete || isVerifying) && "opacity-60 cursor-not-allowed hover:bg-[#3D5E83]"
                )}
            >
                {isVerifying ? <Loader2 className="h-5 w-5 animate-spin" /> : confirmLabel}
            </button>

            {onResend && (
                <div className="mt-5 flex items-center justify-center gap-1 text-sm">
                    <span className="text-[#717171]">لم تتلقى الكود ؟</span>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={timer > 0 || isResending}
                        className={cn(
                            "font-medium text-[#3D5E83] underline cursor-pointer",
                            (timer > 0 || isResending) && "opacity-50 no-underline cursor-not-allowed"
                        )}
                    >
                        {isResending ? "جاري الإرسال..." : "إعادة إرسال كود التحقق"}
                    </button>
                </div>
            )}
        </form>
    );
}

// --- Dialog wrapper ---

export interface OtpVerificationDialogProps extends OtpVerificationProps {
    isOpen: boolean;
    onClose: () => void;
    contentClassName?: string;
}

export function OtpVerificationDialog({
    isOpen,
    onClose,
    contentClassName,
    ...props
}: OtpVerificationDialogProps) {
    // Closing mid-request would leave the user unsure whether the code went through
    const isLocked = !!props.isVerifying;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open && !isLocked) onClose();
            }}
        >
            <DialogContent
                dir="rtl"
                className={cn("sm:max-w-120 p-6 sm:p-10", contentClassName)}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => isLocked && e.preventDefault()}
                onInteractOutside={(e) => isLocked && e.preventDefault()}
            >
                <OtpVerification
                    {...props}
                    titleAs={DialogTitle}
                    descriptionAs={DialogDescription}
                />
            </DialogContent>
        </Dialog>
    );
}
