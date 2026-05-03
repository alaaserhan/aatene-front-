"use client";

import { Mail, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/src/lib/axios";
import { toast } from "sonner";

const NewsletterFooter = () => {
    const pathname = usePathname();
    const isAuthPage =
        pathname?.includes("/login") ||
        pathname?.includes("/signup") ||
        pathname?.includes("/forgot-password");
    const [email, setEmail] = useState("");

    const { mutate: subscribe, isPending } = useMutation({
        mutationFn: async (emailValue: string) => {
            const formData = new FormData();
            formData.append("email", emailValue);
            const { data } = await api.post("/newsletters", formData);
            return data;
        },
        onSuccess: (data) => {
            toast.success(data?.message || "تم الاشتراك بنجاح");
            setEmail("");
        },
    });

    const handleSubscribe = () => {
        if (!email.trim()) {
            toast.error("يرجى كتابة بريدك الإلكتروني");
            return;
        }
        subscribe(email);
    };

    if (isAuthPage) return null;

    return (
        <section
            className="w-full bg-[#E9EFF5] py-12 md:py-16"
            dir="rtl"
            aria-labelledby="newsletter-heading"
        >
            <div className="container mx-auto flex flex-col items-center px-4 text-center">
                <div className="mb-8 flex w-full justify-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <p
                        id="newsletter-heading"
                        className="inline-block min-w-max whitespace-nowrap text-sm leading-relaxed text-[#2D4362] md:text-base"
                    >
                        اكتشف خدمات ومنتجات مميزة من أفضل البائعين في مكان واحد، وسجّل بريدك الإلكتروني لتحصل على عروض حصرية وترشيحات تناسبك
                    </p>
                </div>

                <form
                    className="flex w-full max-w-xl flex-col items-stretch gap-0"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubscribe();
                    }}
                >
                    <label htmlFor="newsletter-email" className="sr-only">
                        البريد الإلكتروني للاشتراك في النشرة
                    </label>
                    <div className="flex w-full overflow-hidden rounded-full shadow-[0_8px_28px_-10px_rgba(45,67,98,0.18)] ring-1 ring-[#cfd9e6]">
                        <div className="flex min-w-0 flex-1 items-center gap-3 bg-white py-2 ps-4 pe-3 sm:ps-5 sm:pe-4">
                            <Mail
                                className="h-5 w-5 shrink-0 text-gray-400"
                                aria-hidden
                            />
                            <input
                                id="newsletter-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="اكتب بريدك الالكتروني"
                                className="min-h-[44px] w-full min-w-0 flex-1 bg-transparent py-2 text-right text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none md:text-[15px]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="shrink-0 bg-[#2D4362] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#24354f] disabled:opacity-60 sm:px-8 sm:text-base"
                        >
                            {isPending ? (
                                <span className="inline-flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                                    جاري الاشتراك...
                                </span>
                            ) : (
                                "اشترك الآن"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default NewsletterFooter;
