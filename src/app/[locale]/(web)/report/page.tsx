"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/src/hooks/use-language";
import { PortalReportModal } from "@/src/features/(web)/reports/components/PortalReportModal";

export default function ReportPortalPage() {
    const lang = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className=" bg-gray-50 flex flex-col items-center py-16 px-4">
            {/* Header Section */}
            <div className="text-center mb-12">
                <h1 className="text-2xl sm:text-3xl font-semibold mb-4">
                    بوابة الشكاوى والاقتراحات
                </h1>
                <p className="text-gray-2 max-w-2xl mx-auto text-sm sm:text-base">
                    نحن نقدر ملاحظاتك واقتراحاتك ونحن هنا لمساعدتك في حل مشاكلك والاستماع إلى اقتراحاتك
                </p>
            </div>

            {/* Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                {/* Inquiry Card -> /report/inquiry */}
                <Link
                    href={`/${lang}/report/inquiry`}
                    className="flex flex-col items-center justify-center bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group"
                >
                    <div className="relative w-48 h-48 mb-8 transform group-hover:scale-105 transition-transform duration-300">
                        <Image
                            src="/report1.svg"
                            alt="إستعلام عن الشكاوي"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h2 className="text-xl font-bold transition-colors">
                        إستعلام عن الشكاوي
                    </h2>
                </Link>

                {/* Submit Report/Suggestion Card -> Modal */}
                <div
                    onClick={() => setIsModalOpen(true)}
                    className="flex flex-col items-center justify-center bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group"
                >
                    <div className="relative w-48 h-48 mb-8 transform group-hover:scale-105 transition-transform duration-300">
                        <Image
                            src="/report2.svg"
                            alt="شكوى أو إفتراح"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h2 className="text-xl font-bold transition-colors">
                        شكوى أو إفتراح
                    </h2>
                </div>
            </div>

            {/* Render the Generic Report Modal */}
            <PortalReportModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
}
