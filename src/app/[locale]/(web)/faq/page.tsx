"use client";

import { useState } from "react";
import { Plus, ChevronUp, Search, Play } from "lucide-react";

const CATEGORIES = [
    { id: "services", label: "الخدمات" },
    { id: "products", label: "المنتجات" },
    { id: "used-products", label: "المنتجات المستعملة" },
];

interface FaqItem {
    question: string;
    answer: string;
    hasVideo?: boolean;
}

const FAQ_DATA: Record<string, FaqItem[]> = {
    services: [
        {
            question: "كيف أقدر أضيف خدمتي على المنصة؟",
            answer: "تقدر تضيف خدمتك بسهولة من خلال إنشاء حساب مجاني، ثم الدخول إلى لوحة التحكم الخاصة بك، والضغط على \"إضافة خدمة\". بعدها بتعبّي البيانات المطلوبة مثل اسم الخدمة، وصفها، السعر، وأي صور أو تفاصيل مهمة، وبكبسة زر بتكون خدمتك جاهزة للعرض.",
        },
        {
            question: "هل تسجيل الخدمة مجاني أم هناك رسوم؟",
            answer: "تسجيل الخدمة مجاني بالكامل. كل ما عليك هو إنشاء حساب على المنصة، ثم إضافة تفاصيل خدمتك مثل الاسم والوصف والسعر والصور. لن تُفرض أي رسوم على إدراج أو عرض خدمتك. يمكنك مراجعة الفيديو للتوضيح.",
            hasVideo: true,
        },
        {
            question: "هل أستطيع تعديل أو حذف الخدمة بعد نشرها؟",
            answer: "نعم، يمكنك تعديل أو حذف خدمتك في أي وقت من خلال لوحة التحكم الخاصة بك. فقط اضغط على الخدمة التي تريد تعديلها واختر \"تعديل\" أو \"حذف\".",
        },
        {
            question: "كيف يتم التواصل مع العملاء المهتمين بخدمتي؟",
            answer: "يتم التواصل مع العملاء من خلال نظام الدردشة الداخلي في المنصة، أو عبر رقم الهاتف المسجل في حسابك. كما يمكن للعملاء ترك تعليقات واستفسارات على صفحة خدمتك.",
        },
        {
            question: "هل يوجد عمولة على المبيعات أو الحجز؟",
            answer: "لا، لا توجد أي عمولة على المبيعات أو الحجز. المنصة مجانية بالكامل ولا تأخذ أي نسبة من أرباحك.",
        },
        {
            question: "كم يستغرق الوقت حتى يتم عرض خدمتي للناس؟",
            answer: "عادةً، يتم عرض خدمتك مباشرة بعد إتمام إدخال جميع البيانات المطلوبة وحفظها، ما لم تكن هناك حاجة لمراجعة إضافية للتأكد من مطابقة المحتوى لسياسات المنصة. في حال المراجعة اليدوية، قد يستغرق الأمر من 24 إلى 48 ساعة عمل. (مرفق صورة للتوضيح)",
            hasVideo: true,
        },
        {
            question: "هل أستطيع إضافة أكثر من خدمة في حسابي؟",
            answer: "بالطبع! يمكنك إضافة عدد غير محدود من الخدمات في حسابك. كل خدمة سيكون لها صفحة خاصة بها يمكن للعملاء تصفحها.",
        },
    ],
    products: [
        {
            question: "كيف أضيف منتجي على المنصة؟",
            answer: "يمكنك إضافة منتجك من خلال إنشاء حساب مجاني والدخول إلى لوحة التحكم. اضغط على \"إضافة منتج\" واملأ جميع التفاصيل المطلوبة مثل الاسم والوصف والسعر والصور.",
        },
        {
            question: "هل يمكنني تعديل سعر المنتج بعد نشره؟",
            answer: "نعم، يمكنك تعديل سعر المنتج أو أي تفاصيل أخرى في أي وقت من خلال لوحة التحكم الخاصة بك.",
        },
        {
            question: "كيف يتم الدفع عند شراء المنتجات؟",
            answer: "يتم الاتفاق على طريقة الدفع بين البائع والمشتري مباشرة. المنصة تسهل عملية التواصل بينكما.",
        },
        {
            question: "هل يوجد حد أقصى لعدد المنتجات التي يمكنني إضافتها؟",
            answer: "لا، يمكنك إضافة عدد غير محدود من المنتجات في حسابك.",
        },
    ],
    "used-products": [
        {
            question: "كيف أبيع منتجاتي المستعملة على المنصة؟",
            answer: "يمكنك بيع منتجاتك المستعملة بنفس طريقة إضافة المنتجات الجديدة. أنشئ حساباً مجانياً، ثم أضف منتجك مع وصف دقيق لحالته وصور واضحة.",
        },
        {
            question: "هل يجب ذكر حالة المنتج المستعمل؟",
            answer: "نعم، من المهم جداً ذكر حالة المنتج بدقة ووضوح لضمان تجربة شراء موثوقة للمشتري. أضف صوراً واضحة توضح الحالة الفعلية للمنتج.",
        },
        {
            question: "هل يمكن إرجاع المنتجات المستعملة؟",
            answer: "سياسة الإرجاع تعتمد على الاتفاق بين البائع والمشتري. ننصح بالاتفاق على شروط واضحة قبل إتمام عملية الشراء.",
        },
        {
            question: "كيف أحدد سعر المنتج المستعمل؟",
            answer: "ننصحك بالبحث عن أسعار منتجات مشابهة في السوق ومراعاة حالة المنتج وعمره. حاول تحديد سعر عادل يعكس القيمة الحقيقية للمنتج.",
        },
    ],
};

export default function FaqPage() {
    const [activeCategory, setActiveCategory] = useState("services");
    const [openItems, setOpenItems] = useState<Set<number>>(new Set([0, 1]));
    const [searchQuery, setSearchQuery] = useState("");

    const toggleItem = (index: number) => {
        setOpenItems((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const currentFaqs = FAQ_DATA[activeCategory] || [];

    const filteredFaqs = searchQuery.trim()
        ? currentFaqs.filter(
            (faq) =>
                faq.question.includes(searchQuery) ||
                faq.answer.includes(searchQuery)
        )
        : currentFaqs;

    return (
        <div className="min-h-screen bg-white">
            <div className="py-10 md:py-14 text-center">
                <h1 className="text-2xl md:text-3xl font-bold mb-3">الأسئلة الشائعة</h1>
                <p className="text-sm md:text-base text-gray-2 max-w-2xl mx-auto px-4">
                    إجابات وافية على أكثر الأسئلة شيوعًا لضمان تجربة سلسة وواضحة.
                </p>
            </div>

            <div className="bg-white-1 pb-16">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center gap-3 -translate-y-1/2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setOpenItems(new Set([0, 1]));
                                    setSearchQuery("");
                                }}
                                className={`px-6 md:px-10 py-4 md:py-5 rounded-lg text-sm md:text-base font-medium transition-colors ${activeCategory === cat.id
                                        ? "bg-blue-3 text-white shadow-md"
                                        : "bg-white border border-gray-4 text-black-1 hover:border-blue-4"
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-4 flex items-center gap-3 px-4 py-3 mb-10">
                        <button className="bg-blue-3 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0">
                            ابحث
                        </button>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث من خلال أي كلمة مفتاحية"
                            className="flex-1 bg-transparent outline-none text-right text-sm text-gray-2"
                        />
                        <Search className="w-5 h-5 text-gray-1 shrink-0" />
                    </div>

                    <div className="space-y-4">
                        {filteredFaqs.map((faq, index) => {
                            const isOpen = openItems.has(index);
                            return (
                                <div
                                    key={`${activeCategory}-${index}`}
                                    className="bg-white rounded-xl border border-gray-4 overflow-hidden transition-all"
                                >
                                    <button
                                        onClick={() => toggleItem(index)}
                                        className="w-full flex items-center justify-between px-6 md:px-10 py-6 md:py-8 text-right"
                                    >
                                        <div className="border border-gray-4 rounded-full w-10 h-10 flex items-center justify-center shrink-0 transition-transform">
                                            {isOpen ? (
                                                <ChevronUp className="w-5 h-5 text-gray-1" />
                                            ) : (
                                                <Plus className="w-5 h-5 text-gray-1" />
                                            )}
                                        </div>
                                        <h3 className="text-base md:text-lg font-bold flex-1 pe-4">
                                            {faq.question}
                                        </h3>
                                    </button>

                                    {isOpen && (
                                        <div className="px-6 md:px-10 pb-6 md:pb-8">
                                            <p className="text-sm text-gray-2 leading-relaxed mb-4 text-right">
                                                {faq.answer}
                                            </p>
                                            {faq.hasVideo && (
                                                <div className="bg-blue-5 rounded-xl w-full aspect-video flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                                                    <div className="bg-blue-3 rounded-full w-12 h-12 flex items-center justify-center">
                                                        <Play className="w-5 h-5 text-white fill-white ms-0.5" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {filteredFaqs.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-2 text-base">لا توجد نتائج مطابقة لبحثك.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
