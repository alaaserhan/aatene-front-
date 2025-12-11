// src/features/(dashboard)/banners/components/BannerDetailsPage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Calendar, Link as LinkIcon, Tag, Image as ImageIcon } from "lucide-react";
import { useGetSingleBanner, useDeleteBanner } from "../hooks";
import { Button } from "@/src/components/ui/button";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { cn } from "@/src/lib/utils";

interface BannerDetailsPageProps {
    bannerId: string | number;
}

export function BannerDetailsPage({ bannerId }: BannerDetailsPageProps) {
    const router = useRouter();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const { data: bannerData, isLoading } = useGetSingleBanner(bannerId);
    const { mutate: deleteBannerMutation, isPending: isDeleting } = useDeleteBanner();

    const banner = bannerData?.record;

    const handleEdit = () => {
        router.push(`/admin/banners/${bannerId}/edit`);
    };

    const handleDeleteClick = () => {
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        deleteBannerMutation(bannerId, {
            onSuccess: () => {
                router.push("/admin/banners");
            },
        });
    };

    const breadcrumbItems = [
        { label: "بنرات إعلانية", href: "/admin/banners" },
        { label: `إعلان رقم #${bannerId}` },
    ];

    // Parse cities from city field (assuming comma-separated)
    //   const cities = banner?.city ? banner.city.name.split(',').map(c => c.trim()) : [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-3" />
                    <span>جاري تحميل البيانات...</span>
                </div>
            </div>
        );
    }

    if (!banner) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-xl text-gray-600 mb-4">لم يتم العثور على الإعلان</p>
                    <Button
                        onClick={() => router.push("/admin/banners")}
                        style={{ backgroundColor: "var(--blue-3)" }}
                    >
                        العودة للقائمة
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8 px-4">
                {/* Breadcrumb */}
                <Breadcrumb items={breadcrumbItems} className="" />


                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 space-y-6">
                    {/* Header Section */}
                    <div className="bg-blue-5 rounded-lg p-6 mb-6">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            {/* Title */}
                            <h1 className="text-2xl font-bold text-blue-4">
                                إعلان رقم #{bannerId}
                            </h1>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleEdit}
                                    className="flex items-center rounded-sm gap-2 px-6 py-5 bg-blue-1 text-blue-3  cursor-pointer "
                                >
                                    <img src="/icons/dashboard/edit2.svg" alt="تعديل" className="w-4 h-4" />
                                    تعديل الإعلان
                                </Button>
                                <Button
                                    onClick={handleDeleteClick}
                                    disabled={isDeleting}
                                    className="flex items-center rounded-sm gap-2 px-6 py-5 bg-[#FB3748] text-white cursor-pointer hover:bg-[#FB3748]"
                                >
                                    {isDeleting && (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    )}
                                    حذف الإعلان
                                </Button>
                            </div>
                        </div>
                    </div>
                    {/* Banner Title */}
                    <div className=" ">
                        <DetailRow
                            icon={<img src="/icons/dashboard/mark2.svg" alt="Desktop" className="w-5 h-5 " />}
                            label="عنوان البانر"
                            value={banner.title}
                        />
                    </div>

                    {/* Dates Grid - في نفس السطر */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6  ">
                        {/* Start Date - على اليمين */}
                        <div className="order-2 md:order-1">
                            <DetailRow
                                icon={<img src="/icons/dashboard/calender.svg" alt="Desktop" className="w-5 h-5 " />}
                                label="تاريخ انتهاء الإعلان"
                                value={banner.end_date}
                            />
                        </div>

                        {/* End Date - على اليسار */}
                        <div className="order-1 md:order-2">
                            <DetailRow
                                icon={<img src="/icons/dashboard/calender.svg" alt="Desktop" className="w-5 h-5 " />}
                                label="تاريخ بداية الإعلان"
                                value={banner.start_date}
                            />
                        </div>
                    </div>

                    {/* Priority & Status Grid - في نفس السطر */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6  ">

                        <div className="">
                            <DetailRow
                                icon={<div className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold">#</div>}
                                label="أولوية الإعلان (ترتيب)"
                                value={banner.priority}
                            />
                        </div>


                        <div className="">
                            <DetailRow
                                icon={
                                    <img src="/icons/dashboard/Activity.svg" alt="Desktop" className="w-5 h-5 " />
                                }
                                label="حالة الإعلان"
                                value={
                                    <span className={cn(
                                        "font-medium",
                                        banner.is_active ? "text-green-600" : "text-red-600"
                                    )}>
                                        {banner.is_active ? "مفعل" : "غير مفعل"}
                                    </span>
                                }
                            />
                        </div>

                    </div>

                    {/* Cities/Districts */}
                    <div className="pt-2">
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium ">
                                المدينة أو الحي المراد ظهور الإعلان لسكانه
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {/* {cities.length > 0 ? (
                  cities.map((city, index) => (
                    <OptionTag
                      key={index}
                      label={city}
                      showRemoveButton={false}
                    />
                  ))
                ) : (
                  <span className="text-sm text-gray-500">الكل</span>
                )} */}
                                <OptionTag label={banner?.city?.name || "الكل"} />
                            </div>
                        </div>
                    </div>

                    {/* Place */}
                    <DetailRow
                        icon={<img src="/icons/dashboard/map.svg" alt="Desktop" className="w-5 h-5 " />}
                        label="مكان الإعلان"
                        value={banner.place}
                    />

                    {/* URL */}
                    <DetailRow
                        icon={<img src="/icons/dashboard/url.svg" alt="url" className="w-5 h-5 " />}
                        label="رابط URL"
                        value={
                            <a
                                href={banner.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline break-all"
                            >
                                {banner.url}
                            </a>
                        }
                    />

                    {/* Description */}
                    {banner.description && (
                        <DetailRow
                            icon={<img src="/icons/dashboard/text.svg" alt="Desktop" className="w-5 h-5 " />}
                            label="وصف قصير"
                            value={banner.description}
                        />
                    )}

                    {/* Images Section */}
                    <div className="pt-3 space-y-6">
                        {/* Desktop Banner */}
                        {banner.labtop_banner_url && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <img src="/icons/dashboard/gallery.svg" alt="Desktop" className="w-5 h-5 " />
                                    <label className="text-sm font-medium ">
                                        صورة العرض على الكمبيوتر
                                    </label>
                                </div>
                                <div className="border h-48 flex justify-center items-center border-gray-200 rounded-lg overflow-hidden">
                                    <img
                                        src={banner.labtop_banner_url}
                                        alt="Desktop Banner"
                                        className=" h-40 max-w-10/12 object-cover"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Mobile Banner */}
                        {banner.mobile_banner_url && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <img src="/icons/dashboard/gallery.svg" alt="Desktop" className="w-5 h-5 " />
                                    <label className="text-sm font-medium ">
                                        صورة العرض على الموبايل
                                    </label>
                                </div>
                                <div className="border h-48 flex justify-center items-center border-gray-200 rounded-lg overflow-hidden ">
                                    <img
                                        src={banner.mobile_banner_url}
                                        alt="Mobile Banner"
                                        className="max-w-10/12 h-40 object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="هل أنت متأكد من حذف هذا الإعلان؟"
                description="لا يمكن استرجاع البنر بعد حذفه"
                confirmText="نعم، قم بالحذف"
                cancelText="إلغاء"
            />
        </div>
    );
}

// Helper Component for Detail Rows
interface DetailRowProps {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
    return (
        <div className="flex items-start gap-2 border-b pb-4 pt-4 border-b-[#E2E2E2]">
            <div className="flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0 flex flex-row items-center gap-10">
                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                <div className="text-sm break-words font-medium">
                    {value}
                </div>
            </div>
        </div>
    );
}