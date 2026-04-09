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
    XCircle,
    PauseCircle,
} from "lucide-react";
import { useFollowUser, useUnfollowUser } from "@/src/features/(dashboard)/followings/hooks";
import { useGetService, useUpdateServiceStatus, useUpdateServiceShown } from "../hooks";
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
import ServiceTabs from "@/src/features/(web)/services/components/ServiceTabs";
import { Service as WebService } from "@/src/features/(web)/services/api";
import Link from "next/link";

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
    const [isMerchant, setIsMerchant] = useState(false); // ✅ حالة التاجر
    const [currentStoreId, setCurrentStoreId] = useState<number | null>(null);

    // التحقق من صلاحية الأدمن عند التحميل
    useEffect(() => {
        const userType = Cookies.get("user_type");
        setIsAdmin(userType === "admin");
        setIsMerchant(userType === "merchant");
        const storeIdCookie = Cookies.get("current_store_id");
        if (storeIdCookie) {
            setCurrentStoreId(Number(storeIdCookie));
        }
    }, []);

    // --- Data Fetching ---
    const { data: serviceData, isLoading } = useGetService(serviceId, storeId);
    const service = serviceData?.data;

    const { data: storeData } = useGetSingleStore(storeId);
    const store = storeData?.record;

    const { mutate: updateStatus, isPending: isUpdating } = useUpdateServiceStatus();
    const { mutate: updateShown, isPending: isUpdatingShown } = useUpdateServiceShown();

    const [alertDismissed, setAlertDismissed] = useState(false);
    const dismissAlert = () => setAlertDismissed(true);
    const [shownAlertDismissed, setShownAlertDismissed] = useState(false);

    useEffect(() => {
        const status = serviceData?.data?.status;
        if (status) {
            setAlertDismissed(false);
            setShownAlertDismissed(false);
        }
    }, [serviceData?.data?.status]);

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

    const { mutate: followUser } = useFollowUser();
    const { mutate: unfollowUser } = useUnfollowUser();

    const handleFollowClick = () => {
        if (!store?.owner?.id) return;
        
        if (store.owner.am_i_following) {
            unfollowUser(
                {
                    payload: { followed_type: "user", followed_id: store.owner.id },
                    storeId: currentStoreId || undefined,
                },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ["singleStore", storeId] });
                    },
                }
            );
        } else {
            followUser(
                {
                    payload: { followed_type: "user", followed_id: store.owner.id },
                    storeId: currentStoreId || undefined,
                },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ["singleStore", storeId] });
                    },
                }
            );
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center">جاري التحميل...</div>;
    if (!service) return <div className="flex h-screen items-center justify-center">الخدمة غير موجودة</div>;

    const currentStatus = service.status;
    const isOwner = !isAdmin && currentStoreId !== null && currentStoreId === store?.id;
    const isShown = (service as unknown as { shown?: boolean })?.shown;

    const breadcrumbItems = [
        { label: "مقدمي الخدمات", href: isMerchant ? undefined : "/admin/serviceProviders" },
        { label: store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "تفاصيل المتجر", href: `/admin/serviceProviders/${storeId}` },
        { label: service.title, href: `/admin/serviceProviders/services/${storeId}/${service.id}` },
    ];

    return (
        <div className="flex flex-col pb-10">
            {/* Header Area */}
            <div>
                {
                    !isMerchant && (
                        <Breadcrumb items={breadcrumbItems} className="bg-white px-6" />
                    )
                }

                {/* ✅ تم قبول الخدمه */}
                {isOwner && !alertDismissed && currentStatus === "approved" && (
                    <div className="container mx-auto mt-4 px-4 md:px-0">
                        <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-[#66FF99]/60 bg-[#E6FFF1] relative" dir="rtl">
                            <CheckCircle2 className="w-5 h-5 text-[#00A846] mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="font-bold text-[#006B2E] text-sm">تم قبول الخدمة بنجاح</p>
                                <p className="text-[#008A3A] text-sm mt-1 leading-relaxed">
                                    نحيطك علمًا بأنه تم قبول عرض الخدمة على الموقع، وهي الآن متاحة للزوار ويمكن للعملاء طلبها في أي وقت.
                                </p>
                            </div>
                            <button onClick={dismissAlert} className="text-[#00A846] hover:text-[#006B2E] transition-colors shrink-0 mt-0.5">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ❌ تم رفض الخدمه */}
                {isOwner && !alertDismissed && currentStatus === "rejected" && (
                    <div className="container mx-auto mt-4 px-4 md:px-0">
                        <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-[#FF9999]/60 bg-[#FFF0F0] relative" dir="rtl">
                            <XCircle className="w-5 h-5 text-[#D00739] mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="font-bold text-[#D00739] text-sm">تم رفض الخدمة</p>
                                <p className="text-[#A00028] text-sm mt-1 leading-relaxed">
                                    نعتذر، لم يتم قبول عرض الخدمة في الوقت الحالي، وذلك لعدم استيفائها متطلبات النشر على المنصة. يرجى مراجعة الإرشادات وإجراء التعديلات اللازمة، ثم إعادة الإرسال.
                                </p>
                            </div>
                            <button onClick={dismissAlert} className="text-[#D00739] hover:text-[#A00028] transition-colors shrink-0 mt-0.5">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* 🕐 الخدمه قيد المراجعة */}
                {isOwner && !alertDismissed && currentStatus === "pending" && (
                    <div className="container mx-auto mt-4 px-4 md:px-0">
                        <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-[#FFD87D]/60 bg-[#FFFBF0] relative" dir="rtl">
                            <PauseCircle className="w-5 h-5 text-[#C48A00] mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="font-bold text-[#8A6000] text-sm">الخدمة قيد المراجعة من قبل فريق أعطيني</p>
                                <p className="text-[#6B4A00] text-sm mt-1 leading-relaxed">
                                    سيتم نشر الخدمة بعد الانتهاء من مراجعتها واعتمادها من قبل الإدارة.
                                </p>
                            </div>
                            <button onClick={dismissAlert} className="text-[#C48A00] hover:text-[#8A6000] transition-colors shrink-0 mt-0.5">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ⏸ إلغاء تفعيل مؤقت من التاجر */}
                {isOwner && isShown === false && !shownAlertDismissed && currentStatus === "approved" && (
                    <div className="container mx-auto mt-4 px-4 md:px-0">
                        <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-[#6D6D6D]/30 bg-[#F5F5F5] relative" dir="rtl">
                            <PauseCircle className="w-5 h-5 text-[#6D6D6D] mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="font-bold text-[#3D3D3D] text-sm">لقد قمت بإلغاء تفعيل الخدمة مؤقتاً</p>
                                <p className="text-[#555555] text-sm mt-1 leading-relaxed">
                                    تم تعليق الخدمة بشكل مؤقت من قبلك، وهي حالياً غير متاحة للطلب حتى يتم تفعيلها مجددًا. يمكنك إعادة تفعيل الخدمة في أي وقت من خلال لوحة التحكم.
                                </p>
                            </div>
                            <button onClick={() => setShownAlertDismissed(true)} className="text-[#6D6D6D] hover:text-[#3D3D3D] transition-colors shrink-0 mt-0.5">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

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

            </div>            <div className="container mx-auto px-4 md:px-0 mt-6">
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
                                    {!isAdmin && (
                                    <button
                                        onClick={() => setIsShareModalOpen(true)}
                                        className="flex items-center gap-1 text-blue-4 transition-colors cursor-pointer hover:text-blue-600"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span className="text-sm font-medium">مشاركة الخدمة</span>
                                    </button>
                                    )}
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
                                    <ProviderInfoCard store={store} isAdmin={true} isFollowing={store.owner?.am_i_following} onFollow={handleFollowClick} />
                                </div>
                            )}

                            <ServiceTabs service={service as unknown as WebService} />

                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 order-1 lg:order-2">
                        <div className="bg-white rounded-2xl border border-gray-100 h-fit overflow-hidden">

                            {/* Activate Toggle Row — يظهر فقط للتاجر وفقط إذا كان الخدمه مقبولاً */}
                            {isOwner && currentStatus === "approved" && (
                                <div className="flex items-center justify-between px-5 py-3 rounded-md mx-4 mt-4 bg-[#C8D7E8]">
                                    <span className="font-bold text-sm text-[#1e3a52]">تفعيل الخدمة</span>
                                    <button
                                        onClick={() => {
                                            const newShown = isShown === false ? true : false;
                                            updateShown(
                                                { id: serviceId, shown: newShown ? 1 : 0, storeId: storeId },
                                                {
                                                    onSuccess: () => {
                                                        queryClient.invalidateQueries({ queryKey: ["services", serviceId] });
                                                        if (!newShown) setShownAlertDismissed(false);
                                                    }
                                                }
                                            );
                                        }}
                                        disabled={isUpdatingShown}
                                        role="switch"
                                        aria-checked={isShown !== false}
                                        style={{
                                            width: 44,
                                            height: 24,
                                            borderRadius: 9999,
                                            backgroundColor: isShown !== false ? "#34D399" : "#6B7280",
                                            position: "relative",
                                            border: "none",
                                            cursor: "pointer",
                                            transition: "background-color 0.2s",
                                            flexShrink: 0,
                                            opacity: isUpdatingShown ? 0.6 : 1,
                                        }}
                                    >
                                        <span
                                            style={{
                                                position: "absolute",
                                                top: 4,
                                                width: 16,
                                                height: 16,
                                                borderRadius: 9999,
                                                backgroundColor: "white",
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                                transition: "left 0.2s",
                                                left: isShown !== false ? 24 : 4,
                                            }}
                                        />
                                    </button>
                                </div>
                            )}

                            <div className="p-6 py-2">

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

                                {/* Specialties Section */}
                                {service.specialties && service.specialties.length > 0 && (
                                    <div className="py-4 border-b border-gray-100">
                                        <p className="font-bold text-sm mb-2">التخصصات ومجالات العمل</p>
                                        <div className="flex flex-wrap gap-1">
                                            {service.specialties.map((spec: string | { id: number; title: string }, idx: number) => (
                                                <span key={idx} className="text-[#395a7d] text-xs leading-relaxed bg-[#eef2f7] px-2 py-1 rounded-full border border-[#d0dcea]">
                                                    {typeof spec === 'object' ? spec.title : spec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Keywords Section */}
                                <div className="py-4">
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
                                {currentStoreId !== store?.id && (
                                    <div className="flex flex-col gap-3 mt-4">
                                        {
                                            store?.phone && (
                                                <Button className="w-full bg-[#3A5779] hover:bg-[#2c425e] text-white font-bold h-12 rounded-lg gap-2 text-sm ">
                                                    <span>{store?.phone}</span>
                                                    <Phone className="w-5 h-5 " />
                                                </Button>
                                            )
                                        }
                                        <Link href={`/admin/chat?type=store&id=${store?.id}`}>
                                            <Button variant="outline" className="w-full border-[#3A5779] text-[#3A5779] bg-transparent font-bold h-12 rounded-lg gap-2 text-sm">
                                                <span>دردشة</span>
                                                <Send className="w-5 h-5 rotate-45" />
                                            </Button>
                                        </Link>
                                    </div>
                                )}

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