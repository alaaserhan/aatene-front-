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
import Link from "next/link";
import { useLanguage } from "@/src/hooks/use-language";
import { useLogout } from "@/src/auth";

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
    href?: string;
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
        description: "تغيير رقم الهاتف",
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
        description: "حمل التطبيق الخاص بالتجار و افتح متجرك",
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
        href: "/requested-services/create",
    },
];

export default function SettingsSidebar({
    activeTab,
    onTabChange,
}: SettingsSidebarProps) {
    const user = useAuthStore((state) => state.user);
    const lang = useLanguage();

    const tabs = allTabs.filter(tab => {
        if (tab.id === "merchant") {
            return user?.user_type === "client";
        }
        return true;
    });

    const { mutate: logout } = useLogout();
    const handleLogout = () => {
        logout();
    };

    return (
        <div className="flex flex-col gap-2 lg:gap-4 bg-[#fff] gap-3 border border-gray-200 rounded-xl p-4">
            {/* Header */}
            <h2 className=" font-medium mb-2">
                معلومات الحساب
            </h2>

            {/* Tab Items */}
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const className = cn(
                    "flex items-center justify-between gap-1.5 p-2 rounded-lg transition-all duration-200 cursor-pointer w-full text-right",
                    isActive
                        ? "bg-blue-3 text-white shadow-md"
                        : "bg-[#5B87B91A] border border-[#C8D7E8] text-[#2D496A] hover:bg-gray-50"
                );

                const content = (
                    <>
                        <div
                            className={cn(
                                "p-2 rounded-full"
                            )}
                        >
                            <span className={isActive ? "text-white" : "text-[#92AFD0]"}>
                                {tab.icon}
                            </span>
                        </div>
                        <div className="flex-1 text-right">
                            <p
                                className={cn(
                                    "font-normal text-sm",
                                    isActive ? "text-white" : "text-c2-primary"
                                )}
                            >
                                {tab.label}
                            </p>
                            <p
                                className={cn(
                                    "text-xs mt-0.5",
                                    isActive ? "text-white/80" : "text-[#717171]"
                                )}
                            >
                                {tab.description}
                            </p>
                        </div>

                        {/* Arrow (Left side for RTL) */}
                        <ChevronLeft
                            className={cn(
                                "w-5 h-5",
                                isActive ? "text-white" : "text-[#A4BCD5]"
                            )}
                        />
                    </>
                );

                if (tab.href) {
                    return (
                        <Link key={tab.id} href={`/${lang}${tab.href}`} className={className}>
                            {content}
                        </Link>
                    );
                }

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={className}
                    >
                        {content}
                    </button>
                );
            })}

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
