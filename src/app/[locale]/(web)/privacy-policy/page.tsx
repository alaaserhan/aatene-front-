"use client";

import { Search, Lock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";

const PRIVACY_CONTENT = [
    {
        id: 1,
        title: "المقدمة",
        content: `نحن في منصة أعطيني نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه الصفحة كيف نقوم بجمع معلوماتك واستخدامها وحمايتها أثناء استخدامك منصتنا.`
    },
    {
        id: 2,
        title: "المعلومات التي نجمعها",
        content: `قد نقوم بجمع بعض المعلومات عند استخدامك للمنصة، مثل:
• البيانات الشخصية (الاسم، البريد الإلكتروني، رقم الهاتف).
• بيانات الاستخدام (صفحات تزورها، الوقت الذي تقضيه على المنصة).
• معلومات الدفع إن وجدت (يتم حفظها بطريقة آمنة ومشفّرة).`
    },
    {
        id: 3,
        title: "كيفية استخدام المعلومات",
        content: `نستخدم بياناتك من أجل:
• تحسين تجربة الاستخدام.
• التواصل معك بخصوص الطلبات أو الدعم الفني.
• إرسال إشعارات أو عروض خاصة (بموافقتك).
• تحسين جودة الخدمات وتطويرها.`
    },
    {
        id: 4,
        title: "مشاركة البيانات",
        content: `نحن لا نشارك بياناتك الشخصية مع أي جهة خارجية إلا في الحالات التالية:
• عند وجود التزام قانوني.
• مع شركاء موثوقين يساعدوننا في تشغيل المنصة أو تقديم الخدمة، بشرط الحفاظ على سريتها.`
    },
    {
        id: 5,
        title: "حماية المعلومات",
        content: `نستخدم أحدث أساليب الحماية التقنية والإدارية للحفاظ على بياناتك ومنع الوصول غير المصرح به إليها.`
    },
    {
        id: 6,
        title: "ملفات تعريف الارتباط (Cookies)",
        content: `نستخدم ملفات تعريف الارتباط لتحسين أداء المنصة وتخصيص تجربتك. يمكنك تعديل إعدادات المتصفح لرفض ملفات تعريف الارتباط إذا كنت تفضل ذلك.`
    },
    {
        id: 7,
        title: "حقوق المستخدم",
        content: `لك الحق في:
• الوصول إلى بياناتك الشخصية وتعديلها.
• طلب حذف حسابك وبياناتك من المنصة.
• إلغاء الاشتراك في الرسائل التسويقية.`
    },
    {
        id: 8,
        title: "التواصل معنا",
        content: `إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر القنوات الرسمية المتاحة في صفحة "تواصل معنا".`
    }
];

export default function PrivacyPage() {
    const [activeId, setActiveId] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const scrollToSection = (id: number) => {
        setActiveId(id);
        const element = document.getElementById(`section-${id}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const filteredContent = PRIVACY_CONTENT.filter(item =>
        item.title.includes(searchQuery) || item.content.includes(searchQuery)
    );

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="gradient-blue w-full relative shadow-sm">
                <div className="container mx-auto flex items-center justify-between h-[80px]">
                    <div className="flex items-center gap-3 text-white">
                        <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center bg-white/10">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-medium tracking-wide">
                            سياسة الخصوصية
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

                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-[280px] shrink-0 sticky top-4 ">
                        <div className="flex flex-col">
                            {PRIVACY_CONTENT.map((item) => (
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

                    {/* Main Content */}
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
