"use client";

import { SettingsTab } from "../SettingsPage";
import { cn } from "@/src/lib/utils";
import { useAuthStore } from "@/src/stores/auth-store";
import {
    User,
    Mail,
    Phone,
    Lock,
    Store,
    Ban,
    Users,
    Bell,
    Film,
    MessageSquarePlus,
    LogOut,
    ChevronLeft,
} from "lucide-react";

interface SettingsSidebarProps {
    activeTab: SettingsTab;
    onTabChange: (tab: SettingsTab) => void;
}

interface TabItem {
    id: SettingsTab;
    label: string;
    description: string;
    icon: React.ReactNode;
    danger?: boolean;
}

const allTabs: TabItem[] = [
    {
        id: "account",
        label: "معلومات الحساب",
        description: "تعديل معلومات حسابك",
        icon: <User className="w-5 h-5" />,
    },
    {
        id: "email",
        label: "بريد إلكتروني",
        description: "تغيير البريد الالكتروني",
        icon: <Mail className="w-5 h-5" />,
    },
    {
        id: "phone",
        label: "رقم الهاتف",
        description: "تغير رقم الهاتف",
        icon: <Phone className="w-5 h-5" />,
    },
    {
        id: "password",
        label: "كلمة المرور",
        description: "تغيير كلمة المرور",
        icon: <Lock className="w-5 h-5" />,
    },
    {
        id: "merchant",
        label: "كن تاجر",
        description: "حمل التطبيق الخاص بالتجار و اعرض منتجاتك",
        icon: <Store className="w-5 h-5" />,
    },
    {
        id: "blocked",
        label: "قائمة الحظر",
        description: "الاشخاص الذين قمت بحظرهم",
        icon: <Ban className="w-5 h-5" />,
    },
    {
        id: "followers",
        label: "قائمة المتابعين",
        description: "الاشخاص الذين تتابعهم ويتابعونك",
        icon: <Users className="w-5 h-5" />,
    },
    {
        id: "notifications",
        label: "إعدادات التنبيهات",
        description: "قم بإعداد تنبيهاتك",
        icon: <Bell className="w-5 h-5" />,
    },
    {
        id: "stories",
        label: "القصص والهايلايت",
        description: "إضافة القصص وإدارتها",
        icon: <Film className="w-5 h-5" />,
    },
    {
        id: "topic",
        label: "أضف موضوع",
        description: "إن كنت تبحث عن خدمة أو منتج غير موجود",
        icon: <MessageSquarePlus className="w-5 h-5" />,
    },
];

export default function SettingsSidebar({
    activeTab,
    onTabChange,
}: SettingsSidebarProps) {
    const user = useAuthStore((state) => state.user);

    const tabs = allTabs.filter(tab => {
        if (tab.id === "merchant") {
            return user?.user_type === "client";
        }
        return true;
    });

    const handleLogout = () => {
        // TODO: Implement logout logic
        console.log("Logout clicked");
    };

    return (
        <div className="flex flex-col gap-3 border border-gray-200 rounded-xl p-4">
            {/* Header */}
            <h2 className=" font-medium mb-2">
                معلومات الحساب
            </h2>

            {/* Tab Items */}
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        "flex items-center justify-between gap-1.5 p-2 rounded-lg transition-all duration-200 cursor-pointer",
                        activeTab === tab.id
                            ? "bg-blue-3 text-white shadow-md"
                            : "bg-blue-5 border border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                >


                    <div
                        className={cn(
                            "p-2 rounded-full"
                        )}
                    >
                        <span className={activeTab === tab.id ? "text-white" : "text-[#92AFD0]"}>
                            {tab.icon}
                        </span>
                    </div>
                    <div className="flex-1 text-right">
                        <p
                            className={cn(
                                "font-medium text-sm",
                                activeTab === tab.id ? "text-white" : "text-blue-4"
                            )}
                        >
                            {tab.label}
                        </p>
                        <p
                            className={cn(
                                "text-xs mt-0.5",
                                activeTab === tab.id ? "text-white/80" : "text-gray-2"
                            )}
                        >
                            {tab.description}
                        </p>
                    </div>

                    {/* Arrow (Left side for RTL) */}
                    <ChevronLeft
                        className={cn(
                            "w-5 h-5",
                            activeTab === tab.id ? "text-white" : "text-[#92AFD0]"
                        )}
                    />

                </button>
            ))}

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 p-3 text-red-1 font-medium hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
                <LogOut className="w-4 h-4" />
                <span>تسجيل خروج</span>
            </button>
        </div>
    );
}
