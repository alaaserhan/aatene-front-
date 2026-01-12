"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus } from "lucide-react";
import { useGetSingleStore, useDeleteStore, useUpdateStoreStatus } from "../hooks";
import { Button } from "@/src/components/ui/button";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { cn } from "@/src/lib/utils";
import { StoreStatus, WorkingTime, StoreManager } from "../api";

interface StoreDetailsPageProps {
  storeId: number;
}

const statusOptions = [
  { label: "مفعل", value: "active" },
  { label: "غير مفعل", value: "not-active" },
];

export function StoreDetailsPage({ storeId }: StoreDetailsPageProps) {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [managersExpanded, setManagersExpanded] = useState(true);
  const [showAllDays, setShowAllDays] = useState(false);

  const { mutate: deleteStoreMutation, isPending: isDeleting } = useDeleteStore();
  const { data: storeData, isLoading } = useGetSingleStore(storeId, {
    enabled: !isDeleteConfirmed,
  });
  const { mutate: updateStatusMutation } = useUpdateStoreStatus();

  const store = storeData?.record;

  const handleEdit = () => {
    router.push(`/admin/stores/${storeId}/edit`);
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteConfirmed(true);

    deleteStoreMutation(storeId, {
      onSuccess: () => {
        router.push("/admin/stores");
      },
      onError: () => {
        // إعادة التفعيل في حال فشل الحذف فقط
        setIsDeleteConfirmed(false);
      }
    });
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation(
      { id: storeId, payload: { status: newStatus as StoreStatus } }
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

  return (
    <div className="max-h-[calc(100vh-193px)] h-full bg-white rounded-lg border border-gray-200 overflow-auto ">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="w-full">
            <ReusableDropdown
              options={statusOptions}
              value={store.status}
              onChange={handleStatusChange}
              placeholder="حالة المتجر"
              className="w-full rounded-xs bg-gray-100"
            />
          </div>

          <Button
            onClick={handleEdit}
            className="flex items-center gap-2 px-6 py-5 bg-blue-5 text-blue-4 border-none cursor-pointer rounded-xs"
          >
            <img src="/icons/dashboard/edit.svg" alt="تعديل" className="w-5 h-5" />
            تعديل بيانات المتجر
          </Button>

          <Button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="flex items-center gap-2 px-6 py-5 bg-red-2 text-red-1  border-none cursor-pointer rounded-xs"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <img src="/icons/dashboard/trash.svg" alt="حذف" className="w-5 h-5" />
            )}
            حذف المتجر
          </Button>
        </div>

        <div className="relative w-full h-32 border border-gray-100 rounded-xl overflow-hidden justify-center items-center flex">
          {store.cover_urls?.[0] ? (
            <img
              src={store.cover_urls[0]}
              alt="Store Cover"
              className=" h-full w-full object-cover"
            />
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
                label="الهاتف المحمول"
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
        <div className="text-sm font-medium  break-words">
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
            {/* {manager.user_name} */}
            احمد محمد
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
            <p className="font-medium ">الاثنين، 18 سبتمبر 2023</p>
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