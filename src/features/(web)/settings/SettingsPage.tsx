"use client";


import SettingsSidebar from "./components/SettingsSidebar";
import PersonalInfoTab from "./components/tabs/PersonalInfoTab";
import EmailTab from "./components/tabs/EmailTab";
import PhoneTab from "./components/tabs/PhoneTab";
import PasswordTab from "./components/tabs/PasswordTab";
import MerchantTab from "./components/tabs/MerchantTab";
import BlockedTab from "./components/tabs/BlockedTab";
import NotificationsTab from "./components/tabs/NotificationsTab";
import { StoriesTab } from "./components/tabs/StoriesTab";

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

import { useRouter, useSearchParams } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = (searchParams.get("tab") as SettingsTab) || "account";

    const setActiveTab = (tab: SettingsTab) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        router.push(`?${params.toString()}`);
    };

    const renderContent = () => {
        switch (activeTab) {
            case "account":
                return <PersonalInfoTab />;
            case "email":
                return <EmailTab />;
            case "phone":
                return <PhoneTab />;
            case "password":
                return <PasswordTab />;
            case "merchant":
                return <MerchantTab />;
            case "blocked":
                return <BlockedTab />;
            case "followers":
                return <div className="text-center py-10">قائمة المتابعين - قريبًا</div>;
            case "notifications":
                return <NotificationsTab />;
            case "stories":
                return <StoriesTab />;
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
