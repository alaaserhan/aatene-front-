"use client";

import { Mail } from "lucide-react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NewsletterFooter = () => {
    const pathname = usePathname();
    const isAuthPage = pathname?.includes("/login") || pathname?.includes("/signup") || pathname?.includes("/forgot-password");

    if (isAuthPage) return null;

    return (
        <div className="px-2 my-8">
            <MaxWidthWrapper className="bg-linear-to-l overflow-hidden relative from-[#0A5DC2] to-[#052C5C] text-white p-6 md:p-10 rounded-2xl max-w-6xl mx-auto text-center md:text-right ">
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
                        <div className="relative flex items-center gap-1 w-full justify-center md:justify-end">
                            <input
                                type="email"
                                placeholder="اكتب بريدك الالكتروني"
                                className="rounded-full bg-white placeholder:text-right px-4 py-3 text-black text-sm pr-10 focus:outline-none w-full"
                            />
                            <Mail className="absolute right-4 text-gray-600 w-5 h-5" />
                        </div>
                        <div className="bg-white w-full rounded-full px-4 py-2 text-center shadow-md">
                            <button className="bg-linear-to-r from-blue-500 to-cyan-500 text-transparent bg-clip-text font-bold text-lg hover:opacity-80 transition cursor-pointer">
                                اشترك الآن
                            </button>
                        </div>
                    </div>
                </div>
            </MaxWidthWrapper>
        </div>
    );
};

export default NewsletterFooter;
