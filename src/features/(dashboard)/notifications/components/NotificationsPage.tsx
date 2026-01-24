"use client";

import { useState } from "react";
import { Plus, Filter, Bell } from "lucide-react";
import { NotificationsTable } from "./NotificationsTable";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { CreateNotificationModal } from "./CreateNotificationModal";
import { useNotifications } from "../hooks";
import { cn } from "@/src/lib/utils";

const TABS = [
    { id: "notifications", label: "الاشعارات" },
    { id: "sms", label: "رسائل SMS" },
    { id: "email", label: "البريد الالكتروني" },
    { id: "templates", label: "قوالب البريد الالكتروني" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function NotificationsPage() {
    const [activeTab, setActiveTab] = useState<TabId>("notifications");
    const [filterStatus, setFilterStatus] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: notificationsData, isLoading } = useNotifications({
        page: 1,
        per_page: 10,
    });

    const statusOptions = [
        { value: "active", label: "نشط" },
        { value: "inactive", label: "غير نشط" },
    ];

    return (

        <div className="bg-gray-50 h-full lg:h-[calc(100vh-80px)] flex flex-col text-right" dir="rtl">
            <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 h-[65px]">
                <div className="flex items-center justify-between h-16 px-6">
                    <nav className="flex items-center h-full">
                        <ul className="flex items-center gap-8 h-full">
                            {TABS.map((tab) => (
                                <li key={tab.id} className="h-full flex items-center">
                                    <button
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "text-sm font-semibold h-full flex items-center transition-colors cursor-pointer border-b-2 px-1",
                                            activeTab === tab.id
                                                ? "text-blue-3 border-blue-3"
                                                : "text-gray-2 border-transparent hover:text-blue-3"
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-3 text-white px-6 py-2.5 rounded-sm text-sm hover:bg-blue-4 transition-colors font-medium cursor-pointer"
                    >
                        <Plus className="w-5 h-5" />
                        <span>اضافة تنبيه</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 p-2 sm:p-6 space-y-6 overflow-y-auto">
                <div className="flex flex-col gap-4">
                    {/* Filters & Stats Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        {/* Left Side: Actions */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-2 text-blue-3 bg-blue-5 px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-4 transition-colors">
                                <Filter className="w-4 h-4" />
                                <span className="text-sm font-medium">تصفية</span>
                            </div>
                        </div>

                        {/* Right Side: Stats & Filter Dropdown */}
                        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm">
                                <span className="font-bold text-gray-900">الاشعارات</span>

                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                    <span className="text-gray-600">مفعل</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                                    <span className="text-gray-600">معلق</span>
                                </div>

                                <Bell className="w-5 h-5 text-gray-400" />
                            </div>

                            {/* Dropdown Filter */}
                            <div className="w-48">
                                <ReusableDropdown
                                    options={statusOptions}
                                    value={filterStatus}
                                    onChange={setFilterStatus}
                                    placeholder="الحالة"
                                    className="h-10"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mt-4">
                    {activeTab === "templates" ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">قريباً</h3>
                            <p className="text-gray-500">سيتم تفعيل هذه الميزة في وقت لاحق</p>
                        </div>
                    ) : (
                        <NotificationsTable
                            data={notificationsData?.data || []}
                            isLoading={isLoading}
                        />
                    )}
                </div>

                {/* Create Modal */}
                <CreateNotificationModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            </main>
        </div>
    );
}
