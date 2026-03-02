"use client";

import { ChevronLeft, Mail, MessageSquareText } from "lucide-react";
import Image from "next/image";

export default function ContactUsPage() {
    return (
        <div className="py-8 md:py-16 flex items-center relative overflow-hidden">
            {/* Very light blue gradient blob on the left side */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-blue-1/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <div className="container mx-auto px-4 py-12 md:py-24">
                <div className="flex flex-col md:flex-row items-center justify-between ">

                    {/* Right Content (Text) */}
                    <div className="flex-1 space-y-10  max-w-2xl">
                        <div className="space-y-4">
                            <h1 className="text-2xl md:text-3xl font-medium ">
                                تواصل معنا
                            </h1>
                            <p className="text-gray-2 text-[15px] md:text-[16px] leading-relaxed">
                                إذا كان لديك استفسار، اقتراح، أو مشكلة تواجهك أثناء استخدام المنصة، لا تتردد في مراسلتنا.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {/* Live Chat */}
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-blue-3">
                                    <MessageSquareText className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-sm font-medium ">
                                        الدردشة الفورية (Live Chat)
                                    </h3>
                                    <p className="text-gray-2 text-sm leading-relaxed max-w-md">
                                        تواصل مع المساعد الذكي عبر الشات الفوري للحصول على الدعم وحل مشكلتك في أسرع وقت
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-blue-3">
                                    <Mail className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-sm font-medium ">
                                        البريد الإلكتروني (Aatene@gmail.com)
                                    </h3>
                                    <p className="text-gray-2 text-sm leading-relaxed max-w-md">
                                        أرسل استفسارك أو مشكلتك على البريد الإلكتروني، وسنرد عليك خلال ساعات العمل الرسمية.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 ">
                            <button className="bg-blue-4 text-white rounded-full px-4 py-2.5  text-sm font-medium flex items-center gap-3 transition-colors">
                                تواصل معنا
                                <ChevronLeft className="w-5 h-5 pr-1" />
                            </button>
                        </div>
                    </div>

                    {/* Left Content (Image) */}
                    <div className="flex-1 hidden md:flex w-full  justify-center ">
                        <Image
                            src="/contactUs.svg"
                            alt="Contact Us"
                            width={800}
                            height={800}
                            className="w-full max-w-[800px] object-contain"
                            priority
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}
