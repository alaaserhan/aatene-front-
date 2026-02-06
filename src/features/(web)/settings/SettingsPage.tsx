"use client";

import { useState } from "react";
import SettingsSidebar from "./components/SettingsSidebar";
import PersonalInfoTab from "./components/tabs/PersonalInfoTab";

export type SettingsTab =
    | "account"
    | "email"
    | "phone"
    | "password"
    | "merchant"
    | "blocked"
    | "followers"
    | "notifications"
    | "stories"
    | "topic"
    | "logout";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("account");

    const renderContent = () => {
        switch (activeTab) {
            case "account":
                return <PersonalInfoTab />;
            case "email":
                return <div className="text-center py-10">بريد إلكتروني - قريبًا</div>;
            case "phone":
                return <div className="text-center py-10">رقم الهاتف - قريبًا</div>;
            case "password":
                return <div className="text-center py-10">كلمة المرور - قريبًا</div>;
            case "merchant":
                return <div className="text-center py-10">كن تاجر - قريبًا</div>;
            case "blocked":
                return <div className="text-center py-10">قائمة الحظر - قريبًا</div>;
            case "followers":
                return <div className="text-center py-10">قائمة المتابعين - قريبًا</div>;
            case "notifications":
                return <div className="text-center py-10">إعدادات التنبيهات - قريبًا</div>;
            case "stories":
                return <div className="text-center py-10">القصص والهايلايت - قريبًا</div>;
            case "topic":
                return <div className="text-center py-10">أضف موضوع - قريبًا</div>;
            default:
                return <PersonalInfoTab />;
        }
    };

    return (
        <div className="container mx-auto my-8 min-h-[calc(100vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {/* Sidebar */}
                <div className="lg:col-span-2 ">
                    <SettingsSidebar
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                </div>

                {/* Main Content */}
                <div className="lg:col-span-5 ">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
