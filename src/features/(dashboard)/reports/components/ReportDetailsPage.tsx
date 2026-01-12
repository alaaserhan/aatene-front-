// src/features/(dashboard)/reports/components/ReportDetailsPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import {
  Calendar,
  User,
  Tag,
  Hash,
  Paperclip,
  FileText,
  Loader2,
  Trash2,
  Plus,
  ImageIcon,
  FileIcon
} from "lucide-react";
import { useGetSingleReport, useUpdateReportStatus, useDeleteReport, useUpdateReport } from "../hooks";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Button } from "@/src/components/ui/button";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { MediaCenterModal } from "../../mediaCenter/components/MediaCenterModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { cn } from "@/src/lib/utils";
import { ReportStatus } from "../api";
import { toast } from "sonner";

interface ReportDetailsPageProps {
  reportId: string;
}

const STATUS_OPTIONS = [
  { label: "تحت المراجعة", value: "pending" },
  { label: "قيد المعالجة", value: "processing" },
  { label: "تم الحل", value: "finished" },
  { label: "ملغي", value: "cancelled" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-red-100 text-red-600 border-red-200",
  processing: "bg-blue-100 text-blue-600 border-blue-200",
  finished: "bg-green-100 text-green-600 border-green-200",
  cancelled: "bg-gray-100 text-gray-2 border-gray-200",
};

interface MediaFile {
  id?: string;
  file_name: string;
  src: string;
  mime_type?: string;
}

export function ReportDetailsPage({ reportId }: ReportDetailsPageProps) {
  const router = useRouter();

  // States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [attachments, setAttachments] = useState<MediaFile[]>([]);

  // Hooks
  const { data, isLoading, refetch } = useGetSingleReport(reportId);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateReportStatus();
  const { mutate: deleteReport, isPending: isDeleting } = useDeleteReport();
  const { mutate: updateReport, isPending: isUpdatingReport } = useUpdateReport();

  const report = data?.record;

  useEffect(() => {
    if (report?.media) {
      // Assuming media comes as array or single object, normalizing it for UI
      const mediaData = Array.isArray(report.media) ? report.media : [report.media];
      // Filter out nulls if any
      setAttachments(mediaData.filter(Boolean));
    }
  }, [report]);

  const breadcrumbItems = [
    { label: "الشكاوي", href: "/admin/reports" },
    { label: "بلاغات الزبائن", href: "/admin/reports" },
    { label: `#${reportId}` },
  ];

  const handleStatusChange = (newStatus: string) => {
    updateStatus({
      id: reportId,
      payload: { status: newStatus as ReportStatus },
    });
  };

  const handleDelete = () => {
    deleteReport(reportId, {
      onSuccess: () => {
        router.push(`/admin/serviceProviders/reports/${report?.store.id || ""}`);
      },
    });
  };

  const handleAddAttachment = (files: any) => {
    // Handling selection from MediaCenter
    const newFiles = Array.isArray(files) ? files : [files];
    const updatedAttachments = [...attachments, ...newFiles];
    setAttachments(updatedAttachments);
    setShowMediaModal(false);

    // Optionally update the report immediately with new media
    // mapping to the structure expected by backend
    // This part depends on how your backend expects 'media' update
    updateReport({
      id: reportId,
      payload: {
        ...report,
        // @ts-ignore
        media: updatedAttachments.map(f => f.src) // Sending URLs or IDs
      }
    });
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    // Implement send reply logic here, or map it to updateReport content if that's the intention
    toast.success("تم إرسال الرد بنجاح (محاكاة)");
    setReplyText("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#3A5779] animate-spin" />
      </div>
    );
  }

  if (!report) return <div>التقرير غير موجود</div>;

  return (
    <div className="p-4">
      <Breadcrumb items={breadcrumbItems} className="mb-4" />
      <main className="p-4 bg-white rounded-lg">

        {/* --- Header Card --- */}
        <div className="bg-blue-6 rounded-md  p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-3  flex items-center gap-2 mb-4">
              شكوى رقم: {report.id}
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-2">حاله الشكوى</span>
              <span className={cn("px-2 py-0.5 rounded-full  text-xs border font-medium", STATUS_STYLES[report.status])}>
                {STATUS_OPTIONS.find(o => o.value === report.status)?.label || report.status}
              </span>
              <span className="text-gray-2">نوع البلاغ:</span>
              <span className="font-medium ">{report.report_type?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ReusableDropdown
              options={STATUS_OPTIONS}
              value={report.status}
              onChange={handleStatusChange}
              placeholder="تغيير الحالة"
              className="rounded-md w-40"
            />
            <Button
              variant="destructive"
              onClick={() => setDeleteModalOpen(true)}
              className="bg-red-500 hover:bg-red-600 text-white "
            >
              حذف الشكوى
            </Button>
          </div>
        </div>

        {/* --- Details Body --- */}
        <div className=" p-8 space-y-6">

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-6">

            {/* Row 1 */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 text-gray-2 w-1/5">
                <img src="/icons/dashboard/mark2.svg" className="w-5" alt="" />
                <span>نوع الشكوى</span>
              </div>
              <div className=" font-medium w-4/5 ">
                {report.report_type?.name}
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 text-gray-2 w-1/5">
                <img src="/icons/dashboard/calender.svg" className="w-5" alt="" />
                <span>تاريخ الشكوى</span>
              </div>
              <div className=" font-medium w-4/5 " >
                {format(new Date(report.created_at), "yyyy-MM-dd HH:mm:ss")}
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 text-gray-2 w-1/5">
                <User className="w-5 h-5" />
                <span>العميل</span>
              </div>
              <div className=" font-medium w-4/5  flex items-center gap-2 cursor-pointer hover:text-blue-600" onClick={() => router.push(`/admin/users?userId=${report.user.id}`)}>
                <span>{report.user.fullname}</span>
              </div>
            </div>

            {/* Row 4 */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 text-gray-2 w-1/5">
                <Hash className="w-5 h-5" />
                <span>رقم {report.product ? "المنتج" : "الطلب"}</span>
              </div>
              <div className=" font-medium w-4/5 ">
                {report.product?.id || report.id}
              </div>
            </div>

          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="text-sm text-gray-2 font-medium mb-2">وصف المشكلة</h3>
            <div className=" p-4 rounded-lg border border-gray-100  leading-relaxed min-h-[100px]">
              {report.content || "لا يوجد وصف متاح لهذه المشكلة."}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="flex items-center  border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2 text-gray-2 w-1/5">
              <img src="/icons/dashboard/gallery.svg" className="w-5" alt="" />
              <span>المرفقات</span>
            </div>

            <div className="w-4/5 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-wrap  ">
                {attachments.map((file, idx) => (
                  <div key={idx} title={file.file_name} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                    {file.mime_type?.includes('image') || file.src?.match(/\.(jpeg|jpg|gif|png)$/) ? (
                      <img src="/icons/dashboard/gallery.svg" className="w-4" alt="" />
                    ) : (
                      <FileIcon className="w-4 h-4 " />
                    )}
                    <span className="text-xs font-medium text-gray-2  max-w-[100px] truncate" dir="ltr">
                      {file.file_name || "مرفق"}
                    </span>
                  </div>
                ))}
              </div>

              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMediaModal(true)}
                className="gap-2 bg-gray-50 hover:bg-gray-100 border-dashed border-gray-300 text-gray-2 rounded-full px-4"
              >
                <Plus className="w-4 h-4" />
                ارفاق ملفات
              </Button> */}
            </div>
          </div>





          {/* Reply Section (Visual Placeholder based on UI) */}
          {/* <div className="pt-6 border-t border-gray-100">
            <div className="relative">
              <textarea
                className="w-full h-32 p-4 bg-white border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-sm"
                placeholder="اضافة رد ....."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              ></textarea>
              <div className="absolute bottom-4 left-4">
                <Button
                  onClick={handleSendReply}
                  className="bg-[#3A5779] hover:bg-[#2c4460] text-white px-6"
                >
                  اضافة
                </Button>
              </div>
            </div>
          </div> */}

        </div>
      </main>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="هل أنت متأكد من حذف الشكوى؟"
        description="سيتم حذف الشكوى نهائياً ولا يمكن استرجاعها."
      />

      {showMediaModal && (
        <MediaCenterModal
          open={showMediaModal}
          onOpenChange={() => setShowMediaModal(false)}
          onSelect={handleAddAttachment}
          multiple={true} // Allow multiple selection
          allowedMediaTypes={["image", "gallery"]} // Adjust based on your MediaCenter config
          selectionLimit={5}
        />
      )}

    </div>
  );
}