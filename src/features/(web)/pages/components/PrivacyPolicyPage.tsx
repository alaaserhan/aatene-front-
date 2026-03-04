"use client";

import { Search, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { useGetPrivacyPolicy } from "@/src/features/(web)/pages/hooks";

export default function PrivacyPage() {
    const { data, isLoading, isError } = useGetPrivacyPolicy();
    const [activeId, setActiveId] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    const privacyList = data?.privacyPolicy || [];

    const scrollToSection = (index: number) => {
        setActiveId(index);
        const element = document.getElementById(`section-${index}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const filteredContent = privacyList.filter(item =>
        item.title?.ar?.includes(searchQuery) || item.content?.ar?.includes(searchQuery)
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
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-4" />
                    </div>
                ) : isError ? (
                    <div className="flex items-center justify-center h-64 text-red-500">
                        حدث خطأ أثناء تحميل البيانات.
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row items-start">
                        {/* Sidebar Navigation */}
                        <div className="w-full lg:w-[280px] shrink-0 sticky top-4 ">
                            <div className="flex flex-col">
                                {privacyList.map((item, index) => (
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
                                            {item.title?.ar}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Vertical Divider */}
                        <div className="hidden lg:block w-[2px]  mx-8 bg-blue-4 self-stretch" />

                        {/* Main Content */}
                        <div className="flex-1 w-full">
                            <div className="flex flex-col gap-4">
                                {filteredContent.length > 0 ? (
                                    filteredContent.map((item, index) => (
                                        <div key={index} id={`section-${index}`} className="scroll-mt-28">
                                            <h2 className="text-[17px] text-blue-4 mb-2  font-medium">
                                                {index + 1}. {item.title?.ar}
                                            </h2>
                                            {/* Using dangerouslySetInnerHTML because the API response contains HTML tags like <div><br></div> */}
                                            <div
                                                className="text-[15px] leading-[2] whitespace-pre-line"
                                                dangerouslySetInnerHTML={{ __html: item.content?.ar || "" }}
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
                    </div>
                )}
            </div>
        </div>
    );
}
