"use client";

import { useEffect, useState } from "react";
import { getFCMToken } from "@/src/lib/firebase";
import { Bell, X } from "lucide-react";

const STORAGE_KEY = "notification_prompt_dismissed";

export default function NotificationPromptPopup() {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // لا تُظهر الـ popup إذا:
        // 1. المتصفح لا يدعم الإشعارات
        // 2. المستخدم قبل أو رفض الإشعارات مسبقاً
        // 3. سبق وظهرت له هذه النافذة
        if (typeof window === "undefined") return;
        if (!("Notification" in window)) return;
        if (Notification.permission !== "default") return;
        if (localStorage.getItem(STORAGE_KEY)) return;

        const timer = setTimeout(() => {
            setVisible(true);
        }, 15000); // 15 ثانية

        return () => clearTimeout(timer);
    }, []);

    const handleEnable = async () => {
        setLoading(true);
        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                // سجّل الـ service worker وجيب الـ FCM token
                if ("serviceWorker" in navigator) {
                    await navigator.serviceWorker.register("/firebase-messaging-sw.js").catch(() => {});
                }
                await getFCMToken().catch(() => {});
            }
        } catch {
            // تجاهل الخطأ
        } finally {
            setLoading(false);
            localStorage.setItem(STORAGE_KEY, "true");
            setVisible(false);
        }
    };

    const handleLater = () => {
        // لا نحفظ في localStorage حتى يمكن إعادة العرض في جلسة قادمة
        // لكن نمنع الظهور مرة أخرى في نفس الجلسة
        sessionStorage.setItem(STORAGE_KEY, "true");
        setVisible(false);
    };

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            dir="rtl"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm"
            style={{ animation: "slideUp 0.4s ease" }}
        >
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>

            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 relative">
                {/* زر الإغلاق */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="إغلاق"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* الأيقونة والعنوان */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Bell className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[15px] text-gray-900">فعّل الإشعارات</h3>
                        <p className="text-xs text-gray-400">لا تفوّت أي عرض</p>
                    </div>
                </div>

                {/* قائمة المزايا */}
                <ul className="space-y-1.5 mb-4 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                        <span className="text-green-500 text-base">✓</span>
                        احصل على خصومات حصرية
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-green-500 text-base">✓</span>
                        تنبيهات انخفاض الأسعار فور حدوثها
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-green-500 text-base">✓</span>
                        أحدث العروض والمنتجات الجديدة
                    </li>
                </ul>

                {/* الأزرار */}
                <div className="flex gap-2">
                    <button
                        onClick={handleEnable}
                        disabled={loading}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                        {loading ? "جارٍ التفعيل..." : "🔔 فعّل الإشعارات"}
                    </button>
                    <button
                        onClick={handleLater}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl transition-colors"
                    >
                        لاحقاً
                    </button>
                </div>
            </div>
        </div>
    );
}
