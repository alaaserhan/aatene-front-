// src/app/(dashboard)/favorites/components/UserFavoritesPage.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";
import { UserFavoritesList } from "./UserFavoritesList";

interface UserFavoritesPageProps {
    userId: string;
}

export function UserFavoritesPage({ userId }: UserFavoritesPageProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const currentType = searchParams.get("type") || "product";

    const filterOptions = [
        { name: "المنتجات المفضلة", value: "product" },
        { name: "المتاجر المفضلة", value: "store" },
        { name: "الخدمات المفضلة", value: "service" },
    ];

    const handleFilterChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("type", value);
        router.push(`${pathname}?${params.toString()}`);
    };

    const breadcrumbItems = [
        { label: "الرئيسية", href: "/admin" },
        { label: "إدارة المفضلة", href: "/admin/favorites" },
        { label: "تفاصيل المفضلة" },
    ];

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen bg-[#F8F9FC]">
            <div className="flex flex-col gap-2">
                <Breadcrumb items={breadcrumbItems} />
                <h1 className="text-2xl font-bold text-gray-800 mt-2">إدارة المفضلة</h1>
                <p className="text-gray-500 text-sm">
                    تابع تفضيلات المستخدم، وقم بمراجعة وتنظيم المنتجات والمتاجر المضافة إلى المفضلة.
                </p>
            </div>

            <div className="grid grid-cols-12 gap-6 items-start">
                <div className="col-span-12 lg:col-span-3">
                    <SidebarFilterPanel 
                        options={filterOptions}
                        activeValue={currentType}
                        onValueChange={handleFilterChange}
                        className="border border-gray-200 rounded-lg"
                    />
                </div>

                <div className="col-span-12 lg:col-span-9">
                    <UserFavoritesList userId={userId} />
                </div>
            </div>
        </div>
    );
}