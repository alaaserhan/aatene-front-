// src/components/(admin)/analytics/reports/ReportView.tsx
"use client";

import { useState } from "react";
import {
    Store, ShoppingBag, Users, Wrench, Download, Calendar,
    UserCheck, PackageX, UserX, CheckCircle2, AlertCircle, Flag,
    ChevronsUp
} from "lucide-react";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Button } from "@/src/components/ui/button";
import {
    useGetAnalyticsStores,
    useGetAnalyticsProducts,
    useGetAnalyticsServices,
    useGetAnalyticsUsers,
    useGetAnalyticsMerchants
} from "@/src/features/(dashboard)/analytics/hooks";
import { StatsCards } from "./StatsCards";
import { GrowthChart } from "./GrowthChart";
import { TopList } from "./TopList";
import { Loader2 } from "lucide-react";

interface ReportViewProps {
    type: string;
}

export function ReportView({ type }: ReportViewProps) {
    const [period, setPeriod] = useState("last_year");

    const storesQuery = useGetAnalyticsStores(new URLSearchParams({ period }), undefined);
    const productsQuery = useGetAnalyticsProducts(new URLSearchParams({ period }), undefined);
    const servicesQuery = useGetAnalyticsServices(new URLSearchParams({ period }), undefined);
    const usersQuery = useGetAnalyticsUsers(new URLSearchParams({ period }), undefined);
    const merchantsQuery = useGetAnalyticsMerchants(new URLSearchParams({ period }), undefined);

    let isLoading = false;
    let data: any = null;
    let config: any = {};

    switch (type) {
        case "product":
            isLoading = productsQuery.isLoading;
            data = productsQuery.data;
            config = {
                title: "تقارير المنتجات",
                icon: ShoppingBag,
                cards: [
                    { title: "اجمالي المنتجات", value: data?.totalProducts, icon: ShoppingBag, colorTheme: "gray" },
                    { title: "منتجات في انتظار الموافقة", value: data?.totalNotActiveProducts, icon: PackageX, colorTheme: "yellow" },
                    { title: "منتجات تم رفضها", value: 0, icon: PackageX, colorTheme: "red" },
                ],
                chartLines: [
                    { key: "total_count", color: "#3A5779", name: "اجمالي المنتجات" },
                    { key: "active_count", color: "#10B981", name: "منتجات نشطة" },
                    { key: "not_active_count", color: "#F59E0B", name: "منتجات في انتظار الموافقة" },
                ],
                chartData: data?.productsGrowthChart || [],
                topListName: "المنتجات الأكثر تصفحاً",
                topListItems: data?.topRatedProducts?.map((item: any, i: number) => ({
                    id: item.id, title: item.name, subtitle: `${item.review_count || 0} تقييم`, image: item.cover_url, rank: i + 1, badgeText: "150 طلب", badgeColor: "bg-green-100 text-green-700"
                })) || []
            };
            break;

        case "service":
            isLoading = servicesQuery.isLoading;
            data = servicesQuery.data;
            config = {
                title: "تقارير الخدمات",
                icon: Wrench,
                cards: [
                    { title: "اجمالي الخدمات", value: data?.totalServices, icon: Wrench, colorTheme: "gray" },
                    { title: "إجمالي الخدمات قيد المراجعة", value: data?.totalActiveServices, icon: CheckCircle2, colorTheme: "yellow" },
                    { title: "إجمالي الخدمات المرفوضة", value: data?.totalRejectedServices, icon: PackageX, colorTheme: "red" },
                ],
                chartLines: [
                    { key: "total_count", color: "#3A5779", name: "اجمالي الخدمات" },
                    { key: "pending_count", color: "#F59E0B", name: "قيد المراجعة" },
                    { key: "rejected_count", color: "#EF4444", name: "مرفوضة" },
                ],
                chartData: data?.servicesGrowthChart || [],
                topListName: "الخدمات الأعلى تقييماً",
                topListItems: data?.topRatedServices?.map((item: any, i: number) => ({
                    id: item.id, title: item.title, subtitle: `${item.views_count || 0} مشاهدة`, image: null, rank: i + 1, badgeText: "150 تقييم", badgeColor: "bg-green-100 text-green-700"
                })) || []
            };
            break;

        case "user":
            isLoading = usersQuery.isLoading;
            data = usersQuery.data;
            config = {
                title: "تقارير العملاء",
                icon: Users,
                cards: [
                    { title: "اجمالي العملاء", value: data?.totalCustomers, icon: Users, colorTheme: "blue" },
                    { title: "العملاء الجدد", value: data?.activeCustomers, icon: UserCheck, colorTheme: "yellow" },
                    { title: "العملاء المحظورين", value: data?.notActiveCustomers, icon: UserX, colorTheme: "red" },
                ],
                chartLines: [
                    { key: "total_count", color: "#3A5779", name: "اجمالي العملاء" },
                    { key: "active_count", color: "#F59E0B", name: "العملاء الذين تم حظرهم" },
                    { key: "inactive_count", color: "#EF4444", name: "العملاء الاكثر تفاعلاً" },
                ],
                chartData: data?.customersGrowthChart || [],
                topListName: "العملاء الأكثر تفاعلاً",
                topListItems: data?.mostActiveCustomers?.map((item: any, i: number) => ({
                    id: item.id, title: item.full_name, subtitle: "عدد التقيمات", image: item.avatar, rank: i + 1, badgeText: item.review_count, badgeColor: "bg-green-100 text-green-700"
                })) || []
            };
            break;

        case "merchant":
            isLoading = merchantsQuery.isLoading;
            data = merchantsQuery.data;
            config = {
                title: "تقارير التجار",
                icon: Store,
                cards: [
                    { title: "إجمالي التجار", value: data?.totalMerchants, icon: Users, colorTheme: "gray" },
                    { title: "التجار  الموثوقين", value: data?.activeMerchants, icon: Store, colorTheme: "green" },
                    { title: "التجار  تم حظرهم", value: data?.inactiveMerchants, icon: AlertCircle, colorTheme: "red" },
                ],
                chartLines: [
                    { key: "total_count", color: "#3A5779", name: "اجمالي التجار" },
                    { key: "active_count", color: "#F59E0B", name: "التجار تم حظرهم" },
                    { key: "inactive_count", color: "#EF4444", name: "التجار الموثوقين" },
                ],
                chartData: data?.merchantsGrowthChart || [],
                topListName: "التجار الاعلي تقييم",
                topListItems: data?.topMerchantsByStores?.map((item: any, i: number) => ({
                    id: item.id, title: item.name, subtitle: "عدد التقييمات", image: item.avatar_url, rank: i + 1, badgeText: "150 تقييم", badgeColor: "bg-green-100 text-green-700"
                })) || [],
                bottomListName: "التجار الاعلي عدد بلاغات",
                bottomListItems: data?.topMerchantsByReports?.map((item: any, i: number) => ({
                    id: item.id, title: item.name, subtitle: "عدد البلاغات", image: item.avatar_url, rank: i + 1, badgeText: `${item.store_reports_count || 0} بلاغ`, badgeColor: "bg-red-100 text-red-700"
                })) || []
            };
            break;

        case "store":
        default:
            isLoading = storesQuery.isLoading;
            data = storesQuery.data;
            config = {
                title: "تقارير المتاجر",
                icon: Store,
                cards: [
                    { title: "اجمالي المتاجر", value: data?.totalStores, icon: Store, colorTheme: "gray" },
                    { title: "المتاجر الموثوقة", value: data?.totalActiveStores, icon: Store, colorTheme: "yellow" },
                    { title: "المتاجر المحظورة", value: data?.totalNotActiveStores, icon: Store, colorTheme: "red" },
                ],
                chartLines: [
                    { key: "total_count", color: "#3A5779", name: "اجمالي المتاجر" },
                    { key: "active_count", color: "#EF4444", name: "المتاجر تم حظرهم" },
                    { key: "not_active_count", color: "#F59E0B", name: "المتاجر الموثوقين" },
                ],
                chartData: data?.storesGrowthChart || [],
                topListName: "المتاجر الأعلى تقييماً",
                topListItems: data?.topRatedStores?.map((item: any, i: number) => ({
                    id: item.id, title: item.name, subtitle: "عدد التقييمات", image: item.logo_url, rank: i + 1, badgeText: `${item.review_rate || 50} تقييم`, badgeColor: "bg-green-100 text-green-700"
                })) || [],
                bottomListName: "المتاجر الاعلي عدد بلاغات",
                bottomListItems: data?.topReportedStores?.map((item: any, i: number) => ({
                    id: item.id, title: item.name, subtitle: "عدد البلاغات", image: item.logo_url, rank: i + 1, badgeText: `${item.reports_count || 0} بلاغ`, badgeColor: "bg-red-100 text-red-700"
                })) || []
            };
            break;
    }

    if (isLoading) {
        return <div className="h-[500px] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#3A5779]" /></div>;
    }

    const PageIcon = config.icon;

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <PageIcon className="w-5 h-5" />
                    <h1 className="text-xl font-medium">{config.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div >
                        <ReusableDropdown
                            options={[
                                { label: "اليوم الحالي", value: "current_day" },
                                { label: "أمس", value: "last_day" },
                                { label: "الأسبوع الحالي", value: "current_week" },
                                { label: "الأسبوع الماضي", value: "last_week" },
                                { label: "الشهر الحالي", value: "current_month" },
                                { label: "الشهر الماضي", value: "last_month" },
                                { label: "السنة الحالية", value: "current_year" },
                                { label: "السنة الماضية", value: "last_year" },
                            ]}
                            value={period}
                            onChange={setPeriod}
                            triggerIcon={<Calendar className="w-4 h-4" />}
                            placeholder="الفترة"
                        />
                    </div>
                    <Button className="bg-blue-4 rounded-sm text-white gap-2">
                        <Download className="w-4 h-4" />
                        تصدير
                    </Button>
                </div>

            </div>

            {/* Top Stats Cards */}
            <StatsCards cards={config.cards} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-4">

                {/* 1. Top List (Right in RTL - displayed left in code order) */}
                <div className="col-span-12 lg:col-span-4">
                    <TopList
                        title={config.topListName}
                        subtitle={`قائمة ${config.title} حسب التصنيف`}
                        items={config.topListItems}
                        className="h-[450px]" 
                        icon={ChevronsUp}
                    />
                </div>

                {/* 2. Growth Chart (Left in RTL) */}
                <div className="col-span-12 lg:col-span-8">
                    <GrowthChart
                        data={config.chartData}
                        title="تحليل النمو"
                        lines={config.chartLines}
                        className="h-[450px]"
                    />
                </div>

                {/* 3. Bottom Full Width List (If available) */}
                {config.bottomListItems && config.bottomListItems.length > 0 && (
                    <div className="col-span-12">
                        <TopList
                            title={config.bottomListName}
                            subtitle="القائمة السوداء"
                            items={config.bottomListItems}
                            icon={Flag}
                            className="w-full h-[450px]" // Full Width & Fixed Height
                        />
                    </div>
                )}
            </div>
        </div>
    );
}