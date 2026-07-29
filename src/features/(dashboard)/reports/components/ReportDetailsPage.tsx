// src/features/(dashboard)/reports/components/ReportDetailsPage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/src/lib/date-helper";
import {
  User,
  Hash,
  Loader2,
  FileIcon,
  Paperclip,
  X
} from "lucide-react";
import { useGetSingleReport, useUpdateReportStatus, useDeleteReport, useUpdateReport, useAddReportResponse } from "../hooks";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Button } from "@/src/components/ui/button";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { MediaCenterModal } from "../../mediaCenter/components/MediaCenterModal";
import { MediaItem } from "../../mediaCenter/api";
import { cn } from "@/src/lib/utils";
import { ReportStatus } from "../api";

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
  processing: "bg-blue-100 text-blue-3 border-blue-200",
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
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<MediaFile[]>([]);
  const [prevReportId, setPrevReportId] = useState<number | null>(null);


  // Hooks
  const { data, isLoading } = useGetSingleReport(reportId);
  const { mutate: updateStatus } = useUpdateReportStatus();
  const { mutate: deleteReport } = useDeleteReport();
  const { mutate: updateReport } = useUpdateReport();
  const { mutate: addResponse, isPending: isSendingReply } = useAddReportResponse();

  const report = data?.record;

  if (report && report.id !== prevReportId) {
    setPrevReportId(report.id);
    if (report.media) {
      const mediaData = Array.isArray(report.media) ? report.media : [report.media];
      const mappedAttachments: MediaFile[] = mediaData.map((item, index) => {
        if (typeof item === 'string') {
          return {
            id: String(index),
            file_name: item.split('/').pop() || `attachment-${index}`,
            src: item,
            mime_type: item.match(/\.(jpeg|jpg|gif|png)$/i) ? 'image/jpeg' : 'application/pdf'
          };
        }
        return item as unknown as MediaFile;
      }).filter(Boolean);
      setAttachments(mappedAttachments);
    }
  }

  const breadcrumbItems = [
    { label: "الشكاوي", href: "/admin/all-reports" },
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
        router.push(`/admin/reports/${report?.store?.id || ""}`);
      },
    });
  };

  const handleAddAttachment = (files: MediaItem | MediaItem[]) => {
    // Handling selection from MediaCenter
    const newFiles = Array.isArray(files) ? files : [files];

    // Map MediaItem to MediaFile to match state structure
    const mappedFiles: MediaFile[] = newFiles.map(f => ({
      id: String(f.id),
      file_name: f.file_name,
      src: f.src || f.url,
      mime_type: f.file_type
    }));

    const updatedAttachments = [...attachments, ...mappedFiles];
    setAttachments(updatedAttachments);
    setShowMediaModal(false);

    // Optionally update the report immediately with new media
    // mapping to the structure expected by backend
    // This part depends on how your backend expects 'media' update
    if (report) {
      updateReport({
        id: reportId,
        payload: {
          ...report,
          // @ts-expect-error - media type expected by backend might differ from frontend state
          media: updatedAttachments.map(f => f.src) // Sending URLs or IDs
        }
      });
    }
  };

  const handleReplyFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReplyFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveReplyFile = (index: number) => {
    setReplyFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    addResponse({
      id: reportId,
      response_text: replyText,
      response_files: replyFiles
    }, {
      onSuccess: () => {
        setReplyText("");
        setReplyFiles([]);
      }
    });
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
      <main className="p-3 sm:p-4 bg-white rounded-lg">

        {/* --- Header Card --- */}
        <div className="bg-blue-6 rounded-md  p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-3 flex items-center gap-2 mb-4">
              شكوى رقم: {report.id}
            </h1>
            <div className="flex items-center flex-wrap gap-2 text-sm">
              <span className="text-gray-2 shrink-0">حاله الشكوى</span>
              <span className={cn("px-2 py-0.5 rounded-full text-xs border font-medium shrink-0", STATUS_STYLES[report.status])}>
                {STATUS_OPTIONS.find(o => o.value === report.status)?.label || report.status}
              </span>
              <span className="text-gray-2 shrink-0">نوع البلاغ:</span>
              <span className="font-medium shrink-0">{report.report_type?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 flex-wrap">
            <Button
              variant="destructive"
              onClick={() => setDeleteModalOpen(true)}
              className="bg-red-500 hover:bg-red-600 text-white flex-1 md:flex-none"
            >
              حذف الشكوى
            </Button>
            <div className="flex-1 md:w-40">
              <ReusableDropdown
                options={STATUS_OPTIONS}
                value={report.status}
                onChange={handleStatusChange}
                placeholder="تغيير الحالة"
                className="rounded-md w-full"
              />
            </div>
          </div>
        </div>

        {/* --- Details Body --- */}
        <div className=" p-4 sm:p-8 space-y-6">

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-6">

            {/* Row 1 */}
            <div className="flex max-sm:flex-col items-start sm:items-center justify-between border-b border-gray-100 pb-4 max-sm:gap-2">
              <div className="flex items-center gap-2 text-gray-2 sm:w-1/4 shrink-0">
                <img src="/icons/dashboard/mark2.svg" className="w-5" alt="" />
                <span>نوع الشكوى</span>
              </div>
              <div className="font-medium sm:w-3/4">
                {report.report_type?.name}
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex max-sm:flex-col items-start sm:items-center justify-between border-b border-gray-100 pb-4 max-sm:gap-2">
              <div className="flex items-center gap-2 text-gray-2 sm:w-1/4 shrink-0">
                <img src="/icons/dashboard/calender.svg" className="w-5" alt="" />
                <span>تاريخ الشكوى</span>
              </div>
              <div className="font-medium sm:w-3/4" >
                {formatDateTime(report.created_at)}
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex max-sm:flex-col items-start sm:items-center justify-between border-b border-gray-100 pb-4 max-sm:gap-2">
              <div className="flex items-center gap-2 text-gray-2 sm:w-1/4 shrink-0">
                <User className="w-5 h-5" />
                <span>العميل</span>
              </div>
              <div className="font-medium sm:w-3/4 flex items-center gap-2 cursor-pointer hover:underline" onClick={() => router.push(`/admin/users?userId=${report?.user?.id}`)}>
                <span>{report?.user?.fullname || "غير معروف"}</span>
              </div>
            </div>

            {/* Row 4 */}
            <div className="flex max-sm:flex-col items-start sm:items-center justify-between border-b border-gray-100 pb-4 max-sm:gap-2">
              <div className="flex items-center gap-2 text-gray-2 sm:w-1/4 shrink-0">
                <Hash className="w-5 h-5" />
                <span>رقم {report.product ? "المنتج" : "الطلب"}</span>
              </div>
              <div className="font-medium sm:w-3/4">
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
          <div className="flex max-sm:flex-col items-start sm:items-center border-t border-gray-100 pt-6 max-sm:gap-2">
            <div className="flex items-center gap-2 text-gray-2 sm:w-1/4 shrink-0">
              <img src="/icons/dashboard/gallery.svg" className="w-5" alt="" />
              <span>المرفقات</span>
            </div>

            <div className="sm:w-3/4 flex items-center justify-between w-full">
              <div className="flex items-center gap-3 flex-wrap">
                {attachments.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={file.file_name}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-200 transition-colors"
                  >
                    {file.mime_type?.includes('image') || file.src?.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                      <img src="/icons/dashboard/gallery.svg" className="w-4" alt="" />
                    ) : (
                      <FileIcon className="w-4 h-4 " />
                    )}
                    <span className="text-xs font-medium text-gray-2 max-w-[100px] truncate" dir="ltr">
                      {file.file_name || "مرفق"}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Reply Section or Response Details */}
          <div className="pt-6 border-t border-gray-100 space-y-6">
            {report.responses && report.responses.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800">الردود السابقة</h3>
                {report.responses.map((resp) => (
                  <div key={resp.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {resp.admin?.avatar_url ? (
                          <img src={resp.admin.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {resp.admin?.fullname?.charAt(0) || "-"}
                          </div>
                        )}
                        <span className="font-medium text-sm text-gray-700">{resp.admin?.fullname}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(resp.created_at)}
                      </span>
                    </div>

                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                      {resp.response_text}
                    </p>

                    {resp.response_files && resp.response_files.length > 0 && (
                      <div className="flex items-center gap-3 flex-wrap mt-4 border-t border-gray-200 pt-4">
                        {resp.response_files.map((fileUrl: string, idx: number) => (
                          <a
                            key={idx}
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            {fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                              <img src="/icons/dashboard/gallery.svg" className="w-4" alt="" />
                            ) : (
                              <FileIcon className="w-4 h-4 text-blue-3" />
                            )}
                            <span className="text-xs font-medium text-gray-600 max-w-[200px] truncate" dir="ltr">
                              {fileUrl.split('/').pop()}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Input Form for New Additions */}
            <div className="relative border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
              <textarea
                className="w-full h-32 p-4 resize-none outline-none text-sm placeholder:text-gray-400"
                placeholder="إضافة رد ....."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              ></textarea>

              {/* Selected Files for Reply */}
              {replyFiles.length > 0 && (
                <div className="px-4 pb-2 flex gap-2 flex-wrap">
                  {replyFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs border border-gray-200">
                      <span className="max-w-[150px] truncate">{file.name}</span>
                      <button onClick={() => handleRemoveReplyFile(i)} className="text-gray-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="reply-file-upload"
                    multiple
                    className="hidden"
                    onChange={handleReplyFileSelect}
                  />
                  <label
                    htmlFor="reply-file-upload"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 text-sm cursor-pointer transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span>ارفاق ملفات</span>
                  </label>
                </div>

                <Button
                  onClick={handleSendReply}
                  disabled={isSendingReply || !replyText.trim()}
                  className="bg-[#3A5779] hover:bg-[#2c4460] text-white px-6 h-9"
                >
                  {isSendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة"}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </main>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="هل أنت متأكد من حذف الشكوى؟"
        description="سيتم حذف الشكوى نهائياً ولا يمكن استرجاعها."
      />

      {
        showMediaModal && (
          <MediaCenterModal
            open={showMediaModal}
            onOpenChange={() => setShowMediaModal(false)}
            onSelect={handleAddAttachment}
            multiple={true} // Allow multiple selection
            allowedMediaTypes={["gallery"]} // Adjust based on your MediaCenter config
            selectionLimit={5}
          />
        )
      }

    </div >
  );
}