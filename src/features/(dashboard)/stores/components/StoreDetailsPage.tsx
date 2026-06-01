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
import { PreviewStatusAlert } from "@/src/components/(dashboard)/PreviewStatusAlert";
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

  return (
    <div
      className="max-h-[calc(100vh-193px)] h-full overflow-auto"
      dir="rtl"
    >
      <div className="p-4 sm:p-6 space-y-6">
        {isMerchant && (
          <PreviewStatusAlert
            status={store.shown === false && currentStatus === "approved" ? "deactivated" : currentStatus}
            type="store"
            rejectReason={store.reject_reason ?? undefined}
            isDismissed={statusAlertDismissed}
            onDismiss={() => setDismissedStoreStatus(currentStatus)}
          />
        )}

        {showReviewActions && (
          <div className="w-full">
            <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-100 bg-white rounded-lg">
              <div className="flex flex-col gap-1">
                <h2 className="text-base sm:text-lg font-bold">اختر الإجراء المناسب للمتجر</h2>
                <span
                  className={cn(
                    "w-fit rounded-full px-3 py-1 text-xs font-bold",
                    currentStatus === "approved" && "bg-emerald-50 text-emerald-600",
                    currentStatus === "pending" && "bg-amber-50 text-amber-600",
                    currentStatus === "rejected" && "bg-red-50 text-red-600"
                  )}
                >
                  {currentStatus === "approved" ? "تمت الموافقة عليه" : currentStatus === "rejected" ? "مرفوض" : "قيد المراجعة"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {currentStatus === "approved" && (
                  <Button
                    type="button"
                    disabled
                    className="w-full sm:w-auto bg-[#34D399] text-white px-6 sm:px-8 h-10 font-bold rounded opacity-100"
                  >
                    المتجر مقبول
                  </Button>
                )}
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

              {/* Activate Toggle Row — يظهر فقط للتاجر وفقط إذا كان المتجر مقبولاً */}
              {!isAdmin && currentStatus === "approved" && (
                  <div className="flex items-center justify-between px-4 py-3 rounded-lg mt-4 mb-4 bg-[#F2F6F9]">
                      <span className="font-bold text-sm text-[#1e3a52]">تفعيل المتجر</span>
                      <button
                          onClick={() => {
                              const newShown = store.shown === false ? true : false;
                              updateShownMutation({
                                  id: storeId,
                                  payload: { shown: newShown },
                              });
                          }}
                          disabled={isUpdatingStatus}
                          role="switch"
                          aria-checked={store.shown !== false}
                          style={{
                              width: 44,
                              height: 24,
                              borderRadius: 9999,
                              backgroundColor: store.shown !== false ? "#34D399" : "#6B7280",
                              position: "relative",
                              border: "none",
                              cursor: "pointer",
                              transition: "background-color 0.2s",
                              flexShrink: 0,
                              opacity: isUpdatingStatus ? 0.6 : 1,
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
                                  left: store.shown !== false ? 24 : 4,
                              }}
                          />
                      </button>
                  </div>
              )}

              <div className="mt-5 space-y-4 border-t border-gray-100 pt-4 text-center">
                <div>
                  <p className="text-sm font-bold mb-1">حالة المتجر</p>
                  <p className="text-sm text-gray-2">
                    {currentStatus === "approved" ? "تمت الموافقة عليه" : currentStatus === "rejected" ? "مرفوض" : "قيد المراجعة"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold mb-1">البريد الإلكتروني</p>
                  <p className="break-all text-sm text-gray-2">{store.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-bold mb-1">رقم الهاتف</p>
                  <p className="text-sm text-gray-2">{store.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-bold mb-1">العنوان</p>
                  <p className="text-sm text-gray-2">{store.address || "-"}</p>
                </div>
              </div>
            </div>
          </aside>

          <main className="col-span-12 lg:col-span-8 order-2 lg:order-1 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
                <div>
                  <p className="text-sm text-gray-2 mb-1">معاينة صفحة المتجر</p>
                  <h1 className="text-xl sm:text-2xl font-bold leading-tight">{store.name}</h1>
                </div>
                <div className="flex gap-4 text-gray-2">
                  <button
                      type="button"
                      onClick={handleEdit}
                      className="flex items-center gap-1 text-blue-4 transition-colors cursor-pointer hover:text-blue-600"
                  >
                      <img src="/icons/dashboard/edit.svg" alt="" className="w-4 h-4" />
                      <span className="text-sm font-medium">تعديل المتجر</span>
                  </button>
                  <button
                      type="button"
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className="flex items-center gap-1 text-red-1 transition-colors cursor-pointer hover:text-red-500"
                  >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      ) : (
                        <img src="/icons/dashboard/trash.svg" alt="حذف" className="w-4 h-4 shrink-0" />
                      )}
                      <span className="text-sm font-medium">حذف المتجر</span>
                  </button>
                </div>
              </div>

        <div className="relative w-full aspect-video border border-gray-100 rounded-xl overflow-hidden justify-center items-center flex bg-gray-50">
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
            </div>

        <div className="space-y-6 bg-white border border-gray-100 rounded-2xl p-4">
          <h2 className="text-xl font-bold ">تفاصيل المتجر</h2>
          <div className="border-b border-blue-4 bg-[#F7F4FF] py-3 text-center text-sm font-medium text-blue-4">
            وصف المتجر
          </div>
          <p className="text-sm leading-7 text-gray-700 whitespace-pre-line">
            {store.description || "لا يوجد وصف متاح لهذا المتجر."}
          </p>

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

        <div className="space-y-4 bg-white border border-gray-100 rounded-2xl p-4">
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
          <div className="space-y-4 bg-white border border-gray-100 rounded-2xl p-4">
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
          <div className="space-y-6 bg-white border border-gray-100 rounded-2xl p-4">
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
