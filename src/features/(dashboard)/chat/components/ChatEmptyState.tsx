"use client";

import { Users } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface ChatEmptyStateProps {
    isGroupsFilter?: boolean;
    onCreateGroup?: () => void;
}

export function ChatEmptyState({ isGroupsFilter, onCreateGroup }: ChatEmptyStateProps) {
    if (isGroupsFilter) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full bg-gray-50/30 p-8">
                <div className="max-w-md text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-blue-5 flex items-center justify-center mx-auto">
                        <Users className="w-10 h-10 text-blue-3" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">لا توجد مجموعات</h2>
                    <p className="text-gray-500">قم بإنشاء مجموعة جديدة للتواصل مع عدة مستخدمين</p>
                    <Button
                        onClick={onCreateGroup}
                        className="bg-blue-3 hover:bg-blue-4 text-white px-8"
                    >
                        إنشاء مجموعة
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center h-full bg-gray-50/30 p-8">
            <div className="max-w-md text-center space-y-8">
                <h2 className="text-2xl font-bold text-gray-800">نصائح عامة</h2>
                <div className="space-y-4 text-gray-600 text-right" dir="rtl">
                    <p className="flex items-start gap-3 text-base">
                        <span className="font-bold text-gray-400">1.</span>
                        <span>اجتمع في الأماكن العامة فقط.</span>
                    </p>
                    <p className="flex items-start gap-3 text-base">
                        <span className="font-bold text-gray-400">2.</span>
                        <span>لا تقم بإرسال المال مسبقاً.</span>
                    </p>
                    <p className="flex items-start gap-3 text-base">
                        <span className="font-bold text-gray-400">3.</span>
                        <span>قم بتفقد المنتج جيداً قبل شرائه.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

