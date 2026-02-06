"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useGetDeviceNotificationSettings, useUpdateDevicePreferences } from "../../hooks";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { cn } from "@/src/lib/utils";

interface NotificationSettingItem {
    key: keyof NotificationState;
    title: string;
    description: string;
}

interface NotificationState {
    notify_activity: boolean;
    notify_platform_trends: boolean;
    notify_messages: boolean;
    notify_following: boolean;
    notify_recommendations: boolean;
}

const settingsItems: NotificationSettingItem[] = [
    {
        key: "notify_activity",
        title: "نشاطي",
        description: "الإشعارات والتنبيهات استنادًا إلى نشاطك في المنصة.",
    },
    {
        key: "notify_platform_trends",
        title: "اتجاهات وتحديثات المنصة",
        description: "أحدث الاكتشافات وأبرز ميزات التطبيق الجديدة.",
    },
    {
        key: "notify_messages",
        title: "الرسائل",
        description: "رسائل من البائعين أو من أعضاء آخرين في المنصة.",
    },
    {
        key: "notify_following",
        title: "المتاجر أو الأشخاص الذين تتابعهم",
        description: "نشاط المتاجر أو الأشخاص الذين قمت بمتابعتهم",
    },
    {
        key: "notify_recommendations",
        title: "التوصيات المخصصة",
        description: "اقتراح متاجر أو منتجات أو فعاليات استنادًا إلى تاريخك ونشاطك.",
    },
];

export default function NotificationsTab() {
    const { data: settingsData, isLoading } = useGetDeviceNotificationSettings();
    const { mutate: updateSettings, isPending: isUpdating } = useUpdateDevicePreferences();

    const [state, setState] = useState<NotificationState>({
        notify_activity: false,
        notify_platform_trends: false,
        notify_messages: false,
        notify_following: false,
        notify_recommendations: false,
    });

    // Load initial data
    useEffect(() => {
        if (settingsData?.device) {
            setState({
                notify_activity: settingsData.device.notify_activity,
                notify_platform_trends: settingsData.device.notify_platform_trends,
                notify_messages: settingsData.device.notify_messages,
                notify_following: settingsData.device.notify_following,
                notify_recommendations: settingsData.device.notify_recommendations,
            });
        }
    }, [settingsData]);

    const handleToggle = (key: keyof NotificationState, enabled: boolean) => {
        setState((prev) => ({ ...prev, [key]: enabled }));
    };

    const handleSave = () => {
        updateSettings(state);
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

            {/* Settings Lists */}
            <div className="space-y-8">
                {settingsItems.map((item) => (
                    <div key={item.key}>
                        <div className="flex items-center justify-between gap-4">


                            {/* Text Content (Right) */}
                            <div className="text-right flex-1">
                                <h3 className="text-base font-semibold text-[#3D3D3D] mb-1">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                            <ToggleSwitch
                                enabled={state[item.key]}
                                onChange={(val) => handleToggle(item.key, val)}
                            />
                        </div>
                        {/* Divider for all except last */}
                        {item.key !== "notify_recommendations" && (
                            <div className="border-b border-gray-50 mt-6" />
                        )}
                    </div>
                ))}
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
