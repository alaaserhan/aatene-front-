"use client";

import { useState, useEffect } from "react";
import { useGetAccount, useUpdateEmail, useVerifyEmailUpdate } from "../../hooks";
import { cn } from "@/src/lib/utils";
import { z } from "zod";
import { OtpVerificationDialog } from "@/src/components/ui/OtpVerification";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// Validation Schema
const emailSchema = z.object({
    email: z.string().min(1, "البريد الإلكتروني مطلوب").email("البريد الإلكتروني غير صالح"),
});

type FormErrors = Partial<Record<keyof typeof emailSchema.shape, string>>;

/** Seconds to wait before another code can be requested. */
const RESEND_SECONDS = 60;

/** The backend sends this flag as a boolean, a number, or a numeric string. */
const isFlagOn = (value: unknown) =>
    value === true || value === 1 || value === "1" || value === "true";

export default function EmailTab() {
    const { data: accountData, isLoading: isLoadingAccount } = useGetAccount();
    const { mutate: updateEmail } = useUpdateEmail();
    const { mutate: verifyEmailUpdate, isPending: isVerifying } = useVerifyEmailUpdate();

    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});

    // Verification session started once the code is sent to the new email.
    // It outlives the dialog: closing the dialog only hides it, so the user can
    // reopen it and enter the code without asking for a new one.
    const [verification, setVerification] = useState<{
        id: string | number;
        email: string;
        resendAvailableAt: number;
        /** "verify" confirms the saved address as-is, "change" switches to a new one. */
        mode: "verify" | "change";
    } | null>(null);
    const [isOtpOpen, setIsOtpOpen] = useState(false);
    // All three actions share one send mutation, so track which one is in flight
    // to keep each button's loading state on its own button.
    const [sending, setSending] = useState<"change" | "verify" | "resend" | null>(null);
    // Seconds left on the resend countdown, recomputed every time the dialog is opened
    const [otpResend, setOtpResend] = useState({ key: 0, seconds: RESEND_SECONDS });

    useEffect(() => {
        if (accountData?.user?.email) {
            setEmail(accountData.user.email);
        }
    }, [accountData]);

    const currentEmail = accountData?.user?.email ?? "";
    const isEmailVerified = isFlagOn(accountData?.user?.is_email_verified);
    const trimmedEmail = email.trim();
    const isSameAsCurrent = trimmedEmail.toLowerCase() === currentEmail.trim().toLowerCase();
    const isAwaitingCode = verification?.email.toLowerCase() === trimmedEmail.toLowerCase();
    const canSave = !!trimmedEmail && !isSameAsCurrent && !isAwaitingCode && !sending;
    // Only vouch for the address that is actually saved and verified
    const showVerifiedMark = isEmailVerified && isSameAsCurrent && !!currentEmail;

    const validateForm = () => {
        const result = emailSchema.safeParse({ email });
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as keyof FormErrors;
                fieldErrors[path] = issue.message;
            });
            setErrors(fieldErrors);
            return false;
        }
        setErrors({});
        return true;
    };

    const startVerification = (target: string, mode: "verify" | "change", isResend = false) => {
        setSending(isResend ? "resend" : mode);
        updateEmail(target, {
            onSuccess: (res) => {
                setVerification({
                    id: res.id,
                    email: target,
                    mode,
                    resendAvailableAt: Date.now() + RESEND_SECONDS * 1000,
                });
                setOtpResend((prev) => ({ key: prev.key + 1, seconds: RESEND_SECONDS }));
                setIsOtpOpen(true);
            },
            onSettled: () => setSending(null),
        });
    };

    /** Reopens the dialog with whatever is left of the resend countdown. */
    const handleReopenOtp = () => {
        if (!verification) return;

        const remaining = Math.max(
            0,
            Math.ceil((verification.resendAvailableAt - Date.now()) / 1000)
        );
        setOtpResend((prev) => ({ key: prev.key + 1, seconds: remaining }));
        setIsOtpOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSave || !validateForm()) return;
        startVerification(email.trim(), "change");
    };

    /** Confirms the saved address without changing it — registration doesn't enforce verification. */
    const handleVerifyCurrent = () => {
        if (!currentEmail || sending) return;
        setErrors({});
        startVerification(currentEmail, "verify");
    };

    const handleResend = () => {
        if (!verification || sending) return;
        startVerification(verification.email, verification.mode, true);
    };

    const handleVerify = (code: string) => {
        if (!verification) return;

        verifyEmailUpdate(
            { id: verification.id, code, email: verification.email },
            {
                onSuccess: () => {
                    setVerification(null);
                    setIsOtpOpen(false);
                },
            }
        );
    };

    /** Drops the pending verification and puts the field back to the saved email. */
    const handleCancelVerification = () => {
        setVerification(null);
        setIsOtpOpen(false);
        setEmail(currentEmail);
        setErrors({});
    };

    if (isLoadingAccount) {
        return <div className="text-center py-10">جاري التحميل...</div>;
    }

    return (
        <>
            <div className="rounded-xl p-4 md:p-6 border border-gray-200 bg-white ">
                {/* Header Section */}
                <div className="flex flex-col mb-6">
                    <h1 className="text-3xl font-medium mb-2 text-[#3D3D3D]">
                        البريد الإلكتروني
                    </h1>
                    <p className="text-gray-400 text-sm">
                        تغيير البريد الالكتروني
                    </p>
                </div>

                <div className="border-b border-gray-100 mb-8 w-full" />

                <form onSubmit={handleSubmit} className="w-full">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-[#4B5563] text-right">
                                بريد إلكتروني
                            </label>
                            <div className="flex flex-col gap-1">
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@domain.com"
                                        className={cn(
                                            "w-full px-6 py-3.5 border rounded-full focus:outline-none focus:border-gray-400 text-right bg-[#FFFFFF] transition-colors",
                                            errors.email ? "border-red-500" : "border-gray-200",
                                            showVerifiedMark && "pl-12"
                                        )}
                                        dir="ltr"
                                    />
                                    {showVerifiedMark && (
                                        <span
                                            title="بريد إلكتروني مُفعّل"
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="sr-only">بريد إلكتروني مُفعّل</span>
                                        </span>
                                    )}
                                </div>
                                {errors.email && <p className="text-red-500 text-xs px-4">{errors.email}</p>}
                            </div>
                        </div>

                        {/* Unverified account email — registration doesn't enforce verification */}
                        {!isEmailVerified && !!currentEmail && !verification && (
                            <div className="bg-gold-1/10 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-gold-1 shrink-0 mt-0.5" />
                                    <p className="text-xs text-gold-1 leading-relaxed">
                                        بريدك الإلكتروني{" "}
                                        <span dir="ltr" className="font-medium">
                                            {currentEmail}
                                        </span>{" "}
                                        غير مُفعّل. يمكنك تفعيله الآن.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleVerifyCurrent}
                                    disabled={!!sending}
                                    className={cn(
                                        "bg-gold-1 text-white px-5 py-2 rounded-full text-xs font-medium shrink-0 cursor-pointer hover:opacity-90 transition-opacity",
                                        !!sending && "opacity-60 cursor-not-allowed"
                                    )}
                                >
                                    {sending === "verify" ? "جاري الإرسال..." : "تفعيل البريد الإلكتروني"}
                                </button>
                            </div>
                        )}

                        {/* Pending verification — shown once the dialog is dismissed without confirming */}
                        {verification && !isOtpOpen && (
                            <div className="bg-blue-6 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                                <p className="text-xs text-blue-4 leading-relaxed">
                                    بانتظار تأكيد الكود المُرسل إلى{" "}
                                    <span dir="ltr" className="font-medium">
                                        {verification.email}
                                    </span>
                                    .{" "}
                                    {verification.mode === "verify"
                                        ? "لن يتم تفعيل بريدك الإلكتروني قبل تأكيد الكود."
                                        : "لن يتم تغيير بريدك الإلكتروني قبل تأكيد الكود."}
                                </p>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleReopenOtp}
                                        className="bg-[#3D5E83] text-white px-5 py-2 rounded-full text-xs font-medium cursor-pointer hover:bg-[#324d6d] transition-colors"
                                    >
                                        إدخال الكود
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelVerification}
                                        className="text-gray-2 px-3 py-2 rounded-full text-xs font-medium cursor-pointer hover:text-gray-7 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={!canSave}
                                title={
                                    isSameAsCurrent
                                        ? "هذا هو بريدك الإلكتروني الحالي"
                                        : isAwaitingCode
                                            ? "بانتظار تأكيد الكود المُرسل إلى هذا البريد"
                                            : undefined
                                }
                                className={cn(
                                    "bg-[#3D5E83] text-white px-16 py-2.5 rounded-full font-medium transition-all shadow-sm active:scale-95 cursor-pointer hover:bg-[#324d6d]",
                                    !canSave && "opacity-60 cursor-not-allowed hover:bg-[#3D5E83] active:scale-100"
                                )}
                            >
                                {sending === "change" ? "جاري الحفظ..." : "حفظ"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <OtpVerificationDialog
                isOpen={isOtpOpen && !!verification}
                onClose={() => setIsOtpOpen(false)}
                onVerify={handleVerify}
                onResend={handleResend}
                isVerifying={isVerifying}
                isResending={sending === "resend"}
                resendSeconds={otpResend.seconds}
                resendKey={otpResend.key}
                title="تم إرسال كود التحقق"
                description={
                    <>
                        أرسلنا كود تحقق إلى بريدك الإلكتروني
                        {verification?.mode === "change" ? " الجديد" : ""}{" "}
                        <span dir="ltr" className="font-medium text-gray-7">
                            {verification?.email}
                        </span>{" "}
                        {verification?.mode === "verify"
                            ? "يرجى إدخال الكود للتأكد من صحة البريد وتفعيله."
                            : "يرجى إدخال الكود للتأكد من صحة البريد وتفعيل التغيير."}{" "}
                        تحقق من صندوق الوارد أو مجلد الرسائل غير المرغوب فيها (Spam).
                    </>
                }
            />
        </>
    );
}
