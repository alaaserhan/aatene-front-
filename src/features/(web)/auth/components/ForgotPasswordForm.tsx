"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";

import {
    useSendCode,
    useResendCode,
    useVerifyCode,
    useResetPassword,
} from "../hooks";
import { useLanguage } from "@/src/hooks/use-language";

// --- Schemas ---

const sendCodeSchema = z.object({
    identifier: z.string().min(1, "البريد الإلكتروني مطلوب").email("بريد إلكتروني غير صالح"),
});

const verifyCodeSchema = z.object({
    code: z.string().min(4, "الكود يجب أن يكون 4 أرقام").max(6, "الكود يجب أن يكون 6 أرقام"),
});

const resetPasswordSchema = z.object({
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    password_confirmation: z.string().min(6, "تأكيد كلمة المرور مطلوب"),
}).refine((data) => data.password === data.password_confirmation, {
    message: "كلمات المرور غير متطابقة",
    path: ["password_confirmation"],
});

type SendCodeData = z.infer<typeof sendCodeSchema>;
type VerifyCodeData = z.infer<typeof verifyCodeSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// --- OTP Input Component ---
interface OTPInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
}

function OTPInput({ value, onChange, length = 4 }: OTPInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [otp, setOtp] = useState<string[]>(Array(length).fill(""));

    useEffect(() => {
        // Initialize OTP from value prop
        const otpArray = value.split("").slice(0, length);
        while (otpArray.length < length) otpArray.push("");
        setOtp(otpArray);
    }, [value, length]);

    const handleChange = (index: number, val: string) => {
        if (!/^\d*$/.test(val)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = val.slice(-1); // Take only last digit
        setOtp(newOtp);
        onChange(newOtp.join(""));

        // Auto-focus next input
        if (val && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        const newOtp = pastedData.split("").concat(Array(length).fill("")).slice(0, length);
        setOtp(newOtp);
        onChange(newOtp.join(""));

        // Focus the next empty input or last input
        const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
        const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
        inputRefs.current[focusIndex]?.focus();
    };

    return (
        <div className="flex gap-3 justify-center" dir="ltr">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-14 h-14 text-center text-xl font-semibold border border-[#E3E3E3] rounded-lg bg-white focus:border-[#3D5E83] focus:ring-1 focus:ring-[#3D5E83] focus:outline-none transition-colors text-[#1C1C1C]"
                />
            ))}
        </div>
    );
}

// --- Components ---

export function ForgotPasswordForm() {
    const router = useRouter();
    const lang = useLanguage();
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // State to hold data across steps
    const [identifier, setIdentifier] = useState("");
    const [requestId, setRequestId] = useState(""); // The 'id' returned from sendCode/verifyCode
    const [verifiedCode, setVerifiedCode] = useState("");
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Password visibility states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Resend timer
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Hooks
    const { mutate: sendCode, isPending: isSending } = useSendCode();
    const { mutate: resendCode, isPending: isResending } = useResendCode();
    const { mutate: verifyCode, isPending: isVerifying } = useVerifyCode();
    const { mutate: resetPassword, isPending: isResetting } = useResetPassword();

    // --- Step 1: Send Code Form ---
    const sendCodeForm = useForm<SendCodeData>({
        resolver: zodResolver(sendCodeSchema),
        defaultValues: { identifier: "" },
    });

    const onSendCode = (data: SendCodeData) => {
        sendCode(
            { identifier: data.identifier },
            {
                onSuccess: (res) => {
                    setIdentifier(data.identifier);
                    setRequestId(res.id);
                    setResendTimer(59); // Start 59 second countdown
                    setStep(2);
                },
            }
        );
    };

    // --- Step 2: Verify Code Form ---
    const verifyCodeForm = useForm<VerifyCodeData>({
        resolver: zodResolver(verifyCodeSchema),
        defaultValues: { code: "" },
    });

    const onVerifyCode = (data: VerifyCodeData) => {
        verifyCode(
            { id: requestId, code: data.code },
            {
                onSuccess: (res) => {
                    if (res.verified) {
                        setVerifiedCode(data.code);
                        // Update requestId if verify returns a new ID (though usually implied it's same session, but API has id in response)
                        if (res.id) setRequestId(res.id);
                        setStep(3);
                    } else {
                        toast.error("فشل التحقق من الكود");
                    }
                },
            }
        );
    };

    const onResend = () => {
        if (!requestId || resendTimer > 0) return;
        resendCode(
            { id: requestId, otp: true },
            {
                onSuccess: () => {
                    setResendTimer(59);
                },
            }
        );
    };

    // --- Step 3: Reset Password Form ---
    const resetPasswordForm = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: "", password_confirmation: "" },
    });

    const onResetPassword = (data: ResetPasswordData) => {
        if (!verifiedCode || !requestId) {
            toast.error("جلسة غير صالحة. يرجى البدء من جديد.");
            setStep(1);
            return;
        }

        resetPassword(
            {
                id: requestId,
                code: verifiedCode,
                password: data.password,
                password_confirmation: data.password_confirmation,
            },
            {
                onSuccess: () => {
                    setIsSuccessModalOpen(true);
                },
            }
        );
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const renderStep1 = () => (
        <div className="w-full max-w-[480px] mx-auto bg-white rounded-md shadow-sm border border-[#F0F0F0] p-8 sm:p-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Title */}
            <div className="text-center mb-10">
                <h1 className="text-2xl sm:text-[28px] font-bold text-[#1C1C1C]">
                    نسيت كلمة السر؟
                </h1>
            </div>

            <Form {...sendCodeForm}>
                <form onSubmit={sendCodeForm.handleSubmit(onSendCode)} className="space-y-6">
                    <FormField
                        control={sendCodeForm.control}
                        name="identifier"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="block text-gray-2 text-sm font-normal">
                                    أدخل بريدك الإلكتروني أو الهاتف
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="example@Aatene.com"
                                        type="email"
                                        dir="ltr"
                                        className="h-[44px] text-base bg-white border border-[#E3E3E3] rounded-full focus:border-[#3D5E83] focus:ring-1 focus:ring-[#3D5E83] transition-colors text-[#555555] placeholder:text-[#AAAAAA] text-right"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full bg-[#3D5E83] hover:bg-[#2c4460] h-[50px] text-base font-medium rounded-full text-white shadow-none transition-colors"
                        disabled={isSending}
                    >
                        {isSending ? <Loader2 className="animate-spin" /> : "أرسل لي الكود"}
                    </Button>

                    <div className="text-center pt-2">
                        <span className="text-gary-2 text-sm">
                            هل تحتاج إلى حساب؟
                        </span>
                        <button
                            type="button"
                            className="px-1 cursor-pointer text-[#3D5E83] text-sm font-medium hover:underline"
                            onClick={() => router.push(`/${lang}/signup`)}
                        >
                             التسجيل
                        </button>
                    </div>
                </form>
            </Form>
        </div>
    );

    const renderStep2 = () => (
        <div className="w-full max-w-[480px] mx-auto bg-white rounded-md shadow-sm border border-[#F0F0F0] p-8 sm:p-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Title */}
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-[28px] font-bold text-[#1C1C1C] mb-2">
                    تحقق من البريد الإلكتروني
                </h1>
                <p className="text-[#717171] text-sm" dir="ltr">
                    {identifier}
                </p>
                <p className="text-[#717171] text-sm mt-1">
                    تم إرسال الرمز إلى
                </p>
                <p className="text-[#717171] text-sm">
                    أدخل الرمز للتحقق من حسابك.
                </p>
            </div>

            <Form {...verifyCodeForm}>
                <form onSubmit={verifyCodeForm.handleSubmit(onVerifyCode)} className="space-y-6">
                    <FormField
                        control={verifyCodeForm.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem className="space-y-4">
                                <FormControl>
                                    <OTPInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        length={4}
                                    />
                                </FormControl>
                                <FormMessage className="text-center" />
                            </FormItem>
                        )}
                    />

                    {/* Resend Timer */}
                    <div className="text-center">
                        {resendTimer > 0 ? (
                            <p className="text-[#3D5E83] text-sm font-medium">
                                إعادة إرسال رمز في {formatTime(resendTimer)}
                            </p>
                        ) : (
                            <button
                                type="button"
                                className="text-[#3D5E83] cursor-pointer text-sm font-medium hover:underline p-0"
                                onClick={onResend}
                                disabled={isResending}
                            >
                                {isResending ? "جاري الإرسال..." : "إعادة إرسال الرمز"}
                            </button>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#3D5E83] hover:bg-[#2c4460] h-[50px] text-base font-medium rounded-full text-white shadow-none transition-colors"
                        disabled={isVerifying}
                    >
                        {isVerifying ? <Loader2 className="animate-spin" /> : "استمرار"}
                    </Button>

                    <div className="text-center">
                        <button
                            type="button"
                            className="text-gray-2 cursor-pointer text-sm hover:text-[#1C1C1C] hover:underline p-0"
                            onClick={() => setStep(1)}
                        >
                            إعادة تقديم رمز لم يتلق رمز؟
                        </button>
                    </div>
                </form>
            </Form>
        </div>
    );

    const renderStep3 = () => (
        <div className="w-full max-w-[480px] mx-auto bg-white rounded-md shadow-sm border border-[#F0F0F0] p-8 sm:p-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Title */}
            <div className="text-center mb-10">
                <h1 className="text-2xl sm:text-[28px] font-bold text-[#1C1C1C]">
                    إنشاء كلمة مرور جديدة!
                </h1>
            </div>

            <Form {...resetPasswordForm}>
                <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-6">
                    <FormField
                        control={resetPasswordForm.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="block  text-[#555555] text-sm font-normal">
                                    أدخل كلمة المرور
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder="••••••••"
                                            type={showPassword ? "text" : "password"}
                                            className="h-[44px] text-base bg-white border border-[#E3E3E3] rounded-full focus:border-[#3D5E83] focus:ring-1 focus:ring-[#3D5E83] transition-colors text-[#555555] placeholder:text-[#AAAAAA] text-right pl-12"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-[#555555] transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={resetPasswordForm.control}
                        name="password_confirmation"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="block  text-[#555555] text-sm font-normal">
                                    تأكيد كلمة المرور
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder="••••••••"
                                            type={showConfirmPassword ? "text" : "password"}
                                            className="h-[44px] text-base bg-white border border-[#E3E3E3] rounded-full focus:border-[#3D5E83] focus:ring-1 focus:ring-[#3D5E83] transition-colors text-[#555555] placeholder:text-[#AAAAAA] text-right pl-12"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-[#555555] transition-colors"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full bg-[#3D5E83] hover:bg-[#2c4460] h-[52px] text-base font-medium rounded-full text-white shadow-none transition-colors"
                        disabled={isResetting}
                    >
                        {isResetting ? <Loader2 className="animate-spin" /> : "إنشاء كلمة المرور"}
                    </Button>
                </form>
            </Form>
        </div>
    );

    return (
        <>
            <main className="flex-1 flex items-center justify-center py-8 px-4 min-h-[400px]">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </main>

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => {
                    setIsSuccessModalOpen(false);
                    router.push(`/${lang}/login`);
                }}
                title="تم بنجاح"
                message="تم تحديث كلمة المرور بنجاح"
                buttonText="تسجيل الدخول"
                onButtonClick={() => {
                    setIsSuccessModalOpen(false);
                    router.push(`/${lang}/login`);
                }}
            />
        </>
    );
}
