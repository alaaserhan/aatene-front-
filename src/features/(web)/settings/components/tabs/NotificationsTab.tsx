"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useGetDeviceNotificationSettings, useUpdateDevicePreferences } from "../../hooks";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { cn } from "@/src/lib/utils";

export default function NotificationsTab() {
    const { data: settingsData, isLoading } = useGetDeviceNotificationSettings();
    const { mutate: updateSettings, isPending: isUpdating } = useUpdateDevicePreferences();

    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

    // Load initial data
    useEffect(() => {
        if (settingsData?.device) {
            // Consider notifications enabled if any specific setting is true
            const anyEnabled =
                settingsData.device.notify_activity ||
                settingsData.device.notify_platform_trends ||
                settingsData.device.notify_messages ||
                settingsData.device.notify_following ||
                settingsData.device.notify_recommendations;

            setIsNotificationsEnabled(anyEnabled);
        }
    }, [settingsData]);

    const handleToggle = (enabled: boolean) => {
        setIsNotificationsEnabled(enabled);
    };

    const handleSave = () => {
        updateSettings({
            notify_activity: isNotificationsEnabled,
            notify_platform_trends: isNotificationsEnabled,
            notify_messages: isNotificationsEnabled,
            notify_following: isNotificationsEnabled,
            notify_recommendations: isNotificationsEnabled,
        });
    };

    if (isLoading) {
        return (
            <div className="rounded-xl p-4 md:p-6 border border-gray-200 bg-white min-h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#3D5E83]" />
            </div>
        );
    }

    return (
        <div className="rounded-xl p-4 md:p-6 border border-gray-200 bg-white">
            {/* Header Section */}
            <div className="flex flex-col mb-6 text-center md:text-right">
                <h1 className="text-3xl font-medium mb-2 text-[#3D3D3D]">
                    إعدادات التنبيهات
                </h1>
                <p className="text-gray-400 text-sm">
                    قم باعداد تنبيهاتك
                </p>
            </div>

            <div className="border-b border-gray-100 mb-8 w-full" />

            {/* Master Toggle */}
            <div className="space-y-8">
                <div className="flex items-center justify-between gap-4">
                    {/* Text Content (Right) */}
                    <div className="text-right flex-1">
                        <h3 className="text-base font-semibold text-[#3D3D3D] mb-1">
                            تفعيل الإشعارات
                        </h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {isNotificationsEnabled ? "الإشعار مفعل حالياً" : "الإشعارات معطلة حالياً"}
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={isNotificationsEnabled}
                        onChange={handleToggle}
                    />
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 pt-4 flex justify-end ">
                <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className={cn(
                        " bg-[#3D5E83] text-white py-3 px-16 rounded-full font-medium transition-all shadow-sm active:scale-95 cursor-pointer hover:bg-[#324d6d] flex justify-center items-center gap-2",
                        isUpdating && "opacity-60 cursor-not-allowed"
                    )}
                >
                    {isUpdating ? (
                        <>
                            <span>جاري الحفظ...</span>
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </>
                    ) : (
                        "حفظ "
                    )}
                </button>
            </div>
        </div>
    );
}
