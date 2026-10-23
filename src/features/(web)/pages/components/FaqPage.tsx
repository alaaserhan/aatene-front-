"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Play, Loader2 } from "lucide-react";
import Image from "next/image";
import { useGetFaqs } from "@/src/features/(web)/pages/hooks";

export default function FaqPage() {
    const { data: response, isLoading, isError } = useGetFaqs();
    const faqsData = response?.faqs || [];

    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
    const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]));
    const [searchQuery, setSearchQuery] = useState("");

    const tabsRef = useRef<HTMLDivElement>(null);
    const [tabsOverflow, setTabsOverflow] = useState({ left: false, right: false });

    // Physical edges: scrollLeft runs 0..max in LTR and -max..0 in RTL.
    const updateTabsOverflow = useCallback(() => {
        const el = tabsRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        const isRtl = getComputedStyle(el).direction === "rtl";
        const fromLeft = isRtl ? max + el.scrollLeft : el.scrollLeft;
        setTabsOverflow({ left: fromLeft > 1, right: max - fromLeft > 1 });
    }, []);

    useEffect(() => {
        const el = tabsRef.current;
        if (!el) return;
        updateTabsOverflow();
        const observer = new ResizeObserver(updateTabsOverflow);
        observer.observe(el);
        return () => observer.disconnect();
    }, [updateTabsOverflow, faqsData.length]);

    const scrollTabs = (direction: -1 | 1) => {
        const el = tabsRef.current;
        if (!el) return;
        el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
    };

    // Fades out whichever edge still has tabs hidden behind it.
    const tabsMask = `linear-gradient(to right, ${tabsOverflow.left ? "transparent" : "#000"}, #000 56px, #000 calc(100% - 56px), ${tabsOverflow.right ? "transparent" : "#000"})`;

    const handleCategoryChange = (index: number) => {
        setActiveCategoryIndex(index);
        setOpenItems(new Set([0]));
        setSearchQuery("");
    };

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

    const currentCategory = faqsData[activeCategoryIndex];

    const currentFaqs = useMemo(() => {
        return currentCategory?.faqs || [];
    }, [currentCategory]);

    const filteredFaqs = useMemo(() => {
        if (!searchQuery.trim()) return currentFaqs;
        return currentFaqs.filter(
            (faq) =>
                faq.question.includes(searchQuery) ||
                faq.answer.includes(searchQuery)
        );
    }, [searchQuery, currentFaqs]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-4" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center text-red-500">
                حدث خطأ أثناء تحميل البيانات.
            </div>
        );
    }

    return (
        <div className=" bg-[#f9fafb]">
            <div className="container">
                <div className="py-12 text-center">
                    <h1 className="text-2xl md:text-[32px] font-medium  mb-4">الأسئلة الشائعة</h1>
                    <p className="text-sm md:text-[17px] text-gray-2 max-w-2xl mx-auto px-4">
                        إجابات وافية على أكثر الأسئلة شيوعًا لضمان تجربة سلسة وواضحة.
                    </p>
                </div>

                <div className="pb-24">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="relative mb-10">
                            {tabsOverflow.left && (
                                <button
                                    type="button"
                                    aria-label="السابق"
                                    onClick={() => scrollTabs(-1)}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-white border border-c2-neutral-200 text-c2-navy-700 shadow-md flex items-center justify-center cursor-pointer hover:bg-c2-neutral-50"
                                >
                                    <ChevronLeft className="size-5" />
                                </button>
                            )}
                            {tabsOverflow.right && (
                                <button
                                    type="button"
                                    aria-label="التالي"
                                    onClick={() => scrollTabs(1)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-white border border-c2-neutral-200 text-c2-navy-700 shadow-md flex items-center justify-center cursor-pointer hover:bg-c2-neutral-50"
                                >
                                    <ChevronRight className="size-5" />
                                </button>
                            )}
                            <div
                                ref={tabsRef}
                                onScroll={updateTabsOverflow}
                                style={{ maskImage: tabsMask, WebkitMaskImage: tabsMask }}
                                className="flex overflow-x-auto overscroll-x-contain justify-center-safe gap-3 snap-x scroll-px-4 no-scrollbar"
                            >
                                {faqsData.map((cat, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleCategoryChange(index)}
                                        className={`px-6 md:px-10 py-3 md:py-4 rounded-md cursor-pointer text-[15px] md:text-[16px] font-medium transition-colors whitespace-nowrap shrink-0 snap-start ${activeCategoryIndex === index
                                            ? "bg-blue-4 text-white shadow-sm border border-transparent"
                                            : "bg-white border border-gray-200 text-gray-2 hover:border-blue-4 hover:text-blue-4"
                                            }`}
                                    >
                                        {cat.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl flex items-center gap-3 px-3 py-2.5 mb-10 ">
                            <Search className="w-5 h-5 text-gray-2 shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث من خلال أي كلمة مفتاحية"
                                className="flex-1 bg-transparent outline-none text-right text-[15px]  placeholder:text-gray-1"
                            />
                            <button className="bg-blue-4 text-white cursor-pointer px-8 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity shrink-0">
                                ابحث
                            </button>
                        </div>

                        <div className="space-y-4">
                            {filteredFaqs.map((faq, index) => {
                                const isOpen = openItems.has(index);
                                return (
                                    <div
                                        key={index}
                                        className="bg-white rounded-lg border border-transparent hover:border-blue-4/20 overflow-hidden transition-all duration-300"
                                    >
                                        <button
                                            onClick={() => toggleItem(index)}
                                            className="w-full flex items-center justify-between p-5  text-right"
                                        >
                                            <h3 className="text-[16px] md:text-[18px] font-medium  flex-1 leading-snug">
                                                {faq.question}
                                            </h3>
                                            <div className="bg-white-1  rounded-md w-8 h-8 cursor-pointer flex items-center text-gray-2 justify-center shrink-0 transition-transform">
                                                {isOpen ? (
                                                    <ChevronUp className="w-5 h-5 " />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 " />
                                                )}
                                            </div>
                                        </button>

                                        {isOpen && (
                                            <div className="p-5">
                                                <p className="text-[15px] /80 leading-relaxed text-right font-medium">
                                                    {faq.answer}
                                                </p>

                                                {faq.image_url && !faq.video_url && (
                                                    <div className="mt-6">
                                                        <Image
                                                            src={faq.image_url}
                                                            alt={faq.question}
                                                            width={600}
                                                            height={340}
                                                            className="rounded-xl w-full object-cover "
                                                        />
                                                    </div>
                                                )}

                                                {faq.video_url && (
                                                    <a
                                                        href={faq.video_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-6 relative bg-blue-5 rounded-xl w-full aspect-video flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity overflow-hidden group"
                                                    >
                                                        {faq.image_url && (
                                                            <Image src={faq.image_url} alt="Video thumbnail" fill className="object-cover" />
                                                        )}
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-10" />
                                                        <div className="bg-blue-3 rounded-full w-14 h-14 flex items-center justify-center z-20 shadow-lg group-hover:scale-105 transition-transform">
                                                            <Play className="w-6 h-6 text-white fill-white ms-1" />
                                                        </div>
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {filteredFaqs.length === 0 && (
                                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                                    <p className="text-gray-2 text-[16px]">لا توجد نتائج مطابقة لبحثك.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
