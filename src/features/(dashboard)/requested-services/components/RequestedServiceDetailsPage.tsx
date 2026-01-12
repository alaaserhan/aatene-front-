"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Loader2,
  User,
  MessageSquare,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

import { useGetSingleRequestedService, useUpdateRequestedServiceStatus } from "../hooks";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Button } from "@/src/components/ui/button";
import { RejectRequestedServiceModal } from "./RejectRequestedServiceModal";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal"; // ✅ استيراد مودال النجاح

interface RequestedServiceDetailsPageProps {
  id: number | string;
}

export function RequestedServiceDetailsPage({ id }: RequestedServiceDetailsPageProps) {
  const router = useRouter();

  // States
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // ✅ حالة ظهور مودال النجاح

  // Queries
  const { data: serviceData, isLoading } = useGetSingleRequestedService(id);
  const service = serviceData?.record;

  // Mutations
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateRequestedServiceStatus();

  // Handlers
  const handleApprove = () => {
    updateStatus({
      id: id,
      payload: { status: "approved" }
    }, {
      onSuccess: () => {
        toast.success("تم قبول الخدمة بنجاح");
        router.push("/admin/requested-services");
      }
    });
  };

  const handleRejectClick = () => {
    setIsRejectModalOpen(true);
  };

  const confirmReject = (reasonText: string) => {
    updateStatus({
      id: id,
      payload: {
        status: "rejected",
        reject_reason: reasonText
      }
    }, {
      onSuccess: () => {
        setIsRejectModalOpen(false);
        // ✅ فتح مودال النجاح بدلاً من التوجيه المباشر
        setIsSuccessModalOpen(true);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#3A5779]" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col gap-4 text-gray-2">
        <p>الخدمة غير موجودة</p>
        <Button onClick={() => router.back()} variant="outline">عودة</Button>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin" },
    { label: "طلبات الخدمات غير الموجودة", href: "/admin/requested-services" },
    { label: "تفاصيل طلب الخدمة" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-[#F8F9FC]">

      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start  gap-4">
          <div>
            <Breadcrumb items={breadcrumbItems} />
            <h1 className="text-xl md:text-2xl font-bold  mt-2">
              {service.title}
            </h1>
          </div>

          {/* Action Buttons - تظهر فقط إذا كانت الحالة قيد المراجعة */}
          {service.status === "pending" && (
            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={isUpdating}
                className="bg-[#34D399] hover:bg-[#2cb683] text-white font-bold px-6 h-10 rounded-xs"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "قبول الخدمة"}
              </Button>
              <Button
                onClick={handleRejectClick}
                disabled={isUpdating}
                className="bg-[#EF4444] hover:bg-[#d93a3a] text-white font-bold px-6 h-10 rounded-xs"
              >
                رفض الخدمة
              </Button>
            </div>
          )}
        </div>

        {/* ✅ عرض بانر الرفض إذا كانت الحالة مرفوضة */}
        {service.status === "rejected" && (
          <div className="w-full bg-[#FFE5E5] border border-[#FF9999] rounded-lg p-4">
            <h3 className="text-[#EF4444] font-medium mb-2">تم رفض الخدمة</h3>
            <p className="text-[#B91C1C] text-sm leading-relaxed ">
              {service.reject_reason || "لا يوجد سبب محدد للرفض"}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200 ">

            {/* User Info */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
                {service.user?.avatar_url ? (
                  <img
                    src={service.user.avatar_url}
                    alt={service.user.first_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-2 bg-gray-100">
                    <User className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="">
                <h3 className="font-medium text-blue-3 ">
                  {service.user?.first_name} {service.user?.last_name}
                </h3>
                {/* <span className="text-xs text-gray-2">مستخدم</span>  */}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h4 className="text-lg font-bold  mb-3">تفاصيل الطلب</h4>
              <div className="text-gray-2 leading-relaxed whitespace-pre-wrap text-base">
                {service.content}
              </div>
            </div>

            {/* Attachments Section */}
            {service.images_urls && service.images_urls.length > 0 && (
              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-[#3A5779] font-bold text-lg mb-4 text-right">المرفقات</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {service.images_urls.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                      <img
                        src={img}
                        alt={`attachment-${idx}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                        onClick={() => window.open(img, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          <div className="flex flex-col gap-4">

            <div className="bg-white rounded-sm p-4 border border-gray-100 flex justify-between items-center">
              <span className="text-[#3A5779] font-bold text-sm">تاريخ النشر</span>
              <div className="flex items-center gap-2 text-gray-2 text-xs font-medium">
                <span>
                  {service.created_at
                    ? formatDistanceToNow(new Date(service.created_at), { addSuffix: true, locale: ar })
                    : "-"}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-sm p-4 border border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#3A5779]" />
                <span className="text-[#3A5779] font-bold text-sm">التعليقات</span>
              </div>
              <div className="flex items-center gap-2 text-gray-2 text-xs font-medium">
                <span>{service.comments_count || "0"} تعليق</span>
              </div>
            </div>

            <div className="bg-white rounded-sm p-4 border border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-[#3A5779] font-bold text-sm">الإبلاغات</span>
              </div>
              <div className="flex items-center gap-2 text-gray-2 text-xs font-medium">
                <span>{service.reports_count || "0"} إبلاغ</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Reject Modal (Input Reason) */}
      <RejectRequestedServiceModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={confirmReject}
        isLoading={isUpdating}
      />

      {/* ✅ Success Modal (Confirmation) */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => router.push("/admin/requested-services")}
        title="تم رفض الطلب"
        message={`"لقد قمت برفض الطلب المقدم من المستخدم. لن يتم عرضه لمقدمي الخدمات، ويمكن للمستخدم إنشاء طلب جديد في حال رغبته."`}
        buttonText="العودة لقائمة الطلبات"
      />
    </div>
  );
}