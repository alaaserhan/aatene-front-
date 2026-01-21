"use client";

export function ChatEmptyState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center h-full bg-gray-50/30 p-8">
            <div className="max-w-md text-center space-y-8">
                <h2 className="text-2xl font-bold text-gray-800">نصائح عامة</h2>
                <div className="space-y-4 text-gray-600 text-right" dir="rtl">
                    <p className="flex items-start gap-3 text-base">
                        <span className="font-bold text-gray-400">1.</span>
                        <span>اجتمع في الأماكن العامة فقط.</span>
                    </p>
                    <p className="flex items-start gap-3 text-base">
                        <span className="font-bold text-gray-400">2.</span>
                        <span>لا تقم بإرسال المال مسبقاً.</span>
                    </p>
                    <p className="flex items-start gap-3 text-base">
                        <span className="font-bold text-gray-400">3.</span>
                        <span>قم بتفقد المنتج جيداً قبل شرائه.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
