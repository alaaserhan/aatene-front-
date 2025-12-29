// src/features/(dashboard)/requested-services/components/RequestedServicesPage.tsx
"use client";

import { useState } from "react";
import {
  Trash2,
  Eye,
  Edit,
  Search,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

import { useGetRequestedServices, useDeleteRequestedService, useUpdateRequestedServiceStatus } from "../hooks";
import { RequestedServiceStatus, RequestedService } from "../api";
import { Input } from "@/src/components/ui/input";
import { Pagination } from "@/src/components/ui/Pagination";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";

const ITEMS_PER_PAGE = 10;

export function RequestedServicesPage() {

  const [activeTab, setActiveTab] = useState<RequestedServiceStatus | "reports">("approved");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);

  const { data: approvedData } = useGetRequestedServices(new URLSearchParams({ status: "approved", per_page: "1" }));
  const { data: pendingData } = useGetRequestedServices(new URLSearchParams({ status: "pending", per_page: "1" }));
  const { data: rejectedData } = useGetRequestedServices(new URLSearchParams({ status: "rejected", per_page: "1" }));
  const { data: reportsData } = useGetRequestedServices(new URLSearchParams({ has_reports: "1", per_page: "1" }));

  const queryParams = new URLSearchParams({
    page: page.toString(),
    per_page: ITEMS_PER_PAGE.toString(),
    search: search,
  });

  if (activeTab === "reports") {
    queryParams.append("has_reports", "1");
  } else {
    queryParams.append("status", activeTab);
  }

  const { data: servicesData, isLoading } = useGetRequestedServices(queryParams);

  const { mutate: deleteService, isPending: isDeleting } = useDeleteRequestedService();
  const { mutate: updateStatus } = useUpdateRequestedServiceStatus();

  const totalPages = Math.ceil((servicesData?.recordsFiltered || 0) / ITEMS_PER_PAGE);

  const handleDelete = () => {
    if (deleteId) {
      deleteService({ id: deleteId }, {
        onSuccess: () => setDeleteId(null)
      });
    }
  };

  const handleStatusToggle = (service: RequestedService) => {
    const newStatus: RequestedServiceStatus = service.status === "approved" ? "pending" : "approved";
    updateStatus({
      id: service.id,
      payload: { status: newStatus }
    }, {
      onSuccess: () => {
        toast.success(newStatus === "approved" ? "تمت الموافقة على الطلب" : "تم تحويل الطلب لقيد المراجعة");
      }
    });
  };

  const stats = [
    {
      id: "approved",
      label: "تمت الموافقة عليه",
      count: approvedData?.recordsFiltered || 0,
      color: "text-[#34D399]",
      bgActive: "bg-[#34D399] text-white",
      borderActive: "border-[#34D399]"
    },
    {
      id: "pending",
      label: "قيد المراجعة",
      count: pendingData?.recordsFiltered || 0,
      color: "text-[#F59E0B]",
      bgActive: "bg-[#F59E0B] text-white",
      borderActive: "border-[#F59E0B]"
    },
    {
      id: "rejected",
      label: "مرفوض",
      count: rejectedData?.recordsFiltered || 0,
      color: "text-[#EF4444]",
      bgActive: "bg-[#EF4444] text-white",
      borderActive: "border-[#EF4444]"
    },
    {
      id: "reports",
      label: "طلبات عليها بلاغات",
      count: reportsData?.recordsFiltered || 0,
      color: "text-[#3A5779]",
      bgActive: "bg-[#3A5779] text-white",
      borderActive: "border-[#3A5779]"
    },
  ];

  const renderTableHeader = () => {
    if (activeTab === "rejected") {
      return (
        <tr>
          <th className="px-6 py-4 text-xs font-medium text-center">رقم الخدمة</th>
          <th className="px-6 py-4 text-xs font-medium  w-1/4">صاحب الإعلان</th>
          <th className="px-6 py-4 text-xs font-medium  w-1/3">وصف الخدمة</th>
          <th className="px-6 py-4 text-xs font-medium ">سبب الرفض</th>
        </tr>
      );
    }
    if (activeTab === "reports") {
      return (
        <tr>
          <th className="px-6 py-4 text-xs font-medium text-center">رقم الخدمة</th>
          <th className="px-6 py-4 text-xs font-medium  w-1/4">صاحب الإعلان</th>
          <th className="px-6 py-4 text-xs font-medium  w-1/3">نوع البلاغ</th>
          <th className="px-6 py-4 text-xs font-medium text-center">عمليات</th>
        </tr>
      );
    }
    return (
      <tr>
        <th className="px-6 py-4 text-xs font-medium text-center">رقم الخدمة</th>
        <th className="px-6 py-4 text-xs font-medium  w-1/4">صاحب الإعلان</th>
        <th className="px-6 py-4 text-xs font-medium text-center">تاريخ النشر</th>
        <th className="px-6 py-4 text-xs font-medium text-center">حالة الطلب</th>
        <th className="px-6 py-4 text-xs font-medium text-center">عمليات</th>
      </tr>
    );
  };

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={5} className="py-20 text-center">
            <div className="flex justify-center items-center gap-2 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-[#3A5779]" />
              <span>جاري التحميل...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (!servicesData?.data || servicesData.data.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="py-20 text-center text-gray-500">
            لا توجد طلبات لعرضها
          </td>
        </tr>
      );
    }

    return servicesData.data.map((item) => {
      const ownerCell = (
        <td className="px-6 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
              <img
                src={item.user?.avatar_url || "/placeholder-user.jpg"}
                alt={item.user?.first_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium line-clamp-1">
                {item.user?.first_name} {item.user?.last_name}
              </span>
            </div>
          </div>
        </td>
      );

      const idCell = (
        <td className="px-6 py-4 text-sm font-medium text-center  underline decoration-gray-300 underline-offset-4">
          <Link href={`/admin/requested-services/${item.id}`}>#{item.id}</Link>
        </td>
      );

      if (activeTab === "rejected") {
        return (
          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
            {idCell}
            {ownerCell}
            <td className="px-6 py-4 text-center  text-sm">
              <p className="line-clamp-2">{item.content}</p>
            </td>
            <td className="px-6 py-4  text-sm  text-center  font-medium">
              {item.reject_reason || "لا يوجد سبب محدد"}
            </td>
          </tr>
        );
      }

      if (activeTab === "reports") {
        return (
          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
            {idCell}
            {ownerCell}
            <td className="px-6 py-4  text-sm">
              <p className="line-clamp-1">محتوى غير لائق أو مخالف</p>
            </td>
            <td className="px-6 py-4 text-center">
              <Link href={`/admin/requested-services/${item.id}/reports`}>
                <Button variant="secondary" className="bg-[#CFE2F3] text-[#3A5779] hover:bg-[#b0cce6] text-xs font-bold px-4 h-9">
                  مراجعة تفاصيل الشكوى
                </Button>
              </Link>
            </td>
          </tr>
        );
      }

      return (
        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
          {idCell}
          {ownerCell}
          <td className="px-6 py-4 text-center text-sm font-medium dir-ltr">
            {item.created_at ? format(new Date(item.created_at), "dd-MM-yyyy") : "-"}
          </td>
          <td className="px-6 py-4 text-center">
            <div className="flex justify-center">
              <ToggleSwitch
                enabled={item.status === "approved"}
                onChange={() => handleStatusToggle(item)}
              />
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex justify-center items-center gap-2">
              <Link href={`/admin/requested-services/${item.id}/edit`}>
                <Button variant="ghost" size="icon" className="h-9 w-9 bg-blue-5  rounded transition-colors">
                  <img src="/icons/dashboard/edit.svg" alt="edit"  className="w-4 h-4" />
                </Button>
              </Link>
              <Link href={`/admin/requested-services/${item.id}`}>
                <Button variant="ghost" size="icon" className="h-9 w-9 bg-[#E5FBFF] hover:bg-[#BAE6FD] text-[#1298B2] rounded transition-colors">
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(item.id)}
                className="h-9 w-9 bg-red-2 hover:bg-[#FECACA] text-[#EF4444] rounded transition-colors"
              >
                <img src="/icons/dashboard/trash.svg" alt="delete" className="w-4 h-4" />
              </Button>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-[#F8F9FC]">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800">طلبات الخدمات الغير موجودة</h1>
        <p className="text-gray-500 text-sm">
          تتيح لك استعراض الطلبات المرسلة من المستخدمين مع إمكانية متابعة حالتها وإدارتها.
        </p>
      </div>


      <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex flex-wrap gap-4">
          {stats.map((stat) => {
            const isActive = activeTab === stat.id;
            return (
              <button
                key={stat.id}
                onClick={() => {
                  setActiveTab(stat.id as RequestedServiceStatus);
                  setPage(1);
                }}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 cursor-pointer ",
                )}
              >
                <span className={cn(
                  "px-3 rounded text-sm font-bold transition-colors",
                  isActive ? stat.bgActive : `bg-gray-50 ${stat.color}`
                )}>
                  {stat.count}
                </span>
                <span className={cn("font-bold text-sm", isActive ? "text-gray-800" : "text-gray-600")}>
                  {stat.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="relative w-full">
            <Input
              placeholder="ابحث باسم مقدم الخدمة"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pr-10 h-11 bg-white border-gray-200 focus:border-[#3A5779] transition-all rounded-lg w-full"
            />
            <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#EEF2F6] border-b border-gray-200">
              {renderTableHeader()}
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {renderTableBody()}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center mt-auto">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="حذف الطلب"
        description="هل أنت متأكد من رغبتك في حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
      />
    </div>
  );
}