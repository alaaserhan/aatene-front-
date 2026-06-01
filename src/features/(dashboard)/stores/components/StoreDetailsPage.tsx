"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { CheckCircle2, Loader2, Minus, PauseCircle, Plus, X, XCircle } from "lucide-react";
import {
  useGetSingleStore,
  useDeleteStore,
  useUpdateStoreShown,
  useUpdateStoreStatus,
} from "../hooks";
import { Button } from "@/src/components/ui/button";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { cn, isVideoFile } from "@/src/lib/utils";
import { WorkingTime, StoreManager } from "../api";
import { RejectStoreModal } from "./RejectStoreModal";
import { formatDateArabic } from "@/src/lib/date-helper";
import { useAuthStore } from "@/src/stores/auth-store";


interface StoreDetailsPageProps {
  storeId: number;
  onDeleteSuccess?: () => void;
}

const shownOptions = [
  { label: "مرئي", value: "1" },
  { label: "غير مرئي", value: "0" },
];

export function StoreDetailsPage({ storeId, onDeleteSuccess }: StoreDetailsPageProps) {
  const router = useRouter();
  const routeParams = useParams<{ locale?: string; type?: string }>();
  const storesBasePath =
    typeof routeParams.locale === "string" && typeof routeParams.type === "string"
      ? `/${routeParams.locale}/${routeParams.type}/stores`
      : "/admin/stores";
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [managersExpanded, setManagersExpanded] = useState(true);
  const [showAllDays, setShowAllDays] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [dismissedStoreStatus, setDismissedStoreStatus] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  const { mutate: deleteStoreMutation, isPending: isDeleting } = useDeleteStore();
  const { data: storeData, isLoading } = useGetSingleStore(storeId, {
    enabled: !isDeleteConfirmed,
  });
  const { mutate: updateShownMutation } = useUpdateStoreShown();
  const { mutate: updateStatusMutation, isPending: isUpdatingStatus } =
    useUpdateStoreStatus();

  const store = storeData?.record;

  const handleEdit = () => {
    router.push(`${storesBasePath}/${storeId}/edit`);
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteConfirmed(true);

    deleteStoreMutation(storeId, {
      onSuccess: () => {
        if (onDeleteSuccess) {
          onDeleteSuccess();
        } else {
          router.push(storesBasePath);
        }
      },
      onError: () => {
        // إعادة التفعيل في حال فشل الحذف فقط
        setIsDeleteConfirmed(false);
      }
    });
  };

  const handleShownChange = (value: string) => {
    updateShownMutation({
      id: storeId,
      payload: { shown: value === "1" },
    });
  };

  const handleApproveStore = () => {
    updateStatusMutation({ id: storeId, payload: { status: "approved" } });
  };

  const confirmReject = (reasonText: string, details: string) => {
    const fullReason = details ? `${reasonText} - ${details}` : reasonText;
    updateStatusMutation(
      { id: storeId, payload: { status: "rejected", reject_reason: fullReason } },
      {
        onSuccess: () => {
          setRejectModalOpen(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-lg">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-3" />
          <span>جاري تحميل البيانات...</span>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-lg">
        <div className="text-center">
          <p className="text-xl text-gray-2 mb-4">لم يتم العثور على المتجر</p>
        </div>
      </div>
    );
  }

  const displayedWorkingTimes = showAllDays
    ? store.workingtimes
    : store.workingtimes.slice(0, 2);

  const showShownControl =
    user?.user_type === "admin" || user?.user_type === "merchant";
  const isAdmin =
    user?.user_type === "admin" || Cookies.get("user_type") === "admin";
  const isMerchant =
    user?.user_type === "merchant" || Cookies.get("user_type") === "merchant";
  const currentStatus = store.status;
  const statusAlertDismissed = dismissedStoreStatus === currentStatus;
  const showReviewActions =
    isAdmin &&
    (currentStatus === "pending" ||
      currentStatus === "rejected" ||
      currentStatus === "approved");
  const merchantStatusAlert = currentStatus === "approved"
    ? {
        icon: <CheckCircle2 className="w-5 h-5 text-[#00A846] mt-0.5 shrink-0" />,
        className: "border-[#66FF99]/60 bg-[#E6FFF1]",
        titleClassName: "text-[#006B2E]",
        bodyClassName: "text-[#008A3A]",
        title: "تم قبول متجرك بنجاح",
        body: "نحيطك علماً بأنه تم قبول عرض متجرك على الموقع، وهو الآن متاح للزوار ويمكن للعملاء تصفحه في أي وقت.",
      }
    : currentStatus === "rejected"
      ? {
          icon: <XCircle className="w-5 h-5 text-[#D00739] mt-0.5 shrink-0" />,
          className: "border-[#FF9999]/60 bg-[#FFF0F0]",
          titleClassName: "text-[#D00739]",
          bodyClassName: "text-[#A00028]",
          title: "تم رفض المتجر",
          body: store.reject_reason
            ? `سبب الرفض: ${store.reject_reason}`
            : "نعتذر، لم يتم قبول عرض المتجر في الوقت الحالي. يرجى مراجعة البيانات وإجراء التعديلات اللازمة، ثم إعادة الإرسال.",
        }
      : currentStatus === "pending"
        ? {
            icon: <PauseCircle className="w-5 h-5 text-[#C48A00] mt-0.5 shrink-0" />,
            className: "border-[#FFD87D]/60 bg-[#FFFBF0]",
            titleClassName: "text-[#8A6000]",
            bodyClassName: "text-[#6B4A00]",
            title: "المتجر قيد المراجعة من قبل فريق أعطيني",
            body: "سيتم نشر المتجر بعد الانتهاء من مراجعته واعتماده من قبل الإدارة.",
          }
        : null;

  return (
    <div
      className="max-h-[calc(100vh-193px)] h-full bg-white rounded-lg border border-gray-200 overflow-auto "
      dir="rtl"
    >
      <div className="p-4 sm:p-6 space-y-6">
        {isMerchant && merchantStatusAlert && !statusAlertDismissed && (
          <div className={cn("flex items-start gap-3 px-5 py-4 rounded-xl border relative", merchantStatusAlert.className)}>
            {merchantStatusAlert.icon}
            <div className="flex-1">
              <p className={cn("font-bold text-sm", merchantStatusAlert.titleClassName)}>
                {merchantStatusAlert.title}
              </p>
              <p className={cn("text-sm mt-1 leading-relaxed", merchantStatusAlert.bodyClassName)}>
                {merchantStatusAlert.body}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDismissedStoreStatus(currentStatus)}
              className="text-gray-800 hover:opacity-70 transition-opacity shrink-0 mt-0.5"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {showReviewActions && (
          <div className="w-full">
            <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-100 bg-white rounded-lg">
              <h2 className="text-base sm:text-lg font-bold">اختر الإجراء المناسب للمتجر</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {currentStatus !== "approved" && (
                  <Button
                    type="button"
                    onClick={handleApproveStore}
                    disabled={isUpdatingStatus}
                    className="w-full sm:w-auto bg-[#34D399] hover:bg-[#2cb683] text-white px-6 sm:px-8 h-10 font-bold rounded"
                  >
                    {isUpdatingStatus
                      ? "جاري التحديث..."
                      : currentStatus === "rejected"
                        ? "قبول المتجر مرة أخرى"
                        : "قبول المتجر"}
                  </Button>
                )}
                {currentStatus !== "rejected" && (
                  <Button
                    type="button"
                    onClick={() => setRejectModalOpen(true)}
                    disabled={isUpdatingStatus}
                    className="w-full sm:w-auto bg-[#EF4444] hover:bg-[#d93838] text-white px-6 sm:px-8 h-10 font-bold rounded"
                  >
                    رفض المتجر
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <RejectStoreModal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          onConfirm={confirmReject}
          isLoading={isUpdatingStatus}
        />

        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 lg:col-span-4 order-1 lg:order-2">
            <div className="sticky top-4 rounded-2xl border border-gray-100 bg-white p-4">
              <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-100">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt={store.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-2">Logo</div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-base font-bold text-gray-900">{store.name}</h2>
                  <p className="mt-1 text-xs text-gray-2">{store.type === "services" ? "متجر خدمات" : "متجر منتجات"}</p>
                </div>
              </div>

              {showShownControl && (
                <div className="mb-3 w-full min-w-0">
                  <ReusableDropdown
                    options={shownOptions}
                    value={store.shown === false ? "0" : "1"}
                    onChange={handleShownChange}
                    placeholder="ظهور المتجر للعميل"
                    className="w-full rounded-lg bg-gray-50"
                  />
                </div>
              )}

              <div className="grid gap-3">
                <Button
                  onClick={handleEdit}
                  className="flex w-full min-w-0 items-center justify-center gap-2 px-4 py-3 text-sm bg-blue-5 text-blue-4 border-none cursor-pointer rounded-lg"
                >
                  <img src="/icons/dashboard/edit.svg" alt="تعديل" className="w-5 h-5 shrink-0" />
                  تعديل بيانات المتجر
                </Button>

                <Button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="flex w-full min-w-0 items-center justify-center gap-2 px-4 py-3 text-sm bg-red-2 text-red-1 border-none cursor-pointer rounded-lg"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                  ) : (
                    <img src="/icons/dashboard/trash.svg" alt="حذف" className="w-5 h-5 shrink-0" />
                  )}
                  حذف المتجر
                </Button>
              </div>

              <div className="mt-5 space-y-4 border-t border-gray-100 pt-4 text-right">
                <div>
                  <p className="text-sm font-bold">حالة المتجر</p>
                  <p className="mt-1 text-sm text-gray-2">
                    {currentStatus === "approved" ? "تمت الموافقة عليه" : currentStatus === "rejected" ? "مرفوض" : "قيد المراجعة"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold">البريد الإلكتروني</p>
                  <p className="mt-1 break-all text-sm text-gray-2">{store.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-bold">رقم الهاتف</p>
                  <p className="mt-1 text-sm text-gray-2">{store.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-bold">العنوان</p>
                  <p className="mt-1 text-sm text-gray-2">{store.address || "-"}</p>
                </div>
              </div>
            </div>
          </aside>

          <main className="col-span-12 lg:col-span-8 order-2 lg:order-1 flex flex-col gap-6">

        <div className="relative w-full h-56 border border-gray-100 rounded-xl overflow-hidden justify-center items-center flex bg-gray-50">
          {store.cover_urls?.[0] ? (
            isVideoFile(store.cover_urls[0]) ? (
              <video
                src={store.cover_urls[0]}
                controls
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={store.cover_urls[0]}
                alt="Store Cover"
                className=" h-full w-full object-cover"
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600" />
          )}

          <div className="absolute bottom-4 right-4 w-24 h-24 bg-white rounded-xl shadow-lg overflow-hidden">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-2 text-xs">Logo</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 border border-gray-100 rounded-xl p-4">
          <h2 className="text-xl font-bold ">البيانات الأساسية للمتجر</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <DetailRow
              icon={<div
                className="w-5 h-5 bg-black/90"
                style={{
                  WebkitMaskImage: `url(/icons/dashboard/mark2.svg)`,
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskSize: "contain",
                  maskImage: `url(/icons/dashboard/mark2.svg)`,
                  maskRepeat: "no-repeat",
                  maskSize: "contain",
                }}
              ></div>}
              label="اسم المتجر"
              value={store.name}
            />

            <DetailRow
              icon={<img src="/icons/dashboard/email.svg" alt="email" className="w-5 h-5" />}
              label="البريد الإلكتروني للمتجر"
              value={store.email || "-"}
            />

            <DetailRow
              icon={<img src="/icons/dashboard/phone2.svg" alt="phone" className="w-5 h-5" />}
              label="رقم الهاتف"
              value={store.phone || "-"}
            />

            <DetailRow
              icon={<img src="/icons/dashboard/mark.svg" alt="address" className="w-5 h-5" />}
              label="العنوان"
              value={store.address || "-"}
            />

            <div className="md:col-span-2">
              <DetailRow
                icon={<img src="/icons/dashboard/list.svg" alt="description" className="w-5 h-5" />}
                label="الوصف"
                value={store.description || "-"}
              />
            </div>

            <DetailRow
              icon={<img src="/icons/dashboard/currency.svg" alt="currency" className="w-5 h-5" />}
              label="العملة"
              value={store.currency?.name || "-"}
            />

            <DetailRow
              icon={<img src="/icons/dashboard/person.svg" alt="owner" className="w-5 h-5" />}
              label="المالك"
              value={
                store.owner
                  ? `${store.owner.first_name} ${store.owner.last_name}`
                  : "-"
              }
            />
          </div>
        </div>

        <div className="space-y-4 px-0 md:px-4">
          <h2 className="text-xl font-bold ">بيانات الاتصال والسوشيال</h2>
          {
            (!store.whats_app && !store.phone && !store.facebook && !store.youtube && !store.instagram && !store.tiktok) && (
              <p className="text-sm text-gray-2">لا توجد بيانات اتصال أو سوشيل متاحة لهذا المتجر</p>
            )
          }
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {store.whats_app && (
              <SocialRow
                icon={<img src="/icons/dashboard/whatsapp2.svg" alt="whatsapp" className="w-6 h-6" />}
                label="الواتساب"
                value={store.whats_app}
              />
            )}

            {store.phone && (
              <SocialRow
                icon={<img src="/icons/dashboard/phone3.svg" alt="phone" className="w-5 h-5" />}
                label="رقم الهاتف"
                value={store.phone}
              />
            )}

            {store.facebook && (
              <SocialRow
                icon={<img src="/icons/dashboard/facebook2.svg" alt="facebook" className="w-6 h-6" />}
                label="فيسبوك"
                value={store.facebook}
              />
            )}

            {store.youtube && (
              <SocialRow
                icon={<img src="/icons/dashboard/youtube2.svg" alt="youtube" className="w-6 h-6" />}
                label="يوتيوب"
                value={store.youtube}
              />
            )}

            {store.instagram && (
              <SocialRow
                icon={<img src="/icons/dashboard/insta2.svg" alt="instagram" className="w-6 h-6" />}
                label="إنستجرام"
                value={store.instagram}
              />
            )}

            {store.tiktok && (
              <SocialRow
                icon={<img src="/icons/dashboard/tiktok.svg" alt="tiktok" className="w-6 h-6" />}
                label="تيك توك"
                value={store.tiktok}
              />
            )}
          </div>
        </div>

        {store.managers && store.managers.length > 0 && (
          <div className="space-y-4 border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold ">موظفين المتجر</h2>
              <button
                onClick={() => setManagersExpanded(!managersExpanded)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-blue-4 cursor-pointer text-blue-4"
              >
                {managersExpanded ? <Minus className="w-5" /> : <Plus className="w-5" />}
              </button>
            </div>

            {managersExpanded && (
              <div className="space-y-3">
                {store.managers.map((manager, index) => (
                  <ManagerRow key={index} manager={manager} />
                ))}
              </div>
            )}
          </div>
        )}

        {store.workingtimes && store.workingtimes.length > 0 && (
          <div className="space-y-6 border border-gray-100 rounded-xl p-4">
            <h2 className="text-xl font-bold">أوقات عمل المتجر</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <p className="text-sm font-medium text-gray-2">اليوم</p>
                <p className="text-sm font-medium text-gray-2">يفتح في</p>
                <p className="text-sm font-medium text-gray-2">يغلق في</p>
              </div>
              {displayedWorkingTimes.map((time, index) => (
                <WorkingTimeRow key={index} workingTime={time} />
              ))}
            </div>

            {store.workingtimes.length > 2 && !showAllDays && (
              <button
                onClick={() => setShowAllDays(true)}
                className="mx-auto py-2 px-4 bg-blue-5 rounded  cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span>
                <span className="text-sm ">
                  مشاهدة جميع الأيام
                </span>
              </button>
            )}

            {showAllDays && store.workingtimes.length > 2 && (
              <button
                onClick={() => setShowAllDays(false)}
                className="mx-auto py-2 px-4 bg-blue-5 rounded cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="text-lg">-</span>
                <span className="text-sm ">إخفاء</span>
              </button>
            )}
          </div>
        )}
          </main>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="هل أنت متأكد من حذف هذا المتجر؟"
        description="لا يمكن استرجاع المتجر بعد حذفه"
        confirmText="نعم، قم بالحذف"
        cancelText="إلغاء"
      />
    </div>
  );
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-shrink-0 rounded border border-gray-200 w-9 h-9 flex justify-center items-center mt-1">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-2 mb-1">{label}</p>
        <div className="text-sm font-medium  break-words [word-break:break-word]">
          {value}
        </div>
      </div>
    </div>
  );
}

interface SocialRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subLabel?: string;
}

function SocialRow({ icon, label, value, subLabel }: SocialRowProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 rounded border border-gray-200 w-9 h-9 flex justify-center items-center mt-1">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-2 mb-1">{label}</p>
        <div className="text-sm font-medium  break-all mb-1">
          {value}
        </div>
        {subLabel && (
          <p className="text-xs text-gray-2">{subLabel}</p>
        )}
      </div>
    </div>
  );
}

interface ManagerRowProps {
  manager: StoreManager;
}

function ManagerRow({ manager }: ManagerRowProps) {
  const getManagerTitle = (title: string) => {
    const titles: Record<string, string> = {
      general: "مدير عام",
      sales: "مدير مبيعات",
      products: "مدير منتجات",
      services: "مدير خدمات",
    };
    return titles[title] || title;
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
          {manager.user?.avatar_url ? (
            <img
              src={manager.user.avatar_url}
              alt={manager.user.first_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-2 text-xs">صورة</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-row gap-4 justify-center items-center">
        <div className="flex flex-col">
          <h3 className="font-medium">
            {manager.user_name}
          </h3>
          <div className="flex items-center gap-3">
            <a href={`https://wa.me/${manager.user?.phone}`} className="text-blue-4 font-medium underline">
              {manager.user?.phone}
            </a>
            <a
              href={`https://wa.me/${manager.user?.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center cursor-pointer"
            >
              <img src="/icons/dashboard/whatsapp.svg" alt="whatsapp" className="w-5 h-5" />
            </a>
            <a
              href={`mailto:${manager.user_email}`}
              className=" flex items-center justify-center cursor-pointer"
            >
              <div
                className="w-5 h-5 bg-blue-4"
                style={{
                  maskImage: "url(/icons/dashboard/email.svg)",
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                }}
              ></div>
            </a>

          </div>
        </div>

        <div className="flex flex-row gap-6 text-sm">
          <div>
            <p className="text-gray-2 mb-2">الدور الوظيفي</p>
            <p className="font-medium ">
              {getManagerTitle(manager.title)}
            </p>
          </div>
          <div>
            <p className="text-gray-2 mb-2">البريد الإلكتروني</p>
            <p className="font-medium  truncate">{manager.user?.email}</p>
          </div>
          <div>
            <p className="text-gray-2 mb-2">تاريخ الانضمام</p>
            <p className="font-medium ">{manager.user?.created_at ? formatDateArabic(manager.user.created_at) : "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface WorkingTimeRowProps {
  workingTime: WorkingTime;
}

function WorkingTimeRow({ workingTime }: WorkingTimeRowProps) {
  const getDayName = (day: string) => {
    const days: Record<string, string> = {
      saturday: "السبت",
      sunday: "الأحد",
      monday: "الاثنين",
      tuesday: "الثلاثاء",
      wednesday: "الأربعاء",
      thursday: "الخميس",
      friday: "الجمعة",
    };
    return days[day.toLowerCase()] || day;
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <p className="text-sm font-medium mt-1">{getDayName(workingTime.day)}</p>
      </div>
      <div>
        <p className="text-sm text-gray-2 mt-1">
          {workingTime.open_always
            ? "مفتوح دائماً"
            : workingTime.closed_always
              ? "مغلق"
              : `${workingTime.from} صباحاً`}
        </p>
      </div>
      <div>
        <p className="text-sm text-gray-2 mt-1">
          {workingTime.open_always
            ? "-"
            : workingTime.closed_always
              ? "-"
              : `${workingTime.to} مساءً`}
        </p>
      </div>
    </div>
  );
}
