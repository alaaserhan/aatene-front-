"use client";

import { Store, ShoppingCart, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/src/hooks/use-language";
import { useGetSafetyRules } from "@/src/features/(web)/pages/hooks";

export default function SafetyRulesPage() {
    const lang = useLanguage();
    const { data: response, isLoading, isError } = useGetSafetyRules();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-4" />
            </div>
        );
    }

    if (isError || !response?.safetyRules) {
        return (
            <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center text-red-500">
                حدث خطأ أثناء تحميل البيانات.
            </div>
        );
    }

    const { safetyRules } = response;

    return (
        <div className="bg-[#f9fafb] pb-12"> 
            <div className="container mx-auto ">
                {/* Hero Header */}
                <div className="py-12 text-center">
                    <h1 className="text-[24px] md:text-[32px] font-medium  mb-4">
                        {safetyRules.title || "قواعد السلامة"}
                    </h1>
                    <p className="text-[15px] md:text-[17px] text-gray-2 max-w-3xl mx-auto px-4 whitespace-pre-line">
                        {safetyRules.content || "نصائح وإرشادات لضمان البيع والشراء بأمان عبر منصتنا، تحميك وتساعدك على تجنب المشاكل المحتملة."}
                    </p>
                </div>

                <div className="">
                    {/* Seller Section */}
                    <div className="bg-white rounded-xl mb-8 p-8 md:p-12 ">
                        <div className="flex flex-col items-center gap-2 mb-8">
                            {safetyRules.merchants?.[0]?.image_url ? (
                                <Image src={safetyRules.merchants[0].image_url} alt="التاجر" width={60} height={60} className="object-contain" />
                            ) : (
                                <div className="text-blue-3">
                                    <Store className="w-12 h-12" strokeWidth={1.5} />
                                </div>
                            )}
                            <h2 className="text-[20px] md:text-[22px] font-medium">
                                التاجر
                            </h2>
                        </div>
                        <div className="flex flex-col items-center gap-5">
                            {safetyRules.merchants?.map((merchant, index) => (
                                <div key={index} className="flex items-center gap-3 max-w-2xl text-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-black-1 shrink-0" />
                                    <span className="text-[14px] md:text-[16px] font-medium leading-relaxed ">{merchant.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Buyer Section */}
                    <div className="bg-white rounded-xl mb-12 p-8 md:p-12 ">
                        <div className="flex flex-col items-center gap-2 mb-8">
                            {safetyRules.customers?.[0]?.image_url ? (
                                <Image src={safetyRules.customers[0].image_url} alt="المشتري" width={60} height={60} className="object-contain" />
                            ) : (
                                <div className="text-blue-3">
                                    <ShoppingCart className="w-12 h-12" strokeWidth={1.5} />
                                </div>
                            )}
                            <h2 className="text-[20px] md:text-[22px] font-medium">
                                المشتري
                            </h2>
                        </div>
                        <div className="flex flex-col items-center gap-5">
                            {safetyRules.customers?.map((customer, index) => (
                                <div key={index} className="flex gap-3 max-w-2xl text-center">
                                    <span className="w-1.5 h-1.5 mt-2 rounded-full bg-black-1 shrink-0" />
                                    <span className="text-[14px] md:text-[16px] font-medium leading-relaxed ">{customer.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Account Safety Section */}
                    <div className="mb-16">
                        <div className="text-center mb-10 space-y-3">
                            <h2 className="text-[24px] md:text-[28px] font-medium ">
                                {safetyRules.keep_account_save?.title}
                            </h2>
                            <p className="text-[15px] md:text-[17px] text-gray-2 whitespace-pre-line">
                                {safetyRules.keep_account_save?.content}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {safetyRules.keep_account_save?.sections?.map((card, index) => {
                                return (
                                    <div key={index} className="bg-white rounded-xl p-4 flex flex-col items-center text-center h-full min-h-[220px]">
                                        <div className="bg-blue-5 rounded-md w-14 h-14 mb-4 flex items-center justify-center">
                                            {card.image_url ? (
                                                <Image src={card.image_url} alt={card.title || "icon"} width={30} height={30} className="object-contain" />
                                            ) : (
                                                <Shield className="w-6 h-6 text-blue-3" strokeWidth={1.5} />
                                            )}
                                        </div>
                                        <div className="text-[14px] md:text-[15px] leading-[1.8] ">
                                            {card.title && <span className="block font-semibold mb-1">{card.title}</span>}
                                            {card.content && <span>{card.content}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Take Action Section */}
                    <div className="">
                        <h2 className="text-[20px] md:text-[22px] font-medium  mb-4 text-start">
                            اتخذ إجراءً إن شككت بمصداقية إعلان أو حساب
                        </h2>
                        <p className="text-[14px] md:text-[16px] text-gray-2 leading-[1.8] mb-6 whitespace-pre-line text-start">
                            البيع والشراء عبر أعطيني محاكاة لتجربة البيع والشراء التقليدية، أي أن عليك أن تقارن الأسعار، وتجمع المعلومات، وتتواصل مع الطرف الآخر وتطرح أسئلتك بكل شفافية، للتأكد من وصولك إلى هدفك من التصفح
                        </p>
                        <div className="flex">
                            <Link
                                href={`/${lang}/contact-us`}
                                className="bg-blue-4 text-white px-10 sm:max-w-[250px] w-full py-3 text-sm text-center rounded-md font-medium hover:bg-blue-4 transition-colors inline-block"
                            >
                                اتصل بنا
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
