"use client";

import { useRef, useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Pen, Phone, Send, Share2, CheckCircle2, XCircle, PauseCircle } from "lucide-react";
import Cookies from "js-cookie";
import { useGetSingleProduct, useUpdateProductStatus, useUpdateProductShown } from "../hooks";
import { useGetSingleStore } from "@/src/features/(dashboard)/stores/hooks";
import { useGetProductReviews, useGetProductReviewReplies, useAddProductReview } from "@/src/features/(web)/product/hooks";
import { ReviewStatisticsDisplay } from "@/src/features/(web)/product/components/ReviewStatisticsDisplay";
import { ReviewForm, ReviewFormRef } from "@/src/components/(web)/ReviewForm";
import { ReviewItem, SharedReview } from "@/src/components/(web)/ReviewItem";
import { MediaViewer } from "@/src/components/ui/MediaViewer";
import { RejectProductModal } from "./RejectProductModal";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { ProviderInfoCard } from "@/src/components/(dashboard)/ProviderInfoCard";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { ShareModal } from "@/src/components/ui/ShareModal";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export default function ProductViewPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params?.id as string;
    const isAdmin = Cookies.get("user_type") === "admin";
    const fromUrl = searchParams.get("from");

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successModalTitle, setSuccessModalTitle] = useState("");
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");

    // Alert: يظهر دائماً بناءً على الـ status الحالي — لا يُخزَّن في localStorage
    const [alertDismissed, setAlertDismissed] = useState(false);

    const dismissAlert = () => {
        setAlertDismissed(true);
    };

    // Alert تعليق مؤقت: يظهر عند إيقاف التفعيل (shown=false) ويُغلق يدوياً
    const [shownAlertDismissed, setShownAlertDismissed] = useState(false);

    const { data: dashboardData, isLoading, isError, refetch } = useGetSingleProduct(id, {
        enabled: !!id,
        staleTime: 0,
        refetchOnWindowFocus: true,
    });

    // عند تغيّر الـ status (مثلاً أُعيد قبوله بعد رفضه) → أعِد إظهار الـ alert
    useEffect(() => {
        const status = dashboardData?.data?.status;
        if (status) {
            setAlertDismissed(false);
            setShownAlertDismissed(false);
        }
    }, [dashboardData?.data?.status]);

    const storeId = dashboardData?.data?.store_id;
    const { data: storeData } = useGetSingleStore(storeId, { enabled: !!storeId });
    const store = storeData?.record;

    const { mutate: updateStatus, isPending: isUpdating } = useUpdateProductStatus();
    const { mutate: updateShown, isPending: isUpdatingShown } = useUpdateProductShown();

    const handleApprove = () => {
        updateStatus(
            { id: Number(id), payload: { status: "active" } },
            {
                onSuccess: () => {
                    setSuccessModalTitle("تمت الموافقة على المنتج بنجاح");
                    setIsSuccessModalOpen(true);
                    refetch();
                },
            }
        );
    };

    const confirmReject = (reasonText: string, details: string) => {
        const fullReason = details ? `${reasonText} - ${details}` : reasonText;
        updateStatus(
            { id: Number(id), payload: { status: "rejected", reject_reason: fullReason } },
            {
                onSuccess: () => {
                    setIsRejectModalOpen(false);
                    setSuccessModalTitle("تم رفض المنتج بنجاح");
                    setIsSuccessModalOpen(true);
                    refetch();
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
            </div>
        );
    }

    if (isError || !dashboardData?.data) {
        return (
            <div className="flex h-screen items-center justify-center" dir="rtl">
                <p className="text-gray-500">المنتج غير موجود</p>
            </div>
        );
    }

    const raw = dashboardData.data;
    const currentStatus = raw.status;

    // gallery_url قد يأتي كـ object من الباك اند — نحوّله لـ array بأمان
    const galleryUrls: string[] = raw.gallery_url
        ? (Array.isArray(raw.gallery_url)
            ? raw.gallery_url
            : Object.values(raw.gallery_url as Record<string, string>)
          ).filter((u): u is string => !!u && typeof u === "string")
        : [];

    const imagesList: string[] = [
        ...(raw.cover_url ? [raw.cover_url] : raw.cover ? [raw.cover] : []),
        ...galleryUrls,
    ].filter(Boolean) as string[];

    const displayImage = activeImage || imagesList[0] || "/placeholder.png";

    const conditionLabel: Record<string, string> = {
        new: "جديد",
        used: "مستعمل",
        refurbished: "مجدد",
    };

    const breadcrumbItems = [
        { label: "المنتجات", href: fromUrl ? decodeURIComponent(fromUrl) : (isAdmin ? "/admin/products" : "/dashboard/products") },
        { label: raw.name },
    ];

    return (
        <div className="flex flex-col pb-10" dir="rtl">

            {/* ── Header & Breadcrumb ── */}
            <div>
                <Breadcrumb items={breadcrumbItems} className="bg-white px-6" />

                {/* ── Status Alert (للتاجر فقط وليس الأدمن) ── */}

                {/* ✅ تم قبول المنتج */}
                {!isAdmin && !alertDismissed && currentStatus === "active" && (
                    <div className="container mx-auto mt-4 px-4 md:px-0">
                        <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-[#66FF99]/60 bg-[#E6FFF1] relative" dir="rtl">
                            <CheckCircle2 className="w-5 h-5 text-[#00A846] mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="font-bold text-[#006B2E] text-sm">تم قبول منتجك بنجاح</p>
                                <p className="text-[#008A3A] text-sm mt-1 leading-relaxed">
                                    نحيطك علمًا بأنه تم قبول عرض منتجك على الموقع، وهو الآن متاح للزوار ويمكن للعملاء طلبه في أي وقت.
                                </p>
                            </div>
                            <button onClick={dismissAlert} className="text-[#00A846] hover:text-[#006B2E] transition-colors shrink-0 mt-0.5">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ❌ تم رفض المنتج */}
                {!isAdmin && !alertDismissed && currentStatus === "rejected" && (
                    <div className="container mx-auto mt-4 px-4 md:px-0">
                        <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-[#FF9999]/60 bg-[#FFF0F0] relative" dir="rtl">
                            <XCircle className="w-5 h-5 text-[#D00739] mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="font-bold text-[#D00739] text-sm">تم رفض منتجك</p>
                                <p className="text-[#A00028] text-sm mt-1 leading-relaxed">
                                    نعتذر، لم يتم قبول عرض منتجك في الوقت الحالي، وذلك لعدم استيفائه متطلبات النشر على المنصة. يرجى مراجعة الإرشادات وإجراء التعديلات اللازمة، ثم إعادة الإرسال.
                                </p>
                            </div>
                            <button onClick={dismissAlert} className="text-[#D00739] hover:text-[#A00028] transition-colors shrink-0 mt-0.5">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* 🕐 المنتج قيد المراجعة */}
                {!isAdmin && !alertDismissed && currentStatus === "not-active" && (
                    <div className="container mx-auto mt-4 px-4 md:px-0">
                        <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-[#FFD87D]/60 bg-[#FFFBF0] relative" dir="rtl">
                            <PauseCircle className="w-5 h-5 text-[#C48A00] mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="font-bold text-[#8A6000] text-sm">منتجك قيد المراجعة من قبل فريق أعطيني</p>
                                <p className="text-[#6B4A00] text-sm mt-1 leading-relaxed">
                                    سيتم نشر المنتج بعد الانتهاء من مراجعته واعتماده من قبل الإدارة.
                                </p>
                            </div>
                            <button onClick={dismissAlert} className="text-[#C48A00] hover:text-[#8A6000] transition-colors shrink-0 mt-0.5">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ⏸ إلغاء تفعيل مؤقت من التاجر */}
                {!isAdmin && !raw.shown && !shownAlertDismissed && currentStatus === "active" && (
                    <div className="container mx-auto mt-4 px-4 md:px-0">
                        <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-[#6D6D6D]/30 bg-[#F5F5F5] relative" dir="rtl">
                            <PauseCircle className="w-5 h-5 text-[#6D6D6D] mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="font-bold text-[#3D3D3D] text-sm">لقد قمت بإلغاء تفعيل المنتج مؤقتاً</p>
                                <p className="text-[#555555] text-sm mt-1 leading-relaxed">
                                    تم تعليق منتجك بشكل مؤقت من قبلك، وهو حالياً غير متاح للطلب حتى يتم تفعيله مجددًا. يمكنك إعادة تفعيل المنتج في أي وقت من خلال لوحة التحكم.
                                </p>
                            </div>
                            <button onClick={() => setShownAlertDismissed(true)} className="text-[#6D6D6D] hover:text-[#3D3D3D] transition-colors shrink-0 mt-0.5">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Action Bar (Admin Only) ── */}
                {isAdmin && (currentStatus === "not-active" || currentStatus === "rejected" || currentStatus === "active") && (
                    <div className="container mx-auto mt-4 px-4 md:px-0">
                        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-100 bg-white rounded-lg">
                            <h2 className="text-lg font-bold">اختر الإجراء المناسب للمنتج</h2>
                            <div className="flex gap-3">
                                {currentStatus !== "active" && (
                                    <Button
                                        onClick={handleApprove}
                                        disabled={isUpdating}
                                        className="bg-[#34D399] hover:bg-[#2cb683] text-white px-8 h-10 font-bold rounded"
                                    >
                                        {isUpdating ? "جاري التحديث..." : currentStatus === "rejected" ? "قبول المنتج مرة أخرى" : "قبول المنتج"}
                                    </Button>
                                )}
                                {currentStatus !== "rejected" && (
                                    <Button
                                        onClick={() => setIsRejectModalOpen(true)}
                                        disabled={isUpdating}
                                        className="bg-[#EF4444] hover:bg-[#d93838] text-white px-8 h-10 font-bold rounded"
                                    >
                                        رفض المنتج
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Main Content ── */}
            <div className="container mx-auto px-4 md:px-0 mt-6">
                <div className="grid grid-cols-12 gap-6">

                    {/* Main Content Area */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 order-2 lg:order-1">
                        <div className="bg-white rounded-2xl p-4 border border-gray-100">

                            {/* Title & Actions */}
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold leading-tight max-w-[70%]">
                                    {raw.name}
                                </h1>
                                <div className="flex gap-4 text-gray-2">
                                    <button
                                        onClick={() => setIsShareModalOpen(true)}
                                        className="flex items-center gap-1 text-blue-4 transition-colors cursor-pointer hover:text-blue-600"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span className="text-sm font-medium">مشاركة المنتج</span>
                                    </button>
                                    <button
                                        onClick={() => router.push(`/admin/products/${id}/edit`)}
                                        className="flex items-center gap-1 text-blue-4 transition-colors cursor-pointer hover:text-blue-600"
                                    >
                                        <Pen className="w-4 h-4" />
                                        <span className="text-sm font-medium">تعديل المنتج</span>
                                    </button>
                                </div>
                            </div>

                            {/* Main Image */}
                            <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 border border-gray-100 bg-gray-50">
                                <img
                                    src={displayImage}
                                    alt={raw.name}
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                />
                            </div>

                            {/* Thumbnails */}
                            {imagesList.length > 1 && (
                                <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 flex-row-reverse" dir="ltr">
                                    {imagesList.map((img, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setActiveImage(img)}
                                            className={cn(
                                                "w-20 h-16 rounded-lg overflow-hidden border shrink-0 cursor-pointer transition-all duration-200",
                                                (activeImage || imagesList[0]) === img
                                                    ? "border-blue-500 ring-2 ring-blue-100 opacity-100"
                                                    : "border-gray-200 opacity-70 hover:opacity-100 hover:border-blue-300"
                                            )}
                                        >
                                            <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Provider Info Card */}
                            {store && (
                                <div className="mb-6">
                                    <ProviderInfoCard
                                        store={store}
                                        isOwner={!isAdmin && !!storeId && String(storeId) === Cookies.get("current_store_id")}
                                    />
                                </div>
                            )}

                            {/* Tabs: وصف المنتج / التقييمات */}
                            <div className="mt-4 overflow-hidden">
                                <div className="flex items-center border-b border-gray-200">
                                    <button
                                        onClick={() => setActiveTab("description")}
                                        className={`flex-1 py-4 cursor-pointer text-center font-medium text-sm transition-all duration-300 relative ${
                                            activeTab === "description"
                                                ? "text-blue-3 bg-[#F8F7FF]"
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        وصف المنتج
                                        {activeTab === "description" && (
                                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("reviews")}
                                        className={`flex-1 py-4 cursor-pointer text-center font-medium text-sm transition-all duration-300 relative ${
                                            activeTab === "reviews"
                                                ? "text-blue-3 bg-[#F8F7FF]"
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        تقييمات ومراجعات
                                        {activeTab === "reviews" && (
                                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-4" />
                                        )}
                                    </button>
                                </div>

                                <div className="p-3 md:p-4 min-h-[300px]">
                                    {activeTab === "description" && (
                                        <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
                                            {raw.short_description && (
                                                <div>
                                                    <h3 className="text-xl font-bold mb-4">الوصف المختصر</h3>
                                                    <p className="text-gray-2 leading-relaxed whitespace-pre-line text-sm">{raw.short_description}</p>
                                                </div>
                                            )}
                                            {raw.description && (
                                                <div
                                                    className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-sans"
                                                    dangerouslySetInnerHTML={{ __html: raw.description }}
                                                />
                                            )}
                                            {!raw.short_description && !raw.description && (
                                                <p className="text-gray-2 text-sm">لا يوجد وصف للمنتج</p>
                                            )}
                                        </div>
                                    )}
                                    {activeTab === "reviews" && (
                                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                            <ProductReviewsSection
                                                slug={raw.slug || String(raw.id)}
                                                summary={{
                                                    count: Number(raw.review_count) || 0,
                                                    rate: Number(raw.review_rate) || 0,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 order-1 lg:order-2">
                        <div className="bg-white rounded-2xl border border-gray-100 h-fit overflow-hidden">

                            {/* Activate Toggle Row — يظهر فقط للتاجر وفقط إذا كان المنتج مقبولاً */}
                            {!isAdmin && currentStatus === "active" && (
                            <div className="flex items-center justify-between px-5 py-3 rounded-md mx-4 mt-4 bg-[#C8D7E8]">
                                <span className="font-bold text-sm text-[#1e3a52]">تفعيل المنتج</span>
                                <button
                                    onClick={() => {
                                        const newShown = !raw.shown;
                                        updateShown(
                                            { id: Number(id), payload: { shown: newShown } },
                                            {
                                                onSuccess: () => {
                                                    refetch();
                                                    // إذا تم إيقاف التفعيل، أظهر alert التعليق المؤقت
                                                    if (!newShown) setShownAlertDismissed(false);
                                                }
                                            }
                                        );
                                    }}
                                    disabled={isUpdatingShown}
                                    role="switch"
                                    aria-checked={raw.shown}
                                    style={{
                                        width: 44,
                                        height: 24,
                                        borderRadius: 9999,
                                        backgroundColor: raw.shown ? "#34D399" : "#6B7280",
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
                                            left: raw.shown ? 24 : 4,
                                        }}
                                    />
                                </button>
                            </div>
                            )}

                            <div className="p-6">
                            {/* Category */}
                            <div className="grid grid-cols-2 py-4 border-b border-gray-100">
                                <div>
                                    <p className="font-bold text-sm mb-1">التصنيف الرئيسي</p>
                                    <p className="text-gray-2 text-sm">{raw.section?.name || "-"}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-sm mb-1">التصنيف الفرعي</p>
                                    <p className="text-gray-2 text-sm">{raw.category?.name || "-"}</p>
                                </div>
                            </div>

                            {/* Price & Condition */}
                            <div className="grid grid-cols-2 py-4 border-b border-gray-100">
                                <div>
                                    <p className="font-bold text-sm mb-1">سعر المنتج</p>
                                    <p className="text-gray-2 text-sm font-medium">₪ {raw.price}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-sm mb-1">حالة المنتج</p>
                                    <p className="text-gray-2 text-sm">{conditionLabel[raw.condition ?? ""] || raw.condition || "-"}</p>
                                </div>
                            </div>

                            {/* SKU */}
                            {raw.sku && (
                                <div className="py-4 border-b border-gray-100">
                                    <p className="font-bold text-sm mb-1">رمز المنتج (SKU)</p>
                                    <p className="text-gray-2 text-sm font-mono">{raw.sku}</p>
                                </div>
                            )}

                            {/* Cities */}
                            <div className="py-4 border-b border-gray-100">
                                <p className="font-bold text-sm mb-3">المدن التي يمكنه التوصيل إليها</p>
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

                            {/* Tags / Keywords */}
                            <div className="py-4 mb-4">
                                <p className="font-bold text-sm mb-2">الكلمات المفتاحية</p>
                                <div className="flex flex-wrap gap-1">
                                    {raw.tags && raw.tags.length > 0 ? (
                                        raw.tags.map((tag: string, idx: number) => (
                                            <span key={idx} className="text-gray-2 text-xs leading-relaxed bg-gray-50 px-2 py-1 rounded">
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-2 text-xs">لا توجد كلمات مفتاحية</span>
                                    )}
                                </div>
                            </div>

                            {/* Contact Buttons */}
                            <div className="flex flex-col gap-3">
                                <Button className="w-full bg-[#3A5779] hover:bg-[#2c425e] text-white font-bold h-12 rounded-lg gap-2 text-sm">
                                    <span>{store?.phone || "+972 *** *** ***"}</span>
                                    <Phone className="w-5 h-5" />
                                </Button>
                                <Button variant="outline" className="w-full border-[#3A5779] text-[#3A5779] bg-transparent font-bold h-12 rounded-lg gap-2 text-sm">
                                    <span>دردشة</span>
                                    <Send className="w-5 h-5 rotate-45" />
                                </Button>
                            </div>

                            </div>{/* end p-6 */}
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Modals ── */}
            <RejectProductModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onConfirm={confirmReject}
                isLoading={isUpdating}
            />
            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title={successModalTitle}
                buttonText="تم"
                onButtonClick={() => setIsSuccessModalOpen(false)}
            />
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                shareUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/product/${raw?.slug || id}`}
                title="شارك هذا المنتج"
                description="هل أعجبك هذا المنتج؟ شاركه الآن مع أصدقائك."
            />
        </div>
    );
}

// ── Reviews Section ──────────────────────────────────────────────────
function ProductReviewsSection({ slug, summary }: { slug: string; summary: { count: number; rate: number } }) {
    const formRef = useRef<ReviewFormRef>(null);
    const [parentId, setParentId] = useState<number | null>(null);
    const [replyToName, setReplyToName] = useState<string | null>(null);
    const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
    const [mediaViewerState, setMediaViewerState] = useState<{ isOpen: boolean; media: string[]; index: number }>({
        isOpen: false, media: [], index: 0,
    });

    const { data, isLoading } = useGetProductReviews(slug);
    const { mutate: addReview, isPending } = useAddProductReview();

    const handleReply = (id: number, userName: string) => {
        setParentId(id);
        setReplyToName(userName);
        formRef.current?.scrollToForm();
        formRef.current?.focusTextarea();
    };

    const handleSubmit = (formData: { content: string; rate: number; images: File[]; parent_id?: number | null }) => {
        return new Promise<void>((resolve, reject) => {
            addReview(
                { slug, payload: { content: formData.content, rate: String(formData.rate), images: formData.images, parent_id: formData.parent_id } },
                {
                    onSuccess: () => {
                        setParentId(null);
                        setReplyToName(null);
                        if (formData.parent_id) setExpandedReplies((prev) => new Set(prev).add(formData.parent_id!));
                        resolve();
                    },
                    onError: () => reject(),
                }
            );
        });
    };

    const handleToggleReplies = (reviewId: number) => {
        setExpandedReplies((prev) => {
            const next = new Set(prev);
            next.has(reviewId) ? next.delete(reviewId) : next.add(reviewId);
            return next;
        });
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-3" /></div>;

    const reviews = data?.reviews || [];
    const statistics = data?.rate_stats
        ? { total_reviews: data.total || 0, average_rate: Number(data.avg_rate) || 0, stars: data.rate_stats }
        : summary.count > 0
            ? { total_reviews: summary.count, average_rate: summary.rate, stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
            : undefined;

    return (
        <div className="space-y-6">
            {statistics && <ReviewStatisticsDisplay stats={statistics} />}

            {reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review) => {
                        const showReplies = expandedReplies.has(review.id);
                        return (
                            <ReviewItemWithReplies
                                key={review.id}
                                review={review as unknown as SharedReview}
                                slug={slug}
                                onOpenMedia={(media, index) => setMediaViewerState({ isOpen: true, media, index })}
                                onReply={handleReply}
                                showReplies={showReplies}
                                onToggleReplies={handleToggleReplies}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-2">لا توجد مراجعات بعد</p>
                </div>
            )}

            {mediaViewerState.isOpen && (
                <MediaViewer
                    isOpen={mediaViewerState.isOpen}
                    onClose={() => setMediaViewerState((prev) => ({ ...prev, isOpen: false }))}
                    media={mediaViewerState.media}
                    initialIndex={mediaViewerState.index}
                />
            )}

            <ReviewForm
                ref={formRef}
                onSubmit={handleSubmit}
                isSubmitting={isPending}
                parentId={parentId}
                replyToName={replyToName}
                onCancelReply={() => { setParentId(null); setReplyToName(null); }}
            />
        </div>
    );
}

function ReviewItemWithReplies({ review, slug, onOpenMedia, onReply, showReplies, onToggleReplies }: {
    review: SharedReview;
    slug: string;
    onOpenMedia: (media: string[], index: number) => void;
    onReply: (id: number, userName: string) => void;
    showReplies: boolean;
    onToggleReplies: (id: number) => void;
}) {
    const { data: repliesData, isLoading: isLoadingReplies } = useGetProductReviewReplies(slug, showReplies ? review.id : 0);
    const replies = (repliesData?.reviews || []) as unknown as SharedReview[];

    return (
        <ReviewItem
            review={review}
            onOpenMedia={onOpenMedia}
            reportType="comment"
            onReply={onReply}
            showReplies={showReplies}
            onToggleReplies={onToggleReplies}
            replies={replies}
            isLoadingReplies={isLoadingReplies && showReplies}
        />
    );
}


