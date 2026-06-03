// src/features/(dashboard)/services/components/ServiceDetailsPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Phone,
    Send,
    CheckCircle2,
    Pen,
    XCircle,
    PauseCircle,
    Trash2,
    Clock4,
} from "lucide-react";
import { useFollowUser, useUnfollowUser } from "@/src/features/(dashboard)/followings/hooks";
import { useDeleteService, useGetService, useUpdateServiceStatus, useUpdateServiceShown } from "../hooks";
import { formatPrice } from "@/src/lib/format-price";
import { useGetSingleStore } from "../../stores/hooks";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Button } from "@/src/components/ui/button";
import { RejectServiceModal } from "./RejectServiceModal";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";

import { ProviderInfoCard } from "@/src/components/(dashboard)/ProviderInfoCard";
import { ShareModal } from "@/src/components/ui/ShareModal";
import { PreviewStatusAlert } from "@/src/components/(dashboard)/PreviewStatusAlert";
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

const executeTypeLabels: Record<string, string> = {
    min: "دقيقة",
    hour: "ساعة",
    day: "يوم",
    week: "أسبوع",
    month: "شهر",
    year: "سنة",
};

function formatExecuteDuration(count?: string | number, type?: string) {
    if (!count || !type) return "";
    return `${count} ${executeTypeLabels[type] || type}`;
}

export function ServiceDetailsPage({ serviceId, storeId }: ServiceDetailsPageProps) {
    const router = useRouter();
    const routeParams = useParams<{ locale?: string; type?: string }>();
    const queryClient = useQueryClient();

    // --- States ---
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successModalTitle, setSuccessModalTitle] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
    const { mutate: deleteService, isPending: isDeleting } = useDeleteService();

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

    const handleDelete = () => {
        deleteService({ id: serviceId, storeId }, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                router.push(`${dashboardBase}/serviceProviders/${storeId}`);
            },
        });
    };

    const confirmReject = (reasonText: string, details: string) => {
        const fullReason = details ? `${reasonText} - ${details}` : reasonText;
        updateStatus({
            id: serviceId,
            payload: {
                status: "rejected",
                reason: fullReason
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
    const routeStoreId = Number(storeId);
    const serviceStoreId = Number(service.store_id);
    const loadedStoreId = Number(store?.id);
    const isOwner = !isAdmin && isMerchant && (
        currentStoreId === routeStoreId ||
        currentStoreId === serviceStoreId ||
        currentStoreId === loadedStoreId ||
        serviceStoreId === routeStoreId
    );
    const isShown = (service as unknown as { shown?: boolean })?.shown;
    const canManageService = isAdmin || isOwner;
    const showInlineEdit = canManageService && !(isOwner && (currentStatus === "pending" || currentStatus === "rejected"));
    const dashboardBase =
        routeParams?.locale && routeParams?.type
            ? `/${routeParams.locale}/${routeParams.type}`
            : isMerchant
                ? "/merchant"
                : "/admin";

    const breadcrumbItems = [
        { label: "مقدمي الخدمات", href: isMerchant ? undefined : `${dashboardBase}/serviceProviders` },
        { label: store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "تفاصيل المتجر", href: `${dashboardBase}/serviceProviders/${storeId}` },
        { label: service.title, href: `${dashboardBase}/serviceProviders/services/details/${service.id}/${storeId}` },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-[#F7F8FA] pb-10">
            {/* Header Area */}
            <div className="space-y-4">
                <div className="container mx-auto px-4 md:px-0">
                    <Breadcrumb items={breadcrumbItems} className="bg-white px-6" />
                </div>

                {isOwner && (currentStatus === "pending" || currentStatus === "rejected") && (
                    <div className="container mx-auto px-4 md:px-0">
                        <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between" dir="rtl">
                            <div>
                                <p className="text-base font-bold text-gray-900">إدارة الخدمة قبل اعتمادها</p>
                                <p className="mt-1 text-sm text-gray-2">
                                    يمكنك تعديل بيانات الخدمة أو حذفها قبل ظهورها للعملاء.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button
                                    type="button"
                                    onClick={() => router.push(`${dashboardBase}/serviceProviders/services/edit/${serviceId}/${storeId}`)}
                                    className="h-10 rounded bg-blue-5 px-5 font-bold text-blue-4 hover:bg-blue-5/80"
                                >
                                    <Pen className="h-4 w-4" />
                                    تعديل الخدمة
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    disabled={isDeleting}
                                    className="h-10 rounded bg-red-2 px-5 font-bold text-red-1 hover:bg-red-2/80"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {isDeleting ? "جاري الحذف..." : "حذف الخدمة"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Alerts */}
                {isOwner && (
                    <div className="container mx-auto px-4 md:px-0">
                        <PreviewStatusAlert
                            status={isShown === false && currentStatus === "approved" ? "deactivated" : currentStatus}
                            type="service"
                            rejectReason={service.reason ?? undefined}
                            isDismissed={alertDismissed || (isShown === false && currentStatus === "approved" && shownAlertDismissed)}
                            onDismiss={() => {
                                if (isShown === false && currentStatus === "approved") {
                                    setShownAlertDismissed(true);
                                } else {
                                    dismissAlert();
                                }
                            }}
                            className={cn(currentStatus === "pending" || currentStatus === "rejected" ? "mt-4" : "")}
                        />
                    </div>
                )}


                {/* ✅ Action Bar: يظهر للأدمن عندما تكون الحالة pending أو rejected أو approved */}
                {isAdmin && (service.status === "pending" || service.status === "rejected" || service.status === "approved") && (
                    <div className="container mx-auto mt-4 px-4 md:px-0">
                        <div className="px-6 py-4 flex items-center justify-between border border-gray-100 bg-white rounded-2xl shadow-sm">
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
                <div className="grid grid-cols-12 gap-6 items-start">

                    {/* Main Content Area */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 order-2 lg:order-1">
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                            {/* Title & Actions */}
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold  leading-tight max-w-[70%]">
                                    {service.title}
                                </h1>
                                {showInlineEdit && (
                                    <div className="flex gap-4 text-gray-2">
                                        <button className="flex items-center gap-1 text-blue-4 transition-colors cursor-pointer" onClick={() => router.push(`${dashboardBase}/serviceProviders/services/edit/${serviceId}/${storeId}`)}>
                                            <Pen className="w-4 h-4" />
                                            <span className="text-sm font-medium">تعديل الخدمة</span>
                                        </button>
                                    </div>
                                )}
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
                                <div className="grid grid-cols-3 gap-4 mb-8 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                                    {imagesList.map((img, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setActiveImage(img)}
                                            className={cn(
                                                "aspect-[16/9] min-w-0 rounded-lg overflow-hidden border cursor-pointer transition-all duration-200",
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
                                    <ProviderInfoCard store={store} isAdmin={true} isOwner={isOwner} isFollowing={store.owner?.am_i_following} onFollow={handleFollowClick} />
                                </div>
                            )}

                            {/* Service Details Section */}
                            <div className="mt-8">
                                <h2 className="text-xl font-bold mb-6 text-[#1e3a52]">تفاصيل الخدمة</h2>
                                <div className="border-b border-blue-4 bg-[#F7F4FF] py-3 text-center text-sm font-medium text-blue-4 mb-4 rounded-t-sm">
                                    وصف الخدمة
                                </div>
                                <div className="prose prose-sm max-w-none leading-relaxed text-gray-700 px-2">
                                    {service.description ? (
                                        <div dangerouslySetInnerHTML={{ __html: service.description }} />
                                    ) : (
                                        <p>لا يوجد وصف متاح لهذه الخدمة.</p>
                                    )}
                                </div>

                                <div className="mt-10 mb-4 px-2">
                                    <h3 className="text-lg font-bold mb-1 text-[#1e3a52]">الأسئلة الشائعة (اختياري)</h3>
                                    <p className="text-gray-400 text-sm">شاهد إجابات الأسئلة الشائعة</p>
                                </div>

                                <div className="divide-y divide-gray-100 px-2">
                                    {service.questions && service.questions.length > 0 ? (
                                        service.questions.map((q, index) => (
                                            <div key={index} className="py-4">
                                                <button className="flex items-center justify-between w-full text-right group">
                                                    <span className="font-bold text-sm transition-colors text-[#1e3a52]">
                                                        {index + 1}. {q.question}
                                                    </span>
                                                </button>
                                                <div className="overflow-hidden transition-all duration-300 ease-in-out mt-2">
                                                    <p className="text-gray-500 leading-relaxed text-sm">
                                                        {q.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-gray-400 text-sm">لا توجد أسئلة شائعة مضافة</div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>


                    {/* Sidebar Area */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 order-1 lg:order-2 lg:sticky lg:top-6">
                        <div className="bg-white rounded-lg border border-[#DDE5EC] h-fit overflow-hidden shadow-sm">

                            {/* Activate Toggle Row — يظهر فقط للتاجر وفقط إذا كان الخدمه مقبولاً */}
                            {isOwner && currentStatus === "approved" && (
                                <div className="flex items-center justify-between px-4 py-3 rounded-md mx-4 mt-4 bg-[#DCE8F2]">
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
                                            backgroundColor: isShown !== false ? "#34D399" : "#94A3B8",
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

                            <div className="p-4 pt-2" dir="rtl">

                                {/* Service Metadata */}
                                <div className="py-3 border-b border-[#E6ECF2] text-right">
                                    <p className="font-bold text-sm mb-1 text-[#1e3a52]">فئة الخدمة</p>
                                    <p className="text-gray-500 text-xs font-medium leading-5">
                                        {service.category?.name || "-"}
                                    </p>
                                </div>

                                <div className="py-3 border-b border-[#E6ECF2] text-right">
                                    <p className="font-bold text-sm mb-1 text-[#1e3a52]">قسم الخدمة</p>
                                    <p className="text-gray-500 text-xs font-medium leading-5">{service.section?.name || "-"}</p>
                                </div>

                                <div className="py-3 border-b border-[#E6ECF2] text-right">
                                    <p className="font-bold text-sm mb-1 text-[#1e3a52]">سعر الخدمة</p>
                                    <p className="text-gray-500 text-xs font-medium">₪ {formatPrice(service.price)}</p>
                                </div>

                                {/* Cities Section */}
                                <div className="py-3 border-b border-[#E6ECF2] text-right">
                                    <p className="font-bold text-sm mb-2 text-[#1e3a52]">المدن التي يمكنه العمل بها</p>
                                    <div className="flex flex-wrap justify-start gap-1.5">
                                        {store?.serviceCities && store.serviceCities.length > 0 ? (
                                            store.serviceCities.map((city) => (
                                                <span key={city.id} className="px-3 py-1 bg-[#EEF4FA] text-[#3A5779] text-[10px] rounded-full font-medium border border-[#C8D6E4]">
                                                    {city.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-2">لا توجد مدن محددة</span>
                                        )}
                                    </div>
                                </div>

                                <div className="py-3 border-b border-[#E6ECF2] text-right">
                                    <p className="font-bold text-sm mb-2 text-[#1e3a52]">تخصصات أو مجالات العمل</p>
                                    <div className="flex flex-wrap justify-start gap-1.5">
                                        {service.specialties && service.specialties.length > 0 ? (
                                            service.specialties.map((spec: string | { id: number; title: string }, idx: number) => (
                                                <span key={idx} className="text-[#3A5779] text-[10px] leading-relaxed bg-[#EEF4FA] px-3 py-1 rounded-full border border-[#C8D6E4]">
                                                    {typeof spec === "object" ? spec.title : spec}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-2">لا توجد تخصصات محددة</span>
                                        )}
                                    </div>
                                </div>

                                {/* Keywords Section */}
                                <div className="py-3 border-b border-[#E6ECF2] text-right">
                                    <p className="font-bold text-sm mb-2 text-[#1e3a52]">الكلمات المفتاحية</p>
                                    <div className="flex flex-wrap justify-start gap-1.5">
                                        {service.tags && service.tags.length > 0 ? (
                                            service.tags.map((tag: string | { id: number; title: string }, idx: number) => (
                                                <span key={idx} className="text-[#3A5779] text-[10px] leading-relaxed bg-[#EEF4FA] px-3 py-1 rounded-full border border-[#C8D6E4]">
                                                    {typeof tag === "object" ? tag.title : tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-2 text-xs">لا توجد كلمات مفتاحية</span>
                                        )}
                                    </div>
                                </div>

                                {service.extras && service.extras.length > 0 && (
                                    <div className="py-3 border-b border-[#E6ECF2] text-right">
                                        <p className="font-bold text-sm mb-2 text-[#1e3a52]">تطويرات اختيارية</p>
                                        <div className="space-y-2">
                                            {service.extras.map((extra, idx) => (
                                                <div key={`${extra.title}-${idx}`} className="flex items-start justify-start gap-3 rounded-md border border-[#DDE5EC] px-3 py-2 bg-white">
                                                    <span className="h-4 w-4 mt-0.5 rounded-sm border border-gray-300 shrink-0" aria-hidden="true" />
                                                    <div className="min-w-0 text-right flex-1">
                                                        <p className="text-xs font-medium text-gray-900 line-clamp-1">{extra.title}</p>
                                                        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                                                            <span>₪ {formatPrice(extra.price)}</span>
                                                            {formatExecuteDuration(extra.execute_count, extra.execute_type) && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock4 className="w-3 h-3" />
                                                                    {formatExecuteDuration(extra.execute_count, extra.execute_type)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Contact Buttons */}
                                <div className="flex flex-col gap-2.5 mt-4">
                                    {store?.phone && (
                                        <Button className="w-full bg-[#1e3a52] hover:bg-[#152a3b] text-white font-bold h-10 rounded-md flex items-center justify-center gap-2 text-xs shadow-sm">
                                            <Phone className="w-4 h-4 text-white" />
                                            <span dir="ltr">{store?.phone?.replace(/^\+?(\d{3}).*/, "+$1 *** *** ***") || "+972 *** *** ***"}</span>
                                        </Button>
                                    )}
                                    <Link href={`${dashboardBase}/chat?type=store&id=${store?.id}`}>
                                        <Button variant="outline" className="w-full border-[#C9D4DF] text-gray-700 hover:bg-gray-50 bg-white font-bold h-10 rounded-md flex items-center justify-center gap-2 text-xs shadow-sm">
                                            <span>دردشة</span>
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>

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
            />

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => {
                    setIsSuccessModalOpen(false);
                    if (service.status === "rejected") {
                        router.push(`${dashboardBase}/serviceProviders/${storeId}`);
                    }
                }}
                title={successModalTitle}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="هل أنت متأكد من حذف هذه الخدمة؟"
                description="سيتم حذف الخدمة نهائياً. لا يمكن التراجع عن هذا الإجراء."
                confirmText={isDeleting ? "جاري الحذف..." : "نعم، قم بالحذف"}
                cancelText="إلغاء"
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
