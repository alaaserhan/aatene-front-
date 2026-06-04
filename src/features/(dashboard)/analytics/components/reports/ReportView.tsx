// src/components/(admin)/analytics/reports/ReportView.tsx
"use client";

import { useState, useRef } from "react";
import {
    Download, Calendar, Flag, ChevronsUp, Loader2
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
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
import {
    StoresAnalyticsResponse,
    ProductsAnalyticsResponse,
    ServicesAnalyticsResponse,
    UsersAnalyticsResponse,
    MerchantsAnalyticsResponse,
    AnalyticsStore,
    AnalyticsUser,
    AnalyticsMerchant,
    AnalyticsService
} from "@/src/features/(dashboard)/analytics/api";


interface ReportViewProps {
    type: string;
}

export function ReportView({ type }: ReportViewProps) {
    const [period, setPeriod] = useState("current_year");
    const [isExporting, setIsExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const handleExport = async () => {
        if (!reportRef.current) return;
        setIsExporting(true);

        const generatePdf = (dataUrl: string) => {
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (reportRef.current!.offsetHeight * pdfWidth) / reportRef.current!.offsetWidth;
            pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`analytics_${type}_${period}.pdf`);
        };

        try {
            // Attempt 1: Full fidelity
            const dataUrl = await toPng(reportRef.current, {
                cacheBust: true,
                backgroundColor: "#ffffff",
                quality: 0.95,
                pixelRatio: 2,
            });
            generatePdf(dataUrl);
            toast.success("تم تصدير التقرير بنجاح");
        } catch (error) {
            console.warn("Full export failed, retrying without external images...", error);
            try {
                // Attempt 2: Exclude external images (likely CORS issue)
                const dataUrl = await toPng(reportRef.current, {
                    cacheBust: true,
                    backgroundColor: "#ffffff",
                    quality: 0.95,
                    pixelRatio: 2,
                    filter: (node) => {
                        // Exclude img tags with http/https sources (external)
                        if (node.nodeName === 'IMG' && (node as HTMLImageElement).src?.startsWith('http')) {
                            return false;
                        }
                        return true;
                    }
                });
                generatePdf(dataUrl);
                toast.success("تم تصدير التقرير (بدون الصور الخارجية)");
            } catch (retryError) {
                console.error("Export failed final attempt:", retryError);
                toast.error("فشل تصدير التقرير");
            }
        } finally {
            setIsExporting(false);
        }
    };

    const storesQuery = useGetAnalyticsStores(new URLSearchParams({ period }), undefined);
    const productsQuery = useGetAnalyticsProducts(new URLSearchParams({ period }), undefined);
    const servicesQuery = useGetAnalyticsServices(new URLSearchParams({ period }), undefined);
    const usersQuery = useGetAnalyticsUsers(new URLSearchParams({ period }), undefined);
    const merchantsQuery = useGetAnalyticsMerchants(new URLSearchParams({ period }), undefined);

    let isLoading = false;
    let data: StoresAnalyticsResponse | ProductsAnalyticsResponse | ServicesAnalyticsResponse | UsersAnalyticsResponse | MerchantsAnalyticsResponse | undefined = undefined;

    interface ConfigLine {
        key: string;
        color: string;
        name: string;
    }

    interface ConfigCard {
        title: string;
        value: string | number;
        icon: React.ReactNode;
        colorTheme: string;
    }

    interface ConfigListItem {
        id: number | string;
        title: string;
        subtitle: string;
        image: string | null;
        rank: number;
        badgeText: string | undefined;
        badgeColor: string;
    }

    interface Config {
        title: string;
        subtitle: string;
        icon: React.ReactNode;
        cards: ConfigCard[];
        chartLines: ConfigLine[];
        chartData: Record<string, string | number>[]; // Charts are flexible
        topListName: string;
        topListItems: ConfigListItem[];
        bottomListName?: string;
        bottomListItems?: ConfigListItem[];
    }

    let config: Config = {
        title: "",
        subtitle: "",
        icon: null,
        cards: [],
        chartLines: [],
        chartData: [],
        topListName: "",
        topListItems: []
    };

    // Standard Chart Colors
    const COLORS = ["#406896", "#FCBF13", "#DE3D31"];

    switch (type) {
        case "product":
            isLoading = productsQuery.isLoading;
            data = productsQuery.data as ProductsAnalyticsResponse;
            config = {
                title: "تقارير المنتجات",
                subtitle: "قائمة المنتجات  التي حصلت علي تصفح اكثر",
                icon: <img src="/icons/dashboard/nav_products.svg" alt="" className="w-full h-full" />,
                cards: [
                    { title: "اجمالي المنتجات", value: (data as ProductsAnalyticsResponse)?.totalProducts || 0, icon: <img src="/icons/dashboard/products1.svg" alt="" className="w-full h-full" />, colorTheme: COLORS[0] },
                    { title: "منتجات في انتظار الموافقة", value: (data as ProductsAnalyticsResponse)?.totalNotActiveProducts || 0, icon: <img src="/icons/dashboard/products2.svg" alt="" className="w-full h-full" />, colorTheme: COLORS[1] },
                    { title: "منتجات تم رفضها", value: 0, icon: <img src="/icons/dashboard/products3.svg" alt="" className="w-full h-full" />, colorTheme: COLORS[2] },
                ],
                chartLines: [
                    { key: "total_count", color: COLORS[0], name: "اجمالي المنتجات" },
                    { key: "active_count", color: COLORS[1], name: "منتجات في انتظار الموافقة" },
                    { key: "not_active_count", color: COLORS[2], name: "منتجات تم رفضها" },
                ],
                chartData: (data as ProductsAnalyticsResponse)?.productsGrowthChart || [],
                topListName: "المنتجات الاكثر تصفحاً",
                topListItems: [] // mostViewedProducts is missing in the API interface
            };
            break;

        case "service":
            isLoading = servicesQuery.isLoading;
            data = servicesQuery.data as ServicesAnalyticsResponse;
            config = {
                title: "تقارير الخدمات",
                subtitle: "قائمة الخدمات التي حصلت علي اعلي تقييم",
                icon: <img src="/icons/dashboard/nav_services.svg" alt="" className="w-full h-full" />,
                cards: [
                    { title: "اجمالي الخدمات", value: (data as ServicesAnalyticsResponse)?.totalServices || 0, icon: <img src="/icons/dashboard/service1.svg" alt="" className="w-full h-full" />, colorTheme: COLORS[0] },
                    { title: "إجمالي الخدمات قيد المراجعة", value: (data as ServicesAnalyticsResponse)?.totalActiveServices || 0, icon: <img src="/icons/dashboard/service2.svg" alt="" className="w-full h-full" />, colorTheme: COLORS[1] },
                    { title: "إجمالي الخدمات المرفوضة", value: (data as ServicesAnalyticsResponse)?.totalRejectedServices || 0, icon: <img src="/icons/dashboard/service3.svg" alt="" className="w-full h-full" />, colorTheme: COLORS[2] },
                ],
                chartLines: [
                    { key: "total_count", color: COLORS[0], name: "اجمالي الخدمات" },
                    { key: "pending_count", color: COLORS[1], name: "إجمالي الخدمات قيد المراجعة" },
                    { key: "rejected_count", color: COLORS[2], name: "إجمالي الخدمات المرفوضة" },
                ],
                chartData: (data as ServicesAnalyticsResponse)?.servicesGrowthChart || [],
                topListName: "الخدمات الأعلى تقييماً",
                topListItems: (data as ServicesAnalyticsResponse)?.topRatedServices?.map((item: AnalyticsService, i: number) => ({
                    id: item.id, title: item.title, subtitle: "التقيم", image: item.images_urls[0], rank: i + 1, badgeText: `${item.review_rate || 0} `, badgeColor: "bg-green-100 text-green-700"
                })) || [],
                bottomListName: "الخدمات الاعلي عدد بلاغات",
                bottomListItems: (data as ServicesAnalyticsResponse)?.mostReportedServices?.map((item: AnalyticsService, i: number) => ({
                    id: item.id, title: item.title, subtitle: "عدد البلاغات", image: item.images_urls[0], rank: i + 1, badgeText: `${item.reports_count || 0} بلاغ`, badgeColor: "bg-red-100 text-red-700"
                })) || []
            };
            break;

        case "user":
            isLoading = usersQuery.isLoading;
            data = usersQuery.data as UsersAnalyticsResponse;
            config = {
                title: "تقارير العملاء",
                subtitle: "قائمة العملاء الأكثر تفاعلاً",
                icon: <img src="/icons/dashboard/nav_users.svg" alt="" className="w-full h-full" />,
                cards: [
                    { title: "اجمالي العملاء", value: (data as UsersAnalyticsResponse)?.totalCustomers || 0, icon: <img src="/icons/dashboard/merchant1.svg" alt="" className="w-full h-full" />, colorTheme: COLORS[0] },
                    { title: "العملاء الجدد", value: (data as UsersAnalyticsResponse)?.activeCustomers || 0, icon: <img src="/icons/dashboard/merchant2.svg" alt="" className="w-full h-full" />, colorTheme: COLORS[1] },
                    { title: "العملاء المحظورين", value: (data as UsersAnalyticsResponse)?.notActiveCustomers || 0, icon: <img src="/icons/dashboard/merchant3.svg" alt="" className="w-full h-full" />, colorTheme: COLORS[2] },
                ],
                chartLines: [
                    { key: "total_count", color: COLORS[0], name: "اجمالي العملاء" },
                    { key: "active_count", color: COLORS[1], name: "العملاء الجدد" },
                    { key: "inactive_count", color: COLORS[2], name: "العملاء المحظورين" },
                ],
                chartData: (data as UsersAnalyticsResponse)?.customersGrowthChart || [],
                topListName: "العملاء الأكثر تفاعلاً",
                topListItems: (data as UsersAnalyticsResponse)?.mostActiveCustomers?.map((item: AnalyticsUser, i: number) => ({
                    id: item.id, title: item.full_name, subtitle: "عدد التقيمات", image: item.avatar, rank: i + 1, badgeText: String(item.review_count), badgeColor: "bg-green-100 text-green-700"
                })) || []
            };
            break;

        case "merchant":
            isLoading = merchantsQuery.isLoading;
            data = merchantsQuery.data as MerchantsAnalyticsResponse;
            config = {
                title: "تقارير التجار",
                subtitle: "قائمة التجار  حصلت علي اعلي تقييم",
                icon: <img src="/icons/dashboard/merchant1.svg" alt="" className="w-full h-full" />,
                cards: [
                    { title: "إجمالي التجار", value: (data as MerchantsAnalyticsResponse)?.totalMerchants || 0, icon: <img src="/icons/dashboard/merchant1.svg" alt="" className="w-full h-full" />, colorTheme: COLORS[0] },
                    { title: "التجار  الموثوقين", value: (data as MerchantsAnalyticsResponse)?.activeMerchants || 0, icon: <img src="/icons/dashboard/merchant2.svg" alt="" className="w-full h-full" />, colorTheme: COLORS[1] },
                    { title: "التجار  تم حظرهم", value: (data as MerchantsAnalyticsResponse)?.inactiveMerchants || 0, icon: <img src="/icons/dashboard/merchant3.svg" alt="" className="w-full h-full" />, colorTheme: COLORS[2] },
                ],
                chartLines: [
                    { key: "total_count", color: COLORS[0], name: "اجمالي التجار" },
                    { key: "active_count", color: COLORS[1], name: "التجار الموثوقين" },
                    { key: "inactive_count", color: COLORS[2], name: "التجار تم حظرهم" },
                ],
                chartData: (data as MerchantsAnalyticsResponse)?.merchantsGrowthChart || [],
                topListName: "التجار الاعلي تقييم",
                topListItems: (data as MerchantsAnalyticsResponse)?.topMerchantsByStores?.map((item: AnalyticsMerchant, i: number) => ({
                    id: item.id, title: item.name || "غير معروف", subtitle: "التقيم", image: item.avatar_url, rank: i + 1, badgeText: `${item.review_rate || 0} `, badgeColor: "bg-green-100 text-green-700"
                })) || [],
                bottomListName: "التجار الاعلي عدد بلاغات",
                bottomListItems: (data as MerchantsAnalyticsResponse)?.topMerchantsByReports?.map((item: AnalyticsMerchant, i: number) => ({
                    id: item.id, title: item.name || "غير معروف", subtitle: "عدد البلاغات", image: item.avatar_url, rank: i + 1, badgeText: `${item.store_reports_count || 0} بلاغ`, badgeColor: "bg-red-100 text-red-700"
                })) || []
            };
            break;

        case "store":
        default:
            isLoading = storesQuery.isLoading;
            data = storesQuery.data as StoresAnalyticsResponse;
            config = {
                title: "تقارير المتاجر",
                subtitle: "قائمة المتاجر التي حصلت علي اعلي تقييم",
                icon: <img src="/icons/dashboard/nav_stores.svg" alt="" className="w-full h-full" />,
                cards: [
                    { title: "اجمالي المتاجر", value: (data as StoresAnalyticsResponse)?.totalStores || 0, icon: <img src="/icons/dashboard/store1.svg" alt="" className="w-full h-full" />, colorTheme: COLORS[0] },
                    { title: "المتاجر الموثوقة", value: (data as StoresAnalyticsResponse)?.totalActiveStores || 0, icon: <img src="/icons/dashboard/store3.svg" alt="" className="w-full h-full" />, colorTheme: COLORS[1] },
                    { title: "المتاجر المحظورة", value: (data as StoresAnalyticsResponse)?.totalNotActiveStores || 0, icon: <img src="/icons/dashboard/store4.svg" alt="" className="w-full h-full" />, colorTheme: COLORS[2] },
                ],
                chartLines: [
                    { key: "total_count", color: COLORS[0], name: "اجمالي المتاجر" },
                    { key: "active_count", color: COLORS[1], name: "المتاجر الموثوقة" },
                    { key: "not_active_count", color: COLORS[2], name: "المتاجر المحظورة" },
                ],
                chartData: (data as StoresAnalyticsResponse)?.storesGrowthChart || [],
                topListName: "المتاجر الأعلى تقييماً",
                topListItems: (data as StoresAnalyticsResponse)?.topRatedStores?.map((item: AnalyticsStore, i: number) => ({
                    id: item.id, title: item.name, subtitle: "التقيم", image: item.cover_url, rank: i + 1, badgeText: `${item.review_rate || 0} `, badgeColor: "bg-green-100 text-green-700"
                })) || [],
                bottomListName: "المتاجر الاعلي عدد بلاغات",
                bottomListItems: (data as StoresAnalyticsResponse)?.topReportedStores?.map((item: AnalyticsStore, i: number) => ({
                    id: item.id, title: item.name, subtitle: "عدد البلاغات", image: item.logo_url, rank: i + 1, badgeText: `${item.reports_count || 0} بلاغ`, badgeColor: "bg-red-100 text-red-700"
                })) || []
            };
            break;
    }

    if (isLoading) {
        return <div className="h-[300px] sm:h-[500px] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#3A5779]" /></div>;
    }

    return (
        <div className="flex flex-col gap-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                        {config.icon}
                    </div>
                    <h1 className="text-xl font-medium">{config.title}</h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div >
                        <ReusableDropdown
                            options={[
                                { label: "الكل", value: "all_time" },
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
                    <Button
                        className="bg-blue-4 rounded-sm text-white gap-2"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        تصدير
                    </Button>
                </div>
            </div>

            {/* Report Content to Export */}
            <div ref={reportRef} className="flex flex-col gap-4 p-2 bg-white">
                {/* Top Stats Cards */}
                <StatsCards cards={config.cards} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-12 gap-4">

                    {/* 1. Top List (Right in RTL - displayed left in code order) */}
                    <div className="col-span-12 lg:col-span-4">
                        <TopList
                            title={config.topListName}
                            subtitle={config.subtitle}
                            items={config.topListItems}
                            className="min-h-[300px] lg:h-[450px]"
                            icon={ChevronsUp}
                            iconClassName="text-green-500"
                        />
                    </div>

                    {/* 2. Growth Chart (Left in RTL) */}
                    <div className="col-span-12 lg:col-span-8">
                        <GrowthChart
                            data={config.chartData}
                            title="تحليل النمو"
                            lines={config.chartLines}
                            className="min-h-[300px] lg:h-[450px]"
                        />
                    </div>

                    {/* 3. Bottom Full Width List (If available) */}
                    {config.bottomListItems && (
                        <div className="col-span-12">
                            <TopList
                                title={config.bottomListName || ""}
                                subtitle="القائمة السوداء"
                                items={config.bottomListItems}
                                icon={Flag}
                                className="w-full"
                                rankColor="text-red-500"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}