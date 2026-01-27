"use client";

import { useState } from "react";
import { Plus, Filter, Bell } from "lucide-react";
import { NotificationsTable } from "./NotificationsTable";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { NotificationTemplatesTable } from "./NotificationTemplatesTable";
import { CreateNotificationModal } from "./CreateNotificationModal";
import { useNotifications, useNotificationTemplates } from "../hooks";
import { SendTypeOption } from "../api";
import { cn } from "@/src/lib/utils";
import { CreateTemplateModal } from "./CreateTemplateModal";
import { NotificationTemplate } from "../api";

const TABS = [
    { id: "apps", label: "الاشعارات" },
    { id: "sms", label: "رسائل SMS" },
    { id: "email", label: "البريد الالكتروني" },
    { id: "templates", label: "قوالب البريد الالكتروني" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function NotificationsPage() {
    // Default to 'apps' as per user request to start with valid tab if needed, or 'apps' is the first one.
    // The previous code had "notifications" which might be invalid if not in TABS. 
    // TABS have ids: "apps", "sms", "email", "templates". 
    // So distinct state is better.
    const [activeTab, setActiveTab] = useState<TabId>("apps");
    const [filterStatus, setFilterStatus] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);

    const isTemplates = activeTab === "templates";

    // Data for Notifications
    // We cast activeTab to SendTypeOption when it is not 'templates'
    const sendType = !isTemplates ? (activeTab as SendTypeOption) : undefined;

    const { data: notificationsData, isLoading: isLoadingNotifications } = useNotifications({
        page: 1,
        per_page: 10,
        send_types: sendType,
    });

    // Data for Templates
    const { data: templatesData, isLoading: isLoadingTemplates } = useNotificationTemplates({
        page: 1,
        per_page: 15,
    });

    const statusOptions = [
        { value: "active", label: "نشط" },
        { value: "inactive", label: "غير نشط" },
    ];

    return (

        <div className="bg-gray-50 h-full lg:h-[calc(100vh-80px)] flex flex-col ">
            <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 sm:h-[65px]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 sm:py-0 h-auto sm:h-16 px-4 sm:px-6">
                    <nav className="w-full sm:w-auto overflow-x-auto no-scrollbar">
                        <ul className="flex items-center gap-2 sm:gap-8 justify-between sm:justify-start h-full whitespace-nowrap min-w-max">
                            {TABS.map((tab) => (
                                <li key={tab.id} className="h-full flex items-center">
                                    <button
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "text-sm font-semibold h-full flex items-center transition-colors cursor-pointer border-b-2  py-2 sm:py-0",
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
                        onClick={() => {
                            if (isTemplates) {
                                setEditingTemplate(null);
                                setIsTemplateModalOpen(true);
                            } else {
                                setIsCreateModalOpen(true);
                            }
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-3 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-sm text-xs sm:text-sm hover:bg-blue-4 transition-colors font-medium cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>{isTemplates ? "اضافة قالب" : "اضافة تنبيه"}</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 p-2 sm:p-6 space-y-6 overflow-y-auto">
                {/* Content */}
                <div className="mt-4">
                    {activeTab === "templates" ? (
                        <NotificationTemplatesTable
                            data={templatesData?.templates || []}
                            isLoading={isLoadingTemplates}
                            onEdit={(template) => {
                                setEditingTemplate(template);
                                setIsTemplateModalOpen(true);
                            }}
                        />
                    ) : (
                        <NotificationsTable
                            data={notificationsData?.data || []}
                            isLoading={isLoadingNotifications}
                        />
                    )}
                </div>

                {/* Create Modal */}
                <CreateNotificationModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    defaultSendType={activeTab === 'templates' ? 'email' : activeTab as SendTypeOption}
                />

                <CreateTemplateModal
                    key={editingTemplate ? `edit-${editingTemplate.id}` : "create"}
                    isOpen={isTemplateModalOpen}
                    onClose={() => {
                        setIsTemplateModalOpen(false);
                        setEditingTemplate(null);
                    }}
                    initialData={editingTemplate}
                />
            </main>
        </div>
    );
}
