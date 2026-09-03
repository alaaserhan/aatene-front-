"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Pen, Phone, Send, CheckCircle2, XCircle, PauseCircle, Trash2 } from "lucide-react";
import Cookies from "js-cookie";
import { useDeleteProduct, useGetSingleProduct, useUpdateProductStatus, useUpdateProductShown } from "../hooks";
import { formatPrice } from "@/src/lib/format-price";
import { useGetSingleStore } from "@/src/features/(dashboard)/stores/hooks";
import { useGetCities } from "@/src/features/(dashboard)/cities/hooks";
import { useGetProductReviews, useGetProductReviewReplies, useAddProductReview } from "@/src/features/(web)/product/hooks";
import { ReviewStatisticsDisplay } from "@/src/features/(web)/product/components/ReviewStatisticsDisplay";
import { ReviewItem, ReviewsSection, type ReviewSubmitPayload, type SharedReview } from "@/src/components/(web)/reviews";
import { MediaViewer } from "@/src/components/ui/MediaViewer";
import { RejectProductModal } from "./RejectProductModal";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { ProviderInfoCard } from "@/src/components/(dashboard)/ProviderInfoCard";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { ShareModal } from "@/src/components/ui/ShareModal";
import { SafeHTML } from "@/src/components/ui/SafeHTML";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import { cn } from "@/src/lib/utils";
import { VideoOrImage } from "@/src/components/ui/VideoOrImage";
import { useQueryClient } from "@tanstack/react-query";
import { useFollowUser, useUnfollowUser } from "@/src/features/(dashboard)/followings/hooks";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { PreviewStatusAlert } from "@/src/components/(dashboard)/PreviewStatusAlert";
import { ChatNowButton } from "@/src/components/shared/ChatNowButton";
import { OfferBundlePreview, type BundleProduct } from "@/src/features/(dashboard)/related-products/components/OfferBundlePreview";

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
    // بعد قبول/رفض منتج كان "قيد المراجعة" → نُوجّه الأدمن لتبويب قيد المراجعة
    const [redirectAfterSuccess, setRedirectAfterSuccess] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

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
    const { data: citiesData } = useGetCities(new URLSearchParams());

    const queryClient = useQueryClient();
    const { mutate: updateStatus, isPending: isUpdating } = useUpdateProductStatus();
    const { mutate: updateShown, isPending: isUpdatingShown } = useUpdateProductShown();
    const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

    const { mutate: followUser } = useFollowUser();
    const { mutate: unfollowUser } = useUnfollowUser();

    const handleFollowClick = () => {
        if (!store?.owner?.id) return;

        if (store.owner.am_i_following) {
            unfollowUser(
                {
                    payload: { followed_type: "user", followed_id: store.owner.id },
                    storeId: Cookies.get("current_store_id") || undefined,
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
                    storeId: Cookies.get("current_store_id") || undefined,
                },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ["singleStore", storeId] });
                    },
                }
            );
        }
    };

    const handleToggleShown = (checked: boolean) => {
        updateShown(
            { id: Number(id), payload: { shown: checked } },
            {
                onSuccess: () => {
                    refetch();
                },
            }
        );
    };

    // إن كان المنتج قيد المراجعة وقت اتخاذ الإجراء → نُوجّه لتبويب "قيد المراجعة" بعد الإغلاق
    const reviewRedirectUrl = "/admin/productProviders?status=pending";

    const handleApprove = () => {
        const wasInReview = dashboardData?.data?.status === "pending";
        updateStatus(
            { id: Number(id), payload: { status: "approved" } },
            {
                onSuccess: () => {
                    setSuccessModalTitle("تمت الموافقة على المنتج بنجاح");
                    setIsSuccessModalOpen(true);
                    if (isAdmin && wasInReview) {
                        setRedirectAfterSuccess(reviewRedirectUrl);
                    } else {
                        refetch();
                    }
                },
            }
        );
    };

    const confirmReject = (reasonText: string, details: string) => {
        const wasInReview = dashboardData?.data?.status === "pending";
        const fullReason = details ? `${reasonText} - ${details}` : reasonText;
        updateStatus(
            { id: Number(id), payload: { status: "rejected", reject_reason: fullReason } },
            {
                onSuccess: () => {
                    setIsRejectModalOpen(false);
                    setSuccessModalTitle("تم رفض المنتج بنجاح");
                    setIsSuccessModalOpen(true);
                    if (isAdmin && wasInReview) {
                        setRedirectAfterSuccess(reviewRedirectUrl);
                    } else {
                        refetch();
                    }
                },
            }
        );
    };

    const handleSuccessModalClose = () => {
        setIsSuccessModalOpen(false);
        if (redirectAfterSuccess) {
            const target = redirectAfterSuccess;
            setRedirectAfterSuccess(null);
            router.push(target);
        }
    };

    const handleDelete = () => {
        deleteProduct(Number(id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                router.push(fromUrl ? decodeURIComponent(fromUrl) : "/admin/products");
            },
        });
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
    const coverUrl = raw.cover_url || raw.cover || null;

    const galleryUrls: string[] = raw.gallery_url
        ? (Array.isArray(raw.gallery_url)
            ? raw.gallery_url
            : Object.values(raw.gallery_url as Record<string, string>)
        ).filter((u): u is string => !!u && typeof u === "string" && u !== coverUrl)
        : [];

    const imagesList: string[] = [
        ...(coverUrl ? [coverUrl] : []),
        ...galleryUrls,
    ].filter(Boolean) as string[];

    const displayImage = activeImage || imagesList[0] || "/placeholder.png";
    const cities = citiesData?.data || [];
    const shippingDeliveryRows = (store?.shippingCompanies || []).flatMap((company) =>
        (company.prices || []).map((price) => {
            const priceRecord = price as typeof price & { city?: { id?: number; name?: string } };
            const cityId = Number(price.city_id);
            const cityName =
                priceRecord.city?.name ||
                cities.find((city) => Number(city.id) === cityId)?.name ||
                (cityId ? `#${cityId}` : "-");

            return {
                key: `${company.id || company.name || "company"}-${price.id || cityId}-${price.price}`,
                cityName,
                price: price.price,
            };
        })
    );

    // The offer bundles the cross-sold products only — the main product is the
    // anchor, so its price stays out of the "before" total.
    const bundleProducts: BundleProduct[] = (raw.crossSells || []).map((crossSell) => ({
        id: crossSell.id,
        name: crossSell.name,
        price: crossSell.price,
        imageUrl: crossSell.cover_url,
    }));
    const bundleOriginalPrice = bundleProducts.reduce(
        (total, product) => total + (Number(product.price) || 0),
        0
    );

    const conditionLabel: Record<string, string> = {
        new: "جديد",
        used: "مستعمل",
    };

    const breadcrumbItems = [
        { label: "المنتجات", href: fromUrl ? decodeURIComponent(fromUrl) : (isAdmin ? "/admin/products" : "/dashboard/products") },
        { label: raw.name },
    ];
    const isOwner = !isAdmin && !!storeId && String(storeId) === Cookies.get("current_store_id");

    return (
        <div className="flex flex-col pb-10" dir="rtl">

            {/* ── Header & Breadcrumb ── */}
            <div>
                <Breadcrumb items={breadcrumbItems} withContainer className="mb-0"/>

                {isOwner && (currentStatus === "pending" || currentStatus === "rejected") && (
                    <div className="container mx-auto mt-4 px-4 md:px-0">
                        <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between" dir="rtl">
                            <div>
                                <p className="text-base font-bold text-gray-900">إدارة المنتج قبل اعتماده</p>
                                <p className="mt-1 text-sm text-gray-2">
                                    يمكنك تعديل بيانات المنتج أو حذفه قبل ظهوره للعملاء.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        const currentViewUrl = `/admin/products/${id}/view${fromUrl ? `?from=${encodeURIComponent(decodeURIComponent(fromUrl))}` : ""}`;
                                        router.push(`/admin/products/${id}/edit?from=${encodeURIComponent(currentViewUrl)}`);
                                    }}
                                    className="h-10 rounded bg-blue-5 px-5 font-bold text-blue-4 hover:bg-blue-5/80"
                                >
                                    <Pen className="h-4 w-4" />
                                    تعديل المنتج
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    disabled={isDeleting}
                                    className="h-10 rounded bg-red-2 px-5 font-bold text-red-1 hover:bg-red-2/80"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {isDeleting ? "جاري الحذف..." : "حذف المنتج"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Status Alert (للتاجر فقط وليس الأدمن) ── */}
                {!isAdmin && (
                    <div className="container mx-auto px-4 md:px-0">
                        <PreviewStatusAlert
                            status={(!raw.shown && currentStatus === "approved" ? "deactivated" : currentStatus) || "pending"}
                            type="product"
                            rejectReason={raw.reject_reason || undefined}
                            isDismissed={alertDismissed || (!raw.shown && currentStatus === "approved" && shownAlertDismissed)}
                            onDismiss={() => {
                                if (!raw.shown && currentStatus === "approved") {
                                    setShownAlertDismissed(true);
                                } else {
                                    dismissAlert();
                                }
                            }}
                            className={cn(currentStatus === "pending" || currentStatus === "rejected" ? "mt-4" : "")}
                        />
                    </div>
                )}

                {/* ── Action Bar (Admin Only) ── */}
                {isAdmin && (currentStatus === "pending" || currentStatus === "rejected" || currentStatus === "approved") && (
                    <div className="container mx-auto mt-4 px-4 md:px-0">
                        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-100 bg-white rounded-lg">
                            <h2 className="text-lg font-bold">اختر الإجراء المناسب للمنتج</h2>
                            <div className="flex gap-3">
                                {currentStatus !== "approved" && (
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
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">

                            {/* Title & Actions */}
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold leading-tight max-w-[70%] text-[#1e3a52]">
                                    {raw.name}
                                </h1>
                                <div className="flex gap-4 text-gray-2">
                                    <button
                                        onClick={() => {
                                            const currentViewUrl = `/admin/products/${id}/view${fromUrl ? `?from=${encodeURIComponent(decodeURIComponent(fromUrl))}` : ""}`;
                                            router.push(`/admin/products/${id}/edit?from=${encodeURIComponent(currentViewUrl)}`);
                                        }}
                                        className="flex items-center gap-1 text-blue-4 transition-colors cursor-pointer hover:text-blue-600"
                                    >
                                        <Pen className="w-4 h-4" />
                                        <span className="text-sm font-medium">تعديل المنتج</span>
                                    </button>
                                </div>
                            </div>

                            {/* Main media */}
                            <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden mb-4 border border-gray-100 bg-gray-50 group">
                                <VideoOrImage
                                    key={displayImage}
                                    src={displayImage}
                                    alt={raw.name}
                                    fill
                                    thumb={false}
                                    className="transition-opacity duration-300 object-contain"
                                />
                                {imagesList.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const currentIndex = imagesList.indexOf(displayImage);
                                                const nextIndex = (currentIndex + 1) % imagesList.length;
                                                setActiveImage(imagesList[nextIndex]);
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                                        >
                                            <span className="text-gray-600 text-lg font-bold">&#10094;</span>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const currentIndex = imagesList.indexOf(displayImage);
                                                const prevIndex = (currentIndex - 1 + imagesList.length) % imagesList.length;
                                                setActiveImage(imagesList[prevIndex]);
                                            }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                                        >
                                            <span className="text-gray-600 text-lg font-bold">&#10095;</span>
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {imagesList.length > 1 && (
                                <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200" dir="rtl">
                                    {imagesList.map((img, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setActiveImage(img)}
                                            className={cn(
                                                "relative w-20 h-20 rounded-lg overflow-hidden border shrink-0 cursor-pointer transition-all duration-200",
                                                (activeImage || imagesList[0]) === img
                                                    ? "border-blue-500 ring-2 ring-blue-100 opacity-100"
                                                    : "border-gray-200 opacity-70 hover:opacity-100 hover:border-blue-300"
                                            )}
                                        >
                                            <VideoOrImage
                                                src={img}
                                                alt={`thumb-${idx}`}
                                                fill
                                                thumb
                                                className="pointer-events-none object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Provider Info Card */}
                            {store && (
                                <div className="mb-6">
                                    <ProviderInfoCard
                                        store={store}
                                        isOwner={isOwner}
                                        isAdmin={isAdmin}
                                        isFollowing={store.owner?.am_i_following}
                                        onFollow={handleFollowClick}
                                    />
                                </div>
                            )}

                            {/* Inline Description */}
                            <div className="mt-8">
                                <h2 className="text-xl font-bold mb-6 text-[#1e3a52]">تفاصيل المنتج</h2>
                                <div className="border-b border-blue-4 bg-[#F7F4FF] py-3 text-center text-sm font-medium text-blue-4 mb-4 rounded-t-sm">
                                    وصف المنتج
                                </div>
                                <div className="prose prose-sm max-w-none leading-relaxed text-gray-700 px-2">
                                    {raw.short_description && (
                                        <p className="mb-4 font-medium whitespace-pre-line">{raw.short_description}</p>
                                    )}
                                    {raw.description ? (
                                        <SafeHTML html={raw.description} />
                                    ) : !raw.short_description && (
                                        <p>لا يوجد وصف متاح لهذا المنتج.</p>
                                    )}
                                </div>
                            </div>

                            {/* Offers & Discounts — the cross-selling bundle as the customer meets it */}
                            {bundleProducts.length > 0 && (
                                <div className="mt-10 pt-8">
                                    <h3 className="text-lg font-bold mb-6 text-[#1e3a52] text-right">العروض والتخفيضات</h3>
                                    {raw.cross_sells_name && (
                                        <h4 className="mb-6 text-center text-lg font-bold wrap-break-word text-c2-neutral-900">
                                            {raw.cross_sells_name}
                                        </h4>
                                    )}
                                    {/* min-w-0 so the bundle box, not the card, absorbs any
                                        shortfall; w-fit from md up because the preview's own
                                        row would otherwise stretch to the card's full width
                                        and strand the total far from the capped bundle box. */}
                                    <div className="min-w-0 md:mx-auto md:w-fit">
                                        {/* No mainProduct: this is that product's own page. */}
                                        <OfferBundlePreview
                                            relatedProducts={bundleProducts}
                                            originalPrice={bundleOriginalPrice}
                                            offerPrice={raw.cross_sells_price}
                                            showSavings
                                            relatedLabel="المنتجات المرتبطة"
                                        />
                                    </div>
                                </div>
                            )}



                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 order-1 lg:order-2 lg:sticky lg:top-6">
                        <div className="bg-white rounded-lg border border-[#DDE5EC] h-fit overflow-hidden shadow-sm">
                            <div className="p-4">
                                {/* Toggle Shown (Merchant Only & Approved) */}
                                {isOwner && currentStatus === "approved" && (
                                    <div className="mb-3 flex justify-between items-center bg-[#F4F7FA] p-3 rounded-md border border-[#DDE5EC]">
                                        <span className="font-bold text-sm text-[#1e3a52]">تفعيل المنتج</span>
                                        <Switch
                                            checked={raw.shown}
                                            onCheckedChange={handleToggleShown}
                                            disabled={isUpdatingShown}
                                            className="data-[state=checked]:bg-[#34C759]"
                                        />
                                    </div>
                                )}

                                {/* Product Metadata */}
                                <div className="py-3 border-b border-[#E6ECF2] text-right">
                                    <p className="font-bold text-sm mb-1 text-[#1e3a52]">فئة المنتج</p>
                                    <p className="text-gray-500 text-xs font-medium leading-5">
                                        {raw.category?.name || raw.category_name || "-"}
                                        {raw.section?.name ? ` > ${raw.section.name}` : ""}
                                    </p>
                                </div>
                                <div className="py-3 border-b border-[#E6ECF2] text-right">
                                    <p className="font-bold text-sm mb-1 text-[#1e3a52]">قسم المنتج</p>
                                    <p className="text-gray-500 text-xs font-medium leading-5">{raw.section?.name || "-"}</p>
                                </div>
                                <div className="grid grid-cols-2 border-b border-[#E6ECF2] py-3 text-right">
                                    <div>
                                        <p className="font-bold text-sm mb-1 text-[#1e3a52]">سعر المنتج</p>
                                        <p className="text-gray-500 text-xs font-medium">₪ {formatPrice(raw.price)}</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm mb-1 text-[#1e3a52]">حالة المنتج</p>
                                        <p className="text-gray-500 text-xs font-medium">{conditionLabel[raw.condition || "new"] || "جديد"}</p>
                                    </div>
                                </div>

                                {/* Shipping */}
                                <div className="py-3 border-b border-[#E6ECF2] text-right">
                                    <p className="font-bold text-sm mb-2 text-[#1e3a52]">تفاصيل شركة الشحن</p>
                                    <div className="grid grid-cols-2 gap-2 text-[11px] border border-[#DDE5EC] px-3 py-2 rounded-md items-center bg-white">
                                        <span className="text-gray-500">شركة الشحن: <span className="font-bold text-gray-800">{store?.shippingCompanies?.[0]?.name || "محلية"}</span></span>
                                        {store?.shippingCompanies?.[0]?.phone && <span className="text-gray-500">رقم الهاتف: <span className="font-bold text-gray-800" dir="ltr">{store.shippingCompanies[0].phone}</span></span>}
                                    </div>
                                </div>

                                {/* Cities */}
                                <div className="py-3 border-b border-[#E6ECF2] text-right">
                                    <p className="font-bold text-sm mb-2 text-[#1e3a52]">المدن التي يمكنه التوصيل إليها</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {shippingDeliveryRows.length > 0 ? (
                                            shippingDeliveryRows.map((row) => (
                                                <div key={row.key} className="border border-[#DDE5EC] px-2 py-1.5 rounded-md text-[11px] flex justify-between items-center bg-white gap-2">
                                                    <span className="text-gray-500 whitespace-nowrap">المدينة: <span className="font-bold text-gray-800">{row.cityName}</span></span>
                                                    <span className="text-gray-500 whitespace-nowrap">السعر: <span className="font-bold text-gray-800">₪ {formatPrice(row.price)}</span></span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400">لا توجد مدن محددة</span>
                                        )}
                                    </div>
                                </div>

                                {/* Keywords */}
                                <div className="py-3 border-b border-[#E6ECF2] text-right">
                                    <p className="font-bold text-sm mb-2 text-[#1e3a52]">الكلمات المفتاحية</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {raw.tags && raw.tags.length > 0 ? (
                                            raw.tags.map((tag: string | { id: number; title: string }, idx: number) => (
                                                <span key={idx} className="text-[#3A5779] text-[10px] bg-[#EEF4FA] px-3 py-1 rounded-full border border-[#C8D6E4] font-medium">
                                                    {typeof tag === "object" ? tag.title : tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-xs">لا توجد كلمات مفتاحية</span>
                                        )}
                                    </div>
                                </div>

                                {/* Variations (Disabled dropdowns) */}
                                {raw.type === "variation" && raw.variations && raw.variations.length > 0 && (
                                    <div className="py-3 border-b border-[#E6ECF2] text-right space-y-2">
                                        <div className="relative">
                                            <select className="w-full h-9 px-3 border border-[#DDE5EC] rounded-md text-xs text-gray-500 bg-white cursor-not-allowed appearance-none" disabled>
                                                <option>اختر المقاس</option>
                                            </select>
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <span className="text-gray-400 text-xs">&#9660;</span>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <select className="w-full h-9 px-3 border border-[#DDE5EC] rounded-md text-xs text-gray-500 bg-white cursor-not-allowed appearance-none" disabled>
                                                <option>اختر اللون</option>
                                            </select>
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <span className="text-gray-400 text-xs">&#9660;</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Contact Buttons */}
                                <div className="flex flex-col gap-2.5 mt-4">
                                    <Button className="w-full bg-[#1e3a52] hover:bg-[#152a3b] text-white font-bold h-10 rounded-md flex items-center justify-center gap-2 text-xs shadow-sm">
                                        <Phone className="w-4 h-4 text-white" />
                                        <span dir="ltr">{store?.phone?.replace(/^\+?(\d{3}).*/, "+$1 *** *** ***") || "+972 *** *** ***"}</span>
                                    </Button>
                                    <ChatNowButton
                                        variant="outline"
                                        target={{ type: "store", id: store?.id }}
                                        basePath="/admin/chat"
                                        label="دردشة"
                                        icon={<Send className="w-4 h-4" />}
                                        iconPosition="end"
                                        iconClassName="w-4 h-4"
                                        className="w-full border-[#C9D4DF] text-gray-700 hover:bg-gray-50 bg-white font-bold h-10 rounded-md flex items-center justify-center gap-2 text-xs shadow-sm"
                                    />
                                </div>
                            </div>
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
                onClose={handleSuccessModalClose}
                title={successModalTitle}
                buttonText="تم"
                onButtonClick={handleSuccessModalClose}
            />
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                shareUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/product/${raw?.slug || id}`}
                title="شارك هذا المنتج"
                description="هل أعجبك هذا المنتج؟ شاركه الآن مع أصدقائك."
            />
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="هل أنت متأكد من حذف هذا المنتج؟"
                description="سيتم حذف المنتج نهائياً. لا يمكن التراجع عن هذا الإجراء."
            />
        </div>
    );
}

// ── Reviews Section ──────────────────────────────────────────────────
function ProductReviewsSection({ slug, summary }: { slug: string; summary: { count: number; rate: number } }) {
    const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
    const [mediaViewerState, setMediaViewerState] = useState<{ isOpen: boolean; media: string[]; index: number }>({
        isOpen: false, media: [], index: 0,
    });

    const [page, setPage] = useState(1);
    const { data, isLoading, refetch: refetchReviews } = useGetProductReviews(slug, page);
    const { mutate: addReview, isPending } = useAddProductReview();

    const handleSubmit = (formData: { content: string; rate: number; images: File[]; parent_id?: number | null }) => {
        return new Promise<void>((resolve, reject) => {
            addReview(
                { slug, payload: { content: formData.content, rate: String(formData.rate), images: formData.images, parent_id: formData.parent_id } },
                {
                    onSuccess: () => {
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

    const reviews = data?.reviews || [];
    const statistics = data?.rate_stats
        ? { total_reviews: data.total || 0, average_rate: Number(data.avg_rate) || 0, stars: data.rate_stats }
        : summary.count > 0
            ? { total_reviews: summary.count, average_rate: summary.rate, stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
            : undefined;

    return (
        <>
            <ReviewsSection
                stats={statistics && <ReviewStatisticsDisplay stats={statistics} />}
                isLoading={isLoading}
                itemsOnPage={reviews.length}
                total={data?.total}
                page={page}
                setPage={setPage}
                onSubmit={handleSubmit}
                isSubmitting={isPending}
            >
                {reviews.map((review) => (
                    <ReviewItemWithReplies
                        key={review.id}
                        review={review as unknown as SharedReview}
                        slug={slug}
                        onOpenMedia={(media, index) => setMediaViewerState({ isOpen: true, media, index })}
                        onSubmitReply={handleSubmit}
                        isSubmittingReply={isPending}
                        showReplies={expandedReplies.has(review.id)}
                        onToggleReplies={handleToggleReplies}
                        onReviewChanged={refetchReviews}
                    />
                ))}
            </ReviewsSection>

            {mediaViewerState.isOpen && (
                <MediaViewer
                    isOpen={mediaViewerState.isOpen}
                    onClose={() => setMediaViewerState((prev) => ({ ...prev, isOpen: false }))}
                    media={mediaViewerState.media}
                    initialIndex={mediaViewerState.index}
                />
            )}
        </>
    );
}

function ReviewItemWithReplies({ review, slug, onOpenMedia, onSubmitReply, isSubmittingReply, showReplies, onToggleReplies, onReviewChanged }: {
    review: SharedReview;
    slug: string;
    onOpenMedia: (media: string[], index: number) => void;
    onSubmitReply: (data: ReviewSubmitPayload) => Promise<void> | void;
    isSubmittingReply: boolean;
    showReplies: boolean;
    onToggleReplies: (id: number) => void;
    onReviewChanged: () => void;
}) {
    const { data: repliesData, isLoading: isLoadingReplies, refetch: refetchReplies } = useGetProductReviewReplies(slug, showReplies ? review.id : 0);
    const replies = (repliesData?.reviews || []) as unknown as SharedReview[];

    const handleChanged = () => {
        onReviewChanged();
        if (showReplies) refetchReplies();
    };

    return (
        <ReviewItem
            review={review}
            onOpenMedia={onOpenMedia}
            reportType="comment"
            onSubmitReply={onSubmitReply}
            isSubmittingReply={isSubmittingReply}
            showReplies={showReplies}
            onToggleReplies={onToggleReplies}
            replies={replies}
            isLoadingReplies={isLoadingReplies && showReplies}
            onDeleted={handleChanged}
            onUpdated={handleChanged}
        />
    );
}


