// src/features/(dashboard)/services/components/ServiceDetailsPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Phone,
    Send,
    Share2,
    CheckCircle2,
    Pen,
} from "lucide-react";
import { useGetService, useUpdateServiceStatus } from "../hooks";
import { useGetReportTypes } from "@/src/features/(dashboard)/reports/hooks";
import { useGetSingleStore } from "../../stores/hooks";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Button } from "@/src/components/ui/button";
import { RejectServiceModal } from "./RejectServiceModal";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";

import { ProviderInfoCard } from "@/src/components/(dashboard)/ProviderInfoCard";
import { ShareModal } from "@/src/components/ui/ShareModal";
import { cn } from "@/src/lib/utils";
import Cookies from "js-cookie"; // ✅ للتحقق من الصلاحيات
import { useQueryClient } from "@tanstack/react-query";

interface ServiceDetailsPageProps {
    serviceId: number;
    storeId: number;
}

export function ServiceDetailsPage({ serviceId, storeId }: ServiceDetailsPageProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    // --- States ---
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successModalTitle, setSuccessModalTitle] = useState("");
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [activeImage, setActiveImage] = useState<string>("");
    const [isAdmin, setIsAdmin] = useState(false); // ✅ حالة الأدمن

    // التحقق من صلاحية الأدمن عند التحميل
    useEffect(() => {
        const userType = Cookies.get("user_type");
        setIsAdmin(userType === "admin");
    }, []);

    // --- Data Fetching ---
    const { data: serviceData, isLoading } = useGetService(serviceId, storeId);
    const service = serviceData?.data;

    const { data: storeData } = useGetSingleStore(storeId);
    const store = storeData?.record;

    const { mutate: updateStatus, isPending: isUpdating } = useUpdateServiceStatus();

    // جلب أسباب الرفض فقط للأدمن
    const { data: reportTypesData, isLoading: isLoadingReportTypes } = useGetReportTypes({ enabled: isAdmin });

    // --- Image Handling ---
    const imagesList = service ? (Array.isArray(service.images_urls) ? service.images_urls : (service.images_urls ? [service.images_urls] : [])) : [];

    useEffect(() => {
        if (imagesList.length > 0 && !activeImage) {
            setActiveImage(imagesList[0]);
        }
    }, [imagesList, activeImage]);

    const displayImage = activeImage || (imagesList.length > 0 ? imagesList[0] : "/placeholder.png");

    // --- Handlers ---

    const handleApprove = () => {
        updateStatus({
            id: serviceId,
            payload: { status: "approved" },
            storeId
        }, {
            onSuccess: () => {
                // تحديث البيانات فوراً لإخفاء الشريط
                queryClient.invalidateQueries({ queryKey: ["services"] });
                queryClient.invalidateQueries({ queryKey: ["services", serviceId] }); // تحديث الخدمة الحالية
                setSuccessModalTitle("تم قبول الخدمة بنجاح");
                setIsSuccessModalOpen(true);
            }
        });
    };

    const handleRejectClick = () => {
        setIsRejectModalOpen(true);
    };

    const confirmReject = (reasonId: string, note: string) => {
        updateStatus({
            id: serviceId,
            payload: {
                status: "rejected",
                reason: note
            },
            storeId
        }, {
            onSuccess: () => {
                setIsRejectModalOpen(false);
                setSuccessModalTitle("تم رفض الخدمة بنجاح");
                setIsSuccessModalOpen(true);
                queryClient.invalidateQueries({ queryKey: ["services"] });
                queryClient.invalidateQueries({ queryKey: ["services", serviceId] });
            }
        });
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center">جاري التحميل...</div>;
    if (!service) return <div className="flex h-screen items-center justify-center">الخدمة غير موجودة</div>;

    const breadcrumbItems = [
        { label: "مقدمي الخدمات", href: "/admin/serviceProviders" },
        { label: store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "تفاصيل المتجر", href: `/admin/serviceProviders/${storeId}` },
        { label: service.title, href: `/admin/serviceProviders/services/${storeId}/${service.id}` },
    ];

    return (
        <div className="flex flex-col pb-10">
            {/* Header Area */}
            <div>
                <Breadcrumb items={breadcrumbItems} className="bg-white px-6" />

                {/* ✅ Action Bar: يظهر للأدمن عندما تكون الحالة pending أو rejected أو approved */}
                {isAdmin && (service.status === "pending" || service.status === "rejected" || service.status === "approved") && (
                    <div className="container mx-auto mt-4 px-4 md:px-0">
                        <div className="px-6 py-4 flex items-center justify-between border border-gray-100 bg-white rounded-lg">
                            <h2 className="text-lg font-bold ">اختر الاجراء المناسب للخدمة</h2>
                            <div className="flex gap-3">
                                {service.status !== "approved" && (
                                    <Button
                                        onClick={handleApprove}
                                        disabled={isUpdating}
                                        className="bg-[#34D399] hover:bg-[#2cb683] text-white px-8 h-10 font-bold rounded "
                                    >
                                        {isUpdating ? "جاري التحديث..." : service.status === "rejected" ? "قبول الخدمة مرة أخرى" : "قبول الخدمة"}
                                    </Button>
                                )}
                                {service.status !== "rejected" && (
                                    <Button
                                        onClick={handleRejectClick}
                                        disabled={isUpdating}
                                        className="bg-[#EF4444] hover:bg-[#d93838] text-white px-8 h-10 font-bold rounded "
                                    >
                                        رفض الخدمة
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="container mx-auto px-4 md:px-0 mt-6">
                <div className="grid grid-cols-12 gap-6">

                    {/* Main Content Area */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 order-2 lg:order-1">
                        <div className="bg-white rounded-2xl p-4  border border-gray-100">
                            {/* Title & Actions */}
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold  leading-tight max-w-[70%]">
                                    {service.title}
                                </h1>
                                <div className="flex gap-4 text-gray-2">
                                    <button
                                        onClick={() => setIsShareModalOpen(true)}
                                        className="flex items-center gap-1 text-blue-4 transition-colors cursor-pointer hover:text-blue-600"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span className="text-sm font-medium">مشاركة الخدمة</span>
                                    </button>
                                    <button className="flex items-center gap-1 text-blue-4 transition-colors cursor-pointer" onClick={() => router.push(`/admin/serviceProviders/services/edit/${serviceId}/${storeId}`)}>
                                        <Pen className="w-4 h-4" />
                                        <span className="text-sm font-medium">تعديل الخدمة</span>
                                    </button>
                                </div>
                            </div>

                            {/* Main Image Display */}
                            <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 border border-gray-100 bg-gray-50">
                                <img
                                    src={displayImage}
                                    alt={service.title}
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                />
                            </div>

                            {/* Thumbnails */}
                            {imagesList.length > 1 && (
                                <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                                    {imagesList.map((img, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setActiveImage(img)}
                                            className={cn(
                                                "w-24 h-16 rounded-lg overflow-hidden border shrink-0 cursor-pointer transition-all duration-200",
                                                activeImage === img
                                                    ? "border-blue-500 ring-2 ring-blue-100 opacity-100"
                                                    : "border-gray-200 opacity-70 hover:opacity-100 hover:border-blue-300"
                                            )}
                                        >
                                            <img
                                                src={img}
                                                alt={`thumb-${idx}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Provider Info Card */}
                            {store && (
                                <div className="mb-6">
                                    <ProviderInfoCard store={store} />
                                </div>
                            )}

                            {/* Description Section */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold  mb-4">تفاصيل الخدمة</h3>
                                <div
                                    className="text-gray-2 leading-relaxed whitespace-pre-line text-sm"
                                    dangerouslySetInnerHTML={{ __html: service.description }}
                                />
                            </div>

                            {/* Specialties Section */}
                            {service.specialties && service.specialties.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold  mb-3">مجالات الخدمة:</h3>
                                    <ul className="space-y-2">
                                        {service.specialties.map((item: any, idx) => (
                                            <li key={item.id || idx} className="flex items-center gap-2 text-gray-700 text-sm">
                                                <div className="text-green-500">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                                {typeof item === 'object' ? item.title : item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* FAQ Section */}
                            {service.questions && service.questions.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold  mb-1">الأسئلة الشائعة (اختياري)</h3>
                                    <p className="text-gray-2 text-xs mb-6">اكتب إجابات للأسئلة الشائعة التي يطرحها عميلك. أضف حتى خمسة أسئلة.</p>

                                    <div className="space-y-6">
                                        {service.questions.map((q, idx) => (
                                            <div key={idx} className="border-b border-gray-50 pb-4 last:border-0">
                                                <h4 className="font-bold  text-sm mb-2">{idx + 1}. {q.question}</h4>
                                                <p className="text-gray-2 text-sm leading-relaxed">{q.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 order-1 lg:order-2">
                        <div className="bg-white rounded-2xl p-6  border border-gray-100 h-fit">

                            {/* Category Section */}
                            <div className="grid grid-cols-2 py-4 border-b border-gray-100">
                                <div className="t">
                                    <p className=" font-bold text-sm mb-1">التصنيف الرئيسي</p>
                                    <p className="text-gray-2 text-sm">{service.section?.name || "-"}</p>
                                </div>
                                <div className="">
                                    <p className=" font-bold text-sm mb-1">التصنيف الفرعي</p>
                                    <p className="text-gray-2 text-sm">{service.category?.name || "-"}</p>
                                </div>
                            </div>

                            {/* Price & Delivery Section */}
                            <div className="grid grid-cols-2 py-4 border-b border-gray-100">
                                <div className="t">
                                    <p className=" font-bold text-sm mb-1">سعر الخدمة</p>
                                    <p className="text-gray-2 text-sm font-medium">₪  {service.price}</p>
                                </div>
                                <div className="">
                                    <p className=" font-bold text-sm mb-1">التسليم خلال</p>
                                    <p className="text-gray-2 text-sm">{service.execute_count} {service.execute_type}</p>
                                </div>
                            </div>

                            {/* Cities Section */}
                            <div className="py-4 border-b border-gray-100">
                                <p className=" font-bold text-sm mb-3">المدن التي يمكنه العمل بها</p>
                                <div className="flex flex-wrap gap-2">
                                    {store?.serviceCities && store.serviceCities.length > 0 ? (
                                        store.serviceCities.map((city) => (
                                            <span key={city.id} className="px-3 py-1 bg-[#F0F4F8] text-[#3A5779] text-xs rounded-full font-medium border border-[#E1E8F0]">
                                                {city.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-2">لا توجد مدن محددة</span>
                                    )}
                                </div>
                            </div>

                            {/* Keywords Section */}
                            <div className="py-4 mb-4">
                                <p className=" font-bold text-sm mb-2">الكلمات المفتاحية</p>
                                <div className="flex flex-wrap gap-1">
                                    {service.tags && service.tags.length > 0 ? (
                                        service.tags.map((tag: string | { id: number; title: string }, idx: number) => (
                                            <span key={idx} className="text-gray-2 text-xs leading-relaxed bg-gray-50 px-2 py-1 rounded">
                                                {typeof tag === 'object' ? tag.title : tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-2 text-xs">لا توجد كلمات مفتاحية</span>
                                    )}
                                </div>
                            </div>

                            {/* Contact Buttons */}
                            <div className="flex flex-col gap-3">
                                <Button className="w-full bg-[#3A5779] hover:bg-[#2c425e] text-white font-bold h-12 rounded-lg gap-2 text-sm ">
                                    <span>{store?.phone || "+972 *** *** ***"}</span>
                                    <Phone className="w-5 h-5 " />
                                </Button>
                                <Button variant="outline" className="w-full border-[#3A5779] text-[#3A5779] bg-transparent font-bold h-12 rounded-lg gap-2 text-sm">
                                    <span>دردشة</span>
                                    <Send className="w-5 h-5 rotate-45" />
                                </Button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            <RejectServiceModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onConfirm={confirmReject}
                isLoading={isUpdating}
                reasonsList={reportTypesData?.data}
                isLoadingReasons={isLoadingReportTypes}
            />

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => {
                    setIsSuccessModalOpen(false);
                    if (service.status === "rejected") {
                        router.push(`/admin/serviceProviders/${storeId}`);
                    }
                }}
                title={successModalTitle}
            />

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/services/${service.slug}`}
                title="شارك هذه الخدمة"
                description="هل أعجبتك هذه الخدمة؟ شاركها الآن مع أصدقائك."
            />
        </div>
    );
}