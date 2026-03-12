"use client";

import { useEffect, useState } from "react";
import { getFCMToken } from "@/src/lib/firebase";
import { Bell, X } from "lucide-react";

const STORAGE_KEY = "notification_prompt_dismissed";

export default function NotificationPromptPopup() {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!("Notification" in window)) return;
        if (Notification.permission !== "default") return;
        if (localStorage.getItem(STORAGE_KEY)) return;

        const timer = setTimeout(() => {
            setVisible(true);
        }, 15000);

        return () => clearTimeout(timer);
    }, []);

    const handleEnable = async () => {
        setLoading(true);
        const finalize = (permission?: NotificationPermission) => {
            if (permission && permission !== "default") {
                localStorage.setItem(STORAGE_KEY, "true");
                setVisible(false);
            }
            setLoading(false);
        };

        const watcher = window.setInterval(() => {
            if (Notification.permission !== "default") {
                window.clearInterval(watcher);
                finalize(Notification.permission);
            }
        }, 300);

        const watcherTimeout = window.setTimeout(() => {
            window.clearInterval(watcher);
            if (Notification.permission === "default") {
                setLoading(false);
            }
        }, 3000);

        try {
            const permission = Notification.permission === "granted"
                ? "granted"
                : await Notification.requestPermission();

            if (permission === "granted") {
                if ("serviceWorker" in navigator) {
                    await navigator.serviceWorker.register("/firebase-messaging-sw.js").catch(() => {});
                }
                await getFCMToken().catch(() => {});
            }

            window.clearInterval(watcher);
            window.clearTimeout(watcherTimeout);
            finalize(permission);
        } catch {
            // تجاهل الخطأ
            window.clearInterval(watcher);
            window.clearTimeout(watcherTimeout);
            setLoading(false);
        }
    };

    const handleLater = () => {
        sessionStorage.setItem(STORAGE_KEY, "true");
        setVisible(false);
    };

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <>
            {/* Backdrop with blur */}
            <div
                className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Card centered on screen - same design as before */}
            <div
                dir="rtl"
                className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            >
                <div
                    className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 relative w-full max-w-sm"
                    style={{ animation: "scaleIn 0.35s ease" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <style>{`
                        @keyframes scaleIn {
                            from { opacity: 0; transform: scale(0.93); }
                            to   { opacity: 1; transform: scale(1); }
                        }
                    `}</style>

                {/* زر الإغلاق */}
                <button
                    onClick={handleClose}
                    disabled={loading}
                    className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30"
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
                        className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-70 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                جارٍ التفعيل...
                            </>
                        ) : (
                            <>🔔 فعّل الإشعارات</>
                        )}
                    </button>
                    {!loading && (
                        <button
                            onClick={handleLater}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl transition-colors"
                        >
                            لاحقاً
                        </button>
                    )}
                </div>
                </div>
            </div>
        </>
    );
}
