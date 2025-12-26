// src/features/(dashboard)/requested-services/components/RequestedServiceDetailsPage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  Loader2, 
  User,
} from "lucide-react";
import { toast } from "sonner";

import { useGetSingleRequestedService, useUpdateRequestedServiceStatus } from "../hooks";
import { RequestedServiceStatus } from "../api";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Button } from "@/src/components/ui/button";
import { RejectRequestedServiceModal } from "./RejectRequestedServiceModal"; // ✅ استيراد المودال الجديد

interface RequestedServiceDetailsPageProps {
  id: number | string;
}

export function RequestedServiceDetailsPage({ id }: RequestedServiceDetailsPageProps) {
  const router = useRouter();
  
  // State للمودال
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Queries
  const { data: serviceData, isLoading } = useGetSingleRequestedService(id);
  const service = serviceData?.data;

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
        router.refresh(); 
      }
    });
  };

  // عند الضغط على زر الرفض نفتح المودال
  const handleRejectClick = () => {
    setIsRejectModalOpen(true);
  };

  // تنفيذ الرفض بعد اختيار السبب من المودال
  const confirmReject = (reasonText: string) => {
    updateStatus({
      id: id,
      payload: { 
        status: "rejected",
        reject_reason: reasonText // ✅ إرسال نص السبب
      }
    }, {
      onSuccess: () => {
        setIsRejectModalOpen(false);
        toast.success("تم رفض الخدمة");
        router.refresh(); 
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
      <div className="flex h-[50vh] items-center justify-center text-gray-500">
        الخدمة غير موجودة
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <Breadcrumb items={breadcrumbItems} />
           <h1 className="text-xl md:text-2xl font-bold text-gray-800 mt-2">
             {service.title}
           </h1>
        </div>

        {/* Action Buttons */}
        {service.status === "pending" && (
            <div className="flex gap-3">
                <Button 
                    onClick={handleRejectClick}
                    disabled={isUpdating}
                    className="bg-[#EF4444] hover:bg-[#d93a3a] text-white font-bold px-6 h-10 shadow-sm"
                >
                    رفض الخدمة
                </Button>
                <Button 
                    onClick={handleApprove}
                    disabled={isUpdating}
                    className="bg-[#34D399] hover:bg-[#2cb683] text-white font-bold px-6 h-10 shadow-sm"
                >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "قبول الخدمة"}
                </Button>
            </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Main Content */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                
                {/* User Info */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
                        {service.user?.avatar_url ? (
                            <img 
                                src={service.user.avatar_url} 
                                alt={service.user.first_name} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <User className="w-6 h-6" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                            {service.user?.first_name} {service.user?.last_name}
                        </h3>
                        <span className="text-xs text-gray-500">بائع مميز</span> 
                    </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">مرحبا</h4>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-base">
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
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar Info */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
            <div className="bg-[#F8F9FC] rounded-2xl p-6 border border-none"> 
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4 flex justify-between items-center">
                    <span className="text-[#3A5779] font-bold text-sm">تاريخ النشر</span>
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                        <span>
                            {service.created_at 
                                ? formatDistanceToNow(new Date(service.created_at), { addSuffix: true, locale: ar }) 
                                : "-"}
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
                    <span className="text-[#3A5779] font-bold text-sm">عدد التعليقات</span>
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                        <span>0 تعليق</span> 
                    </div>
                </div>

            </div>
        </div>

      </div>

      {/* Reject Modal */}
      <RejectRequestedServiceModal 
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={confirmReject}
        isLoading={isUpdating}
      />
    </div>
  );
}