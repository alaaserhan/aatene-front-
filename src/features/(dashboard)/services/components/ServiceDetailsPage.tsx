// src/features/(dashboard)/services/components/ServiceDetailsPage.tsx
"use client";

import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { SafeHTML } from "@/src/components/ui/SafeHTML";
import { VideoOrImage } from "@/src/components/ui/VideoOrImage";
import { Button } from "@/src/components/ui/button";
import { useFollowUser, useUnfollowUser } from "@/src/features/(dashboard)/followings/hooks";
import { formatPrice } from "@/src/lib/format-price";
import {
  Clock4,
  Pen,
  Phone,
  Send,
  Trash2
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGetSingleStore } from "../../stores/hooks";
import { useDeleteService, useGetService, useUpdateServiceShown, useUpdateServiceStatus } from "../hooks";
import { RejectServiceModal } from "./RejectServiceModal";

import { PreviewStatusAlert } from "@/src/components/(dashboard)/PreviewStatusAlert";
import { ProviderInfoCard } from "@/src/components/(dashboard)/ProviderInfoCard";
import { ShareModal } from "@/src/components/ui/ShareModal";
import { Badge } from "@/src/components/ui/badge";
import { Switch } from "@/src/components/ui/switch";
import { cn } from "@/src/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie"; // ✅ للتحقق من الصلاحيات
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
    // بعد قبول/رفض خدمة كانت "قيد المراجعة" → نُوجّه الأدمن لتبويب قيد المراجعة
    const [redirectToReviewList, setRedirectToReviewList] = useState(false);
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
        const wasInReview = serviceData?.data?.status === "pending";
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
                if (wasInReview) setRedirectToReviewList(true);
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
        const wasInReview = serviceData?.data?.status === "pending";
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
                if (wasInReview) setRedirectToReviewList(true);
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
                <Breadcrumb items={breadcrumbItems} withContainer className="mb-0"/>

                {isOwner && (currentStatus === "pending" || currentStatus === "rejected") && (
                    <div className="">
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
                    <div className="px-4 md:px-0">
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
                            className={"mt-6"}
                        />
                    </div>
                )}


                {/* ✅ Action Bar: يظهر للأدمن عندما تكون الحالة pending أو rejected أو approved */}
                {isAdmin && (service.status === "pending" || service.status === "rejected" || service.status === "approved") && (
                    <div className="mt-4 px-4 md:px-0">
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

            <div className="px-4 md:px-0 mt-6">
                <div className="grid grid-cols-12 gap-6 items-start">

                    {/* Main Content Area */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 order-2 lg:order-1">
                        <div className="bg-white rounded-2xl p-4 lg:p-7 border border-[#CCCED7] shadow-sm">
                            {/* Title & Actions */}
                            <div className="flex justify-between items-center mb-8">
                                <h1 className="text-2xl font-bold  leading-tight max-w-[70%]">
                                    {service.title}
                                </h1>
                                {showInlineEdit && (
                                      <button className="flex items-center gap-2 text-blue-3 transition-colors cursor-pointer" onClick={() => router.push(`${dashboardBase}/serviceProviders/services/edit/${serviceId}/${storeId}`)}>
                                            <Pen className="w-4 h-4" />
                                            <span className="text-sm font-medium">تعديل الخدمة</span>
                                      </button>
                                )}
                            </div>

                            {/* Main Image Display */}
                            <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 border border-gray-100 bg-gray-50 relative group">
                                <VideoOrImage
                                    src={displayImage}
                                    alt={service.title}
                                    fill
                                    thumb={false}
                                    className="object-contain transition-opacity duration-300"
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
                                            <div className="relative w-full h-full pointer-events-none">
                                                <VideoOrImage
                                                    src={img}
                                                    alt={`thumb-${idx}`}
                                                    fill
                                                    thumb
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {store && (
                                <div className="mb-6">
                                    <ProviderInfoCard store={store} isAdmin={true} isOwner={isOwner} isFollowing={store.owner?.am_i_following} onFollow={handleFollowClick} />
                                </div>
                            )}

                            {/* Service Details Section */}
                            <div className="mt-8">
                                <h2 className="text-xl font-bold mb-6 text-blue-7">تفاصيل الخدمة</h2>
                                <div className="border-b border-blue-4 bg-[#F7F4FF] py-3 text-center text-sm font-medium text-blue-4 mb-4 rounded-t-sm">
                                    وصف الخدمة
                                </div>
                                <div className="prose prose-sm max-w-none leading-relaxed text-gray-700 px-2">
                                    {service.description ? (
                                        <SafeHTML html={service.description} />
                                    ) : (
                                        <p>لا يوجد وصف متاح لهذه الخدمة.</p>
                                    )}
                                </div>

                                <div className="mt-10 mb-4 px-2">
                                    <h3 className="text-lg font-bold mb-1 text-blue-7">الأسئلة الشائعة</h3>
                                    <p className={cn("text-gray-400 text-sm", { hidden: service.questions?.length === 0 })}>شاهد إجابات الأسئلة الشائعة</p>
                                </div>

                                <div className="divide-y divide-gray-100 px-2">
                                    {service.questions && service.questions.length > 0 ? (
                                        service.questions.map((q, index) => (
                                            <div key={index} className="py-4">
                                                <button className="flex items-center justify-between w-full text-right group">
                                                    <span className="font-bold text-sm transition-colors text-blue-7">
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
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 order-1 lg:order-2 lg:sticky lg:top-22">
                        <div className="bg-white p-4 lg:p-7 rounded-lg border border-[#CCCED7] h-fit overflow-hidden shadow-sm">

                            {/* Activate Toggle Row — يظهر فقط للتاجر وفقط إذا كان الخدمه مقبولاً */}
                            {isOwner && currentStatus === "approved" && (
                                <div className="flex items-center justify-between px-4 py-3 rounded-md bg-[#DCE8F2]">
                                    <span className="font-bold text-xl text-blue-7">تفعيل الخدمة</span>
                                    <Switch
                                        checked={isShown}
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
                                    />
                                </div>
                            )}

                            <div className="mt-2" dir="rtl">

                                {/* Service Metadata */}
                                <div className="py-3 border-b border-[#CCCED7] text-right">
                                    <p className="font-bold text-lg mb-3 text-blue-7">فئة الخدمة</p>
                                    <p className="text-gray-7 text-base leading-5">
                                        {service.category?.name || "-"}
                                    </p>
                                </div>

                                <div className="py-3 border-b border-[#CCCED7] text-right">
                                    <p className="font-bold text-lg mb-3 text-blue-7">قسم الخدمة</p>
                                    <p className="text-gray-7 text-base leading-5">{service.section?.name || "-"}</p>
                                </div>

                                <div className="py-3 border-b border-[#CCCED7] text-right">
                                    <p className="font-bold text-lg mb-3 text-blue-7">سعر الخدمة</p>
                                    <p className="text-gray-7 text-base">₪ {formatPrice(service.price)}</p>
                                </div>

                                {/* Cities Section */}
                                <div className="py-3 border-b border-[#CCCED7] text-right">
                                    <p className="font-bold text-lg mb-3 text-blue-7">المدن التي يمكنه العمل بها</p>
                                    <div className="flex flex-wrap justify-start gap-1.5">
                                        {store?.serviceCities && store.serviceCities.length > 0 ? (
                                            store.serviceCities.map((city) => (
                                                <Badge key={city.id} variant="secondary-outline">
                                                    {city.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-2">لا توجد مدن محددة</span>
                                        )}
                                    </div>
                                </div>

                                <div className="py-3 border-b border-[#CCCED7] text-right">
                                    <p className="font-bold text-lg mb-3 text-blue-7">تخصصات أو مجالات العمل</p>
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
                                <div className="py-3 border-b border-[#CCCED7] text-right">
                                    <p className="font-bold text-lg mb-3 text-blue-7">الكلمات المفتاحية</p>
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
                                    <div className="py-3 border-b border-[#CCCED7] text-right">
                                        <p className="font-bold text-lg mb-3 text-blue-7">تطويرات اختيارية</p>
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
                                <div className="flex flex-col gap-4 mt-4">
                                    {store?.phone && (
                                        <Button className="w-full bg-blue-3 hover:bg-[#152a3b] text-white font-bold h-13 rounded-md flex items-center justify-center gap-2 text-base shadow-sm">
                                            <span className="pt-1" dir="ltr">{store?.phone?.replace(/^\+?(\d{3}).*/, "+$1 *** *** ***") || "+972 *** *** ***"}</span>
                                            <Phone className="size-5 text-white" />
                                        </Button>
                                    )}
                                    <Link href={`${dashboardBase}/chat?type=store&id=${store?.id}`}>
                                        {/* TODO: no need for the nested button */}
                                        <Button variant="outline" className="w-full border-[#C9D4DF] text-gray-700 hover:bg-gray-50 bg-white font-bold h-13 rounded-md flex items-center justify-center gap-2 text-base shadow-sm">
                                            <span>دردشة</span>
                                            <Send className="size-5" />
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
                    if (redirectToReviewList) {
                        setRedirectToReviewList(false);
                        router.push(`${dashboardBase}/serviceProviders?status=pending`);
                    } else if (service.status === "rejected") {
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
