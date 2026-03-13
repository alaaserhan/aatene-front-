"use client";

import { useEffect, useRef, useState } from "react";
import { getFCMToken } from "@/src/lib/firebase";
import { Bell, X } from "lucide-react";

const STORAGE_KEY = "notification_prompt_dismissed";

export default function NotificationPromptPopup() {
    const [visible, setVisible] = useState(false);
    
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const timerScheduledRef = useRef(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!("Notification" in window)) return;

        const trySchedulePopup = () => {
            
            if (timerScheduledRef.current) return;

            const isNewUser = localStorage.getItem("new_user_registered") === "true";
            const isDismissed = !!localStorage.getItem(STORAGE_KEY);

            if (isNewUser && !isDismissed) {
                timerScheduledRef.current = true;
                timerRef.current = setTimeout(() => {
                    setVisible(true);
                }, 15000);
                
                clearInterval(poll);
            }
        };

        const poll = setInterval(trySchedulePopup, 500);

        
        trySchedulePopup();

        return () => {
            clearInterval(poll);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handleEnable = () => {
        
        localStorage.setItem(STORAGE_KEY, "true");
        localStorage.removeItem("new_user_registered");
        setVisible(false);

        
        (async () => {
            try {
                const permission = Notification.permission === "granted"
                    ? "granted"
                    : await Notification.requestPermission();

                if (permission === "granted") {
                    localStorage.setItem("notifications_enabled", "true");
                    if ("serviceWorker" in navigator) {
                        await navigator.serviceWorker.register("/firebase-messaging-sw.js").catch(() => { });
                    }
                    await getFCMToken().catch(() => { });
                } else {
                    localStorage.setItem("notifications_enabled", "false");
                }
            } catch {
                
            }
        })();
    };

    const handleLater = () => {
        localStorage.removeItem("new_user_registered");
        sessionStorage.setItem(STORAGE_KEY, "true");
        setVisible(false);
    };

    const handleClose = () => {
        localStorage.removeItem("new_user_registered");
        localStorage.setItem(STORAGE_KEY, "true");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <>
            
            <div
                className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm"
                onClick={handleClose}
            />

            
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
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                            🔔 فعّل الإشعارات
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
        </>
    );
}
