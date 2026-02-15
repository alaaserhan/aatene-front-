"use client";

import { Search, FileText } from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";

const TERMS_CONTENT = [
    {
        id: 1,
        title: "قبول الشروط",
        content: `بمجرد استخدامك لمنصة أعطيني، فإنك تقر بأنك قرأت هذه الشروط وفهمتها وتوافق على الالتزام بها.
في حال عدم موافقتك على أي جزء منها، يجب عليك التوقف فورًا عن استخدام المنصة.
تحتفظ المنصة بحقها في تعديل أو تحديث هذه الشروط في أي وقت، وسيتم إخطار المستخدمين بالتعديلات الجوهرية عبر البريد الإلكتروني أو إشعار داخل المنصة.`
    },
    {
        id: 2,
        title: "إنشاء الحساب والمسؤولية",
        content: `لإنشاء حساب في أعطيني، يجب عليك إدخال بيانات صحيحة ودقيقة.
أنت مسؤول مسؤولية كاملة عن جميع الأنشطة التي تتم عبر حسابك، بما في ذلك الحفاظ على سرية اسم المستخدم وكلمة المرور.
في حال اكتشاف أي استخدام غير مصرح به لحسابك، يجب إبلاغ فريق الدعم فورًا.
يُمنع تمامًا:
• إنشاء حسابات مزيفة أو وهمية.
• مشاركة حسابك مع أطراف أخرى.
• استخدام المنصة لأغراض مخالفة للقانون أو تسبب ضررًا للآخرين.`
    },
    {
        id: 3,
        title: "استخدام المنصة",
        content: `تتيح لك منصة أعطيني الوصول إلى مجموعة من الخدمات والمحتوى الذي نقدمه بغرض تسهيل عمليات البيع، الشراء، والعرض بطريقة آمنة وفعّالة.
يجب استخدام المنصة فقط للأغراض المشروعة وعدم استغلالها في أنشطة تضر بالمستخدمين أو بسمعة المنصة.
يحظر استخدام أي وسائل آلية (مثل الروبوتات) لجمع البيانات أو الوصول إلى المنصة دون إذن مسبق.`
    },
    {
        id: 4,
        title: "حقوق الملكية الفكرية",
        content: `جميع المحتويات المعروضة على المنصة، بما في ذلك النصوص، التصاميم، الشعارات، والعلامات التجارية، هي ملك لمنصة أعطيني أو الجهات المرخصة لها.
لا يجوز نسخ، توزيع، أو تعديل أي جزء من المحتوى دون الحصول على إذن كتابي مسبق.`
    },
    {
        id: 5,
        title: "التعاملات المالية",
        content: `المنصة توفر بيئة آمنة للتعاملات المالية بين البائع والمشتري.
يجب الالتزام بسياسات الدفع والاسترداد الموضحة في قسم المدفوعات.
المنصة غير مسؤولة عن أي تعاملات مالية تتم خارج نظامها الرسمي.`
    },
    {
        id: 6,
        title: "تقييمات المستخدمين والمحتوى",
        content: `يحق للمستخدمين تقييم الخدمات والمنتجات بكل مصداقية وموضوعية.
يمنع نشر تعليقات مسيئة، مضللة، أو تحتوي على خطاب كراهية.
تحتفظ المنصة بالحق في حذف أي محتوى يخالف هذه الشروط دون إشعار مسبق.`
    },
    {
        id: 7,
        title: "الإنهاء أو التعليق",
        content: `تحتفظ المنصة بالحق في تعليق أو إنهاء حساب أي مستخدم ينتهك شروط الاستخدام أو يسيء استخدام المنصة.
يمكن للمستخدم طلب حذف حسابه في أي وقت من خلال إعدادات الحساب.`
    },
    {
        id: 8,
        title: "إخلاء المسؤولية",
        content: `تبذل المنصة قصارى جهدها لضمان عمل الخدمات بسلاسة، لكنها لا تضمن خلوها من الأخطاء أو الانقطاعات.
المنصة غير مسؤولة عن أي أضرار مباشرة أو غير مباشرة قد تنجم عن استخدامك للخدمات.`
    },
    {
        id: 9,
        title: "التحديثات والتعديلات",
        content: `قد يتم تحديث المنصة بشكل دوري لإضافة ميزات جديدة أو تحسين الأداء.
سيتم نشر أي تغييرات على شروط الاستخدام في هذه الصفحة، ويُعتبر استمرارك في استخدام المنصة موافقة ضمنية عليها.`
    },
    {
        id: 10,
        title: "القوانين المعمول بها",
        content: `تخضع هذه الشروط وتفسر وفقًا للقوانين المعمول بها في الدولة التي تعمل بها المنصة.
في حال وجود أي نزاع، يتم اللجوء إلى المحاكم المختصة في تلك الدولة.`
    },
    {
        id: 11,
        title: "تواصل معنا",
        content: `إذا كان لديك أي استفسارات أو ملاحظات بخصوص شروط الاستخدام، يمكنك التواصل مع فريق الدعم الفني عبر القنوات المتاحة في صفحة "تواصل معنا".`
    }
];

export default function TermsPage() {
    const [activeId, setActiveId] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const scrollToSection = (id: number) => {
        setActiveId(id);
        const element = document.getElementById(`section-${id}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const filteredContent = TERMS_CONTENT.filter(item =>
        item.title.includes(searchQuery) || item.content.includes(searchQuery)
    );

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="gradient-blue w-full relative shadow-sm">
                <div className="container mx-auto flex items-center justify-between h-[80px]">
                    <div className="flex items-center gap-3 text-white">
                        <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center bg-white/10">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-medium tracking-wide">
                            شروط الإستخدام
                        </h1>
                    </div>

                    <div className="hidden md:flex flex-1 max-w-xl relative">
                        <input
                            type="text"
                            placeholder="ابحث عن أي كلمة ...."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pr-10 pl-4 rounded-md bg-white  text-gray-800 placeholder:text-gray-400 focus:outline-none text-sm border-none transition-colors "
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="md:hidden gradient-blue px-4 pb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="ابحث عن أي كلمة ...."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pr-10 pl-4 rounded bg-white/90 focus:bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none text-sm border-none transition-colors "
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            <div className="container mx-auto my-4 md:my-8 flex-1">
                <div className="flex flex-col lg:flex-row items-start">

                    {/* Sidebar Navigation (Right in RTL) */}
                    <div className="w-full lg:w-[280px] shrink-0 sticky top-4 ">
                        <div className="flex flex-col">
                            {TERMS_CONTENT.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={cn(
                                        "w-full flex items-center gap-2 py-[10px] px-[10px]  transition-all border-b border-[#e6e6e6]",
                                        activeId === item.id
                                            ? "text-blue-3"
                                            : ""
                                    )}
                                >
                                    <span className="bg-blue-4 rounded-full size-[22px] flex items-center justify-center text-white text-[12px] font-normal shrink-0">
                                        {item.id}
                                    </span>
                                    <span className={cn(
                                        "text-[15px] leading-[1.7]",
                                        activeId === item.id
                                            ? "font-medium"
                                            : "font-normal"
                                    )}>
                                        {item.title}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Vertical Divider */}
                    <div className="hidden lg:block w-[2px] max-h-[600px] mx-8 bg-blue-4 self-stretch" />
                    {/* Main Content (Left in RTL) */}
                    <div className="flex-1 w-full">
                        <div className="flex flex-col gap-4">
                            {filteredContent.length > 0 ? (
                                filteredContent.map((item) => (
                                    <div key={item.id} id={`section-${item.id}`} className="scroll-mt-28">
                                        <h2 className="text-[17px] text-blue-4 mb-2  font-medium">
                                            {item.id}. {item.title}
                                        </h2>
                                        <div className="text-[15px] leading-[2] whitespace-pre-line ">
                                            {item.content}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-2">
                                    لا توجد نتائج بحث مطابقة.
                                </div>
                            )}
                        </div>
                    </div>




                </div>
            </div>
        </div>
    );
}
