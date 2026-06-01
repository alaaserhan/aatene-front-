"use client";

import { Search, Lock, Loader2, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/src/lib/utils";
import { useGetPrivacyPolicy } from "@/src/features/(web)/pages/hooks";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { useParams } from "next/navigation";

export default function PrivacyPage() {
    const { data, isLoading, isError } = useGetPrivacyPolicy();
    const params = useParams();
    const locale = String(params?.locale || "ar");
    const [activeId, setActiveId] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [lang, setLang] = useState<"ar" | "he">("ar");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        setLang(locale === "he" ? "he" : "ar");
    }, [locale]);

    const privacyList = data?.privacyPolicy || [];

    const availableItems = privacyList.filter(
        item => (item.title?.[lang] && item.title[lang].trim() !== "") || (item.content?.[lang] && item.content[lang].trim() !== "")
    );

    const scrollToSection = (index: number) => {
        setActiveId(index);
        setIsSidebarOpen(false);
        const element = document.getElementById(`section-${index}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const contentItems = availableItems
        .map((item, index) => ({ item, index }))
        .filter(({ item }) =>
            !searchQuery ||
            item.title?.[lang]?.includes(searchQuery) ||
            item.content?.[lang]?.includes(searchQuery)
        );

    return (
        <div className="min-h-screen flex flex-col">
            {/* Sticky Header Container */}
            <div className="sticky top-0 z-50 w-full">
                {/* Header */}
                <div className="gradient-blue w-full relative shadow-sm">
                    <div className="container mx-auto flex items-center justify-between h-[80px]">
                        <div className="flex items-center gap-3 text-white">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden mr-2 p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                                aria-label="Open navigation menu"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center bg-white/10">
                                <Lock className="w-5 h-5" />
                            </div>
                            <h1 className="text-xl md:text-2xl font-medium tracking-wide">
                                سياسة الخصوصية
                            </h1>

                        </div>

                        <div className="hidden md:flex flex-1 max-w-xl gap-4 items-center">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="ابحث عن أي كلمة ...."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-10 pr-10 pl-4 rounded-md bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none text-sm border-none transition-colors"
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                            </div>
                            <div className="w-32">
                                <ReusableDropdown
                                    options={[
                                        { value: "ar", label: "العربية" },
                                        { value: "he", label: "עברית" },
                                    ]}
                                    value={lang}
                                    onChange={(val) => setLang(val as "ar" | "he")}
                                    placeholder="اختر اللغة"
                                    className="h-10 bg-white/20 border-white/30 ove"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar & Language */}
                <div className="md:hidden gradient-blue px-4 pb-4 flex gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="ابحث عن أي كلمة ...."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pr-10 pl-4 rounded bg-white/90 focus:bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none text-sm border-none transition-colors"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <div className="w-28 shrink-0 ">
                        <ReusableDropdown
                            options={[
                                { value: "ar", label: "العربية" },
                                { value: "he", label: "עברית" },
                            ]}
                            value={lang}
                            onChange={(val) => setLang(val as "ar" | "he")}
                            placeholder="اللغة"
                            className="h-10 bg-white/20 border-white/30 "
                            dropdownPosition="bottom"
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto my-4 md:my-8 flex-1">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-4" />
                    </div>
                ) : isError ? (
                    <div className="flex items-center justify-center h-64 text-red-500">
                        حدث خطأ أثناء تحميل البيانات.
                    </div>
                ) : availableItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex items-center justify-center mb-6 relative w-40 h-40">
                            <Image src="/icons/empty3.svg" alt="empty" fill className="object-contain" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">
                            لا توجد بيانات متاحة بهذه اللغة
                        </h3>
                        <p className="text-gray-2 text-sm">
                            الرجاء اختيار لغة أخرى ليتم عرض المحتوى
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row items-start justify-center relative">
                        {/* Mobile Overlay */}
                        {isSidebarOpen && (
                            <div
                                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
                                onClick={() => setIsSidebarOpen(false)}
                            />
                        )}

                        {/* Sidebar Navigation - Drawer on Mobile, Sticky on Desktop */}
                        <div className={cn(
                            "fixed top-0 bottom-0 right-0 z-[70] w-[88vw] max-w-[320px] bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out",
                            "lg:relative lg:top-auto lg:bottom-auto lg:right-auto lg:z-auto lg:p-0 lg:shadow-none lg:translate-x-0 lg:flex lg:w-[260px] lg:max-w-[280px]",
                            isSidebarOpen ? "translate-x-0" : "translate-x-full"
                        )}>
                            <div className="flex h-full min-h-0 flex-col">
                                {/* Mobile Header for Drawer */}
                                <div className="flex items-center justify-between mb-6 lg:hidden">
                                    <h2 className="text-lg font-bold text-blue-4">الأقسام</h2>
                                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-500">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="flex min-h-0 flex-col overflow-y-auto">
                                    {contentItems.map(({ item, index }) => (
                                        <button
                                            key={index}
                                            onClick={() => scrollToSection(index)}
                                            className={cn(
                                                "w-full cursor-pointer flex  gap-2 py-[10px] px-[10px]  transition-all border-b border-[#e6e6e6]",
                                                activeId === index
                                                    ? "text-blue-3"
                                                    : ""
                                            )}
                                        >
                                            <span className="bg-blue-4 pt-1 rounded-full size-[22px] flex items-center justify-center text-white text-[12px] font-normal shrink-0">
                                                {index + 1}
                                            </span>
                                            <span className={cn(
                                                "text-[15px] leading-[1.7] text-start",
                                                activeId === index
                                                    ? "font-medium"
                                                    : "font-normal"
                                            )}>
                                                {item.title?.[lang]}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Vertical Divider */}
                        <div className="hidden lg:block w-[2px] mx-6 lg:mx-10 bg-blue-4 self-stretch" />

                        {/* Main Content - Centered Column */}
                        <div className="flex-1 max-w-4xl w-full">
                            <div className="flex flex-col gap-4">
                                {contentItems.length > 0 ? (
                                    contentItems.map(({ item, index }) => (
                                        <div key={index} id={`section-${index}`} className="scroll-mt-28">
                                            <h2 className="text-[17px] text-blue-4 mb-2  font-medium">
                                                {index + 1}. {item.title?.[lang]}
                                            </h2>
                                            {/* Using dangerouslySetInnerHTML because the API response contains HTML tags like <div><br></div> */}
                                            <div
                                                className="text-[15px] leading-loose whitespace-pre-line"
                                                dangerouslySetInnerHTML={{ __html: item.content?.[lang] || "" }}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-gray-2">
                                        لا توجد نتائج بحث مطابقة.
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Left Balancing Spacer to center content on large screens (last child in RTL) */}
                        <div className="hidden xl:block w-[260px] lg:w-[280px] shrink-0" />
                    </div>
                )}
            </div>
        </div>
    );
}
