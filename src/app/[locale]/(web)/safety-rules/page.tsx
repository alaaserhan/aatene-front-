"use client";

import { Shield, Store, ShoppingCart, Lock, UserX, Info, KeyRound } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/src/hooks/use-language";

const SELLER_TIPS = [
    "ضع شرحاً وافياً عن السلعة أو الخدمة",
    "تواصل مع المشتري عبر الدردشة أو الاتصال أو التعليقات",
    "اتفق مع المشتري على مكان عام للّقاء",
    "في حال بيعك سلعاً افتراضية (حسابات ألعاب فيديو)، يمكنك الاتفاق على موعد محدد للدفع الإلكتروني، ثم إرسال تفاصيل السلعة",
    "احرص أن يتفقّد المشتري السلعة أمامك قبل رحيله",
];

const BUYER_TIPS = [
    "اقرأ وصف السلعة بدقّة، واستفسر عبر الدردشة أو الاتصال الهاتفي، أو التعليقات",
    "قارن سعر السلعة مع أسعار السوق، واحذر العروض غير المنطقية",
    "في حال شرائك سلعاً افتراضية (حسابات ألعاب فيديو)، يمكنك الاتفاق على موعد محدد للدفع الإلكتروني، ثم إرسال تفاصيل السلعة. اتفق مع البائع على مكان عام للّقاء، وتفقّد السلعة",
    "مكان عام للّقاء، وتفقّد السلعة",
    "لا تشارك أي معلومات شخصية عنك",
    "اجمع معلومات أكبر عن البائع؛ في حال شراء سلعة وفّر صاحبها إمكانيّة تقسيطها، وزُر معرضه للتأكد",
];

const ACCOUNT_SAFETY_CARDS = [
    {
        icon: Info,
        text: "لا تشارك معلومات حسابك الشخصي مع أحد",
        bgIcon: "bg-[rgba(91,135,185,0.1)]",
    },
    {
        icon: Lock,
        text: "اختر كلمة سر صعبة التخمين، مكوّنة من 8 عناصر (حروف، أرقام، ورموز)، ولا تحفظ معلومات الدخول على متصفحك لأمان أعلى",
        bgIcon: "bg-[rgba(91,135,185,0.1)]",
    },
    {
        icon: Shield,
        text: "لا تشارك معلوماتك الشخصية (اسمك، مكان سكنك، حساباتك المصرفية، إيميلك الشخصي)",
        bgIcon: "bg-[rgba(91,135,185,0.1)]",
    },
    {
        icon: UserX,
        text: "كن حذراً عند التعامل مع أصحاب الحسابات الجديدة، وانظر إلى الحساب إن كان موثقاً برقم هاتفه، وتاريخ عضويته، ووقت التجاوب",
        bgIcon: "bg-[rgba(91,135,185,0.1)]",
    },
];

export default function SafetyRulesPage() {
    const lang = useLanguage();

    return (
        <div className="min-h-screen bg-[#f9f9f9]">
            {/* Hero Header */}
            <div className="py-10 text-center ">
                <h1 className="text-[28px]  font-medium mb-3">
                    قواعد السلامة
                </h1>
                <p className="text-[16px] md:text-[18px] text-gray-2 max-w-3xl mx-auto px-4">
                    نصائح وإرشادات لضمان البيع والشراء بأمان عبر منصتنا، تحميك وتساعدك على تجنب المشاكل المحتملة.
                </p>
            </div>

            <div className="container mx-auto px-4">
                {/* Seller Section */}
                <div className="bg-white rounded-lg my-8 p-6 md:p-10">
                    <div className="flex flex-col items-center gap-6 mb-6">
                        <div className="text-blue-4">
                            <Store className="w-12 h-12" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-[22px]  font-medium  text-center">
                            التاجر
                        </h2>
                    </div>
                    <ul className="space-y-4 max-w-3xl mx-auto text-center">
                        {SELLER_TIPS.map((tip, index) => (
                            <li key={index} className="text-[16px] md:text-[18px]  leading-relaxed list-disc list-inside">
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Buyer Section */}
                <div className="bg-white rounded-lg mb-8 p-6 md:p-10">
                    <div className="flex flex-col items-center gap-6 mb-6">
                        <div className="text-blue-4">
                            <ShoppingCart className="w-12 h-12" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-[22px]  font-medium  text-center">
                            المشتري
                        </h2>
                    </div>
                    <ul className="space-y-4 max-w-3xl mx-auto text-center">
                        {BUYER_TIPS.map((tip, index) => (
                            <li key={index} className="text-[16px] md:text-[18px]  leading-relaxed list-disc list-inside">
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Account Safety Section */}
                <div className="mb-8">
                    <div className="text-center mb-8">
                        <h2 className="text-[26px]  font-medium mb-3">
                            طرق المحافظة على أمان حسابك
                        </h2>
                        <p className="text-[16px] md:text-[18px] text-gray-2">
                            نصائح وإرشادات لضمان تجربة بيع وشراء آمنة
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {ACCOUNT_SAFETY_CARDS.map((card, index) => {
                            const IconComponent = card.icon;
                            return (
                                <div key={index} className="bg-white rounded-lg p-5 flex flex-col items-center justify-center text-center min-h-[220px]">
                                    <div className={`${card.bgIcon} rounded-[20px] p-4 mb-4 flex items-center justify-center`}>
                                        <IconComponent className="w-7 h-7 text-blue-4" strokeWidth={1.5} />
                                    </div>
                                    <p className="text-[14px] md:text-[15px] leading-relaxed">
                                        {card.text}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Take Action Section */}
                <div className="mb-12 text-right">
                    <h2 className="text-[22px]  font-medium  mb-4">
                        اتخذ إجراءً إن شككت بمصداقية إعلان أو حساب
                    </h2>
                    <p className="text-[16px] md:text-[18px] text-gray-2 leading-relaxed mb-6">
                        البيع والشراء عبر أعطيني محاكاة لتجربة البيع والشراء التقليدية، أي أن عليك أن تقارن الأسعار، وتجمع المعلومات، وتتواصل مع الطرف الآخر وتطرح أسئلتك بكل شفافية، للتأكد من وصولك إلى هدفك من التصفح
                    </p>
                    <div className="flex">
                        <Link
                            href={`/${lang}/contact`}
                            className="bg-blue-4 text-white px-20 py-2.5 mt-2 rounded-md  font-medium hover:bg-[#2e4a6a] transition-colors inline-block"
                        >
                            اتصل بنا
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
