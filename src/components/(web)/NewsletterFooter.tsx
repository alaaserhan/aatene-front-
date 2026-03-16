"use client";

import { Mail, Loader2 } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/src/lib/axios";
import { toast } from "sonner";

const NewsletterFooter = () => {
    const pathname = usePathname();
    const isAuthPage = pathname?.includes("/login") || pathname?.includes("/signup") || pathname?.includes("/forgot-password");
    const [email, setEmail] = useState("");

    const { mutate: subscribe, isPending } = useMutation({
        mutationFn: async (emailValue: string) => {
            const formData = new FormData();
            formData.append("email", emailValue);
            const { data } = await api.post('/newsletters', formData);
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
        <div className="my-8 container">
            <div className="bg-linear-to-l overflow-hidden relative from-[#0A5DC2] to-[#052C5C] text-white p-6 md:p-12 rounded-2xl  text-center md:text-right ">
                <div className="lg:block hidden absolute w-96 right-0 bottom-0 lg:top-0 h-full">
                    <Image
                        src="/NewsletterFooterImage.png"
                        alt="Newsletter"
                        fill
                        className="object-contain"
                    />
                </div>
                <div className="flex flex-col md:flex-row md:justify-between items-center gap-6 md:gap-4 relative z-10">
                    <div className="text-2xl md:text-[40px] lg:mr-72 font-bold mt-4 md:mt-0 leading-tight">
                        ابق على اطلاع <br className="hidden md:block" /> بأحدث عروضنا
                    </div>
                    <div className="flex flex-col items-stretch md:items-start gap-2 w-full md:w-[35%]">
                        <div className="relative flex items-center w-full justify-center md:justify-end">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="اكتب بريدك الالكتروني"
                                className="rounded-full bg-white placeholder:text-gray-400 px-4 py-3 text-black text-sm pr-10 focus:outline-none w-full border border-transparent focus:border-blue-3 transition-colors"
                            />
                            <Mail className="absolute right-3.5 text-gray-400 w-5 h-5" />
                        </div>
                        <div className="bg-white w-full rounded-full px-4 py-2 text-center shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                            <button
                                onClick={handleSubscribe}
                                disabled={isPending}
                                className="bg-linear-to-r from-blue-500 to-cyan-500 text-transparent bg-clip-text font-semibold pt-0.5 transition disabled:opacity-50 w-full flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isPending && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                                {isPending ? "جاري الاشتراك..." : "اشترك الآن"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsletterFooter;
