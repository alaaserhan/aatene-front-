"use client";

import { useState, useMemo } from "react";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { AddVideoModal, VideoFormData } from "./AddVideoModal";
import {
  useGetVideos,
  useCreateVideo,
  useUpdateVideo,
  useDeleteVideo,
  useUpdateVideoStatus,
} from "../hooks";
import { VideoPayload } from "../types";

export function UserGuidePage() {
  const [showModal, setShowModal] = useState(false);
  const [editVideoId, setEditVideoId] = useState<number | null>(null);
  const [editData, setEditData] = useState<VideoFormData | null>(null);
  const [deleteVideoId, setDeleteVideoId] = useState<number | null>(null);

  const queryParams = useMemo(() => new URLSearchParams(), []);

  const { data, isLoading, isError } = useGetVideos(queryParams);
  const { mutate: createVideo, isPending: isCreating } = useCreateVideo();
  const { mutate: updateVideo, isPending: isUpdating } = useUpdateVideo();
  const { mutate: deleteVideo } = useDeleteVideo();
  const { mutate: updateStatus } = useUpdateVideoStatus();

  const videos = data?.data || [];
  const stats = [
    { label: "إجمالي الفيديوهات", value: data?.recordsTotal ?? 0, icon: "/videos/Frame 2085664438.svg" },
    { label: "الفيديوهات النشطة", value: data?.active_count ?? 0, icon: "/videos/Frame 2085664438(1).svg" },
    { label: "إجمالي المشاهدات", value: data?.total_views ?? 0, icon: "/videos/Frame 2085664438(2).svg" },
  ];

  const handleAddVideo = () => {
    setEditData(null);
    setEditVideoId(null);
    setShowModal(true);
  };

  const handleEditVideo = (video: (typeof videos)[0]) => {
    setEditVideoId(video.id);
    setEditData({
      title: video.title,
      description: video.description,
      videoUrl: video.video_url,
      thumbnailUrl: video.thumbnail_url,
      videoSource: video.video_source,
      displayPages: video.display_pages,
      isEnabled: video.is_enabled,
    });
    setShowModal(true);
  };

  const handleSaveVideo = (formData: VideoFormData) => {
    const payload: VideoPayload = {
      title: formData.title,
      description: formData.description,
      video_url: formData.videoUrl,
      thumbnail_url: formData.thumbnailUrl,
      video_source: formData.videoSource,
      display_pages: formData.displayPages,
      is_enabled: formData.isEnabled,
      video_file: formData.uploadedFile ?? null,
      thumbnail_file: formData.uploadedThumbnail ?? null,
    };

    if (editVideoId !== null) {
      updateVideo({ id: editVideoId, payload }, { onSuccess: () => { setShowModal(false); setEditData(null); setEditVideoId(null); } });
    } else {
      createVideo(payload, { onSuccess: () => { setShowModal(false); } });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteVideoId !== null) {
      deleteVideo(deleteVideoId, { onSuccess: () => setDeleteVideoId(null) });
    }
  };

  const handleToggleStatus = (id: number, current: boolean) => {
    updateStatus({ id, is_enabled: !current });
  };

  return (
    <div className="p-3 sm:p-6 max-w-[1400px] mx-auto bg-transparent min-h-screen" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="text-right">
          <h1 className="text-xl sm:text-2xl font-bold text-[#2D496A]">دليل المستخدم</h1>
          <p className="text-xs sm:text-sm text-gray-2 mt-1">
            هو الجزء الذي يتم فيه إضافة الفيديوهات التعليمية التي تظهر للمستخدم لشرح كيفية التعامل مع الموقع.
          </p>
        </div>
        <button
          onClick={handleAddVideo}
          className="flex items-center gap-2 cursor-pointer px-4 sm:px-6 py-2 text-white rounded-[20px] font-medium text-sm sm:text-[15px] transition-colors hover:opacity-90 shrink-0"
          style={{ backgroundColor: "#2D496A" }}
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          إضافة فيديو جديد
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 border border-gray-100">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col justify-between min-h-[130px] sm:min-h-[150px]">
              <div className="flex justify-start w-full">
                <img src={stat.icon} alt={stat.label} className="w-12 h-12 sm:w-14 sm:h-14 object-contain opacity-90" />
              </div>
              <div className="flex flex-col gap-1 text-right mt-auto">
                <span className="text-xs sm:text-sm font-medium text-gray-400 mb-1">{stat.label}</span>
                <p className="text-2xl sm:text-[28px] font-bold text-[#222B45] leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div>
          {/* Header Row — hidden on mobile */}
          <div className="hidden md:flex items-center text-sm font-bold text-[#222B45] h-14 bg-gray-50 rounded-lg px-4 mb-3">
            <span className="w-[10%] text-right font-bold pr-2">كود الفيديو</span>
            <span className="w-[18%] text-right font-bold">عنوان الفيديو</span>
            <span className="w-[12%] text-right font-bold">مكان العرض</span>
            <span className="w-[16%] text-right font-bold">الحالة</span>
            <span className="w-[14%] text-right font-bold">عدد المشاهدات</span>
            <span className="w-[16%] text-right font-bold">تاريخ الإضافة</span>
            <span className="w-[14%] text-center font-bold">إجراءات</span>
          </div>

          {/* Body */}
          {isLoading ? (
            <div className="flex justify-center items-center gap-2 py-16">
              <Loader2 className="w-5 h-5 animate-spin text-[#2D496A]" />
              <span className="text-gray-400">جاري تحميل البيانات...</span>
            </div>
          ) : isError ? (
            <p className="text-center py-16 text-red-500">حدث خطأ أثناء جلب البيانات</p>
          ) : videos.length === 0 ? (
            <p className="text-center py-16 text-gray-400">لا توجد فيديوهات</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className={cn(index < videos.length - 1 ? "border-b border-gray-100" : "")}
                >
                  {/* Desktop Row */}
                  <div className={cn("hidden md:flex items-center text-sm transition-colors h-[72px] px-4")}>
                    <span className="w-[10%] text-gray-400 font-medium text-right pr-2">{video.code}</span>
                    <span className="w-[18%] text-[#222B45] font-semibold text-right">{video.title}</span>
                    <span className="w-[12%] text-[#5B7C93] text-right font-medium">{video.location}</span>
                    <div className="w-[16%] flex items-center gap-3 justify-start">
                      <ToggleSwitch enabled={video.is_enabled} onChange={() => handleToggleStatus(video.id, video.is_enabled)} />
                      <span className={cn("text-sm font-medium", video.is_enabled ? "text-[#2D496A]" : "text-gray-400")}>
                        {video.is_enabled ? "مفعّل" : "غير مفعّل"}
                      </span>
                    </div>
                    <div className="w-[14%] flex items-center gap-2 text-[#222B45] font-semibold justify-start pl-4">
                      <img src="/videos/iconamoon_eye-light.svg" alt="views" className="w-[18px] h-[18px] object-contain opacity-60" />
                      <span>{video.views}</span>
                    </div>
                    <div className="w-[16%] flex items-center text-[#222B45] text-[13px] font-medium justify-start opacity-90">
                      {video.created_at}
                    </div>
                    <div className="w-[14%] flex items-center gap-2 justify-end">
                      <button onClick={() => handleEditVideo(video)} className="cursor-pointer hover:opacity-80 transition-opacity">
                        <img src="/videos/Frame 1871278126.svg" alt="تعديل" className="w-8 h-8" />
                      </button>
                      <button onClick={() => setDeleteVideoId(video.id)} className="cursor-pointer hover:opacity-80 transition-opacity">
                        <img src="/videos/Frame 1871278125.svg" alt="حذف" className="w-8 h-8" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Card */}
                  <div className="flex md:hidden flex-col gap-2 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditVideo(video)} className="cursor-pointer hover:opacity-80 transition-opacity">
                          <img src="/videos/Frame 1871278126.svg" alt="تعديل" className="w-7 h-7" />
                        </button>
                        <button onClick={() => setDeleteVideoId(video.id)} className="cursor-pointer hover:opacity-80 transition-opacity">
                          <img src="/videos/Frame 1871278125.svg" alt="حذف" className="w-7 h-7" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-[#222B45] font-semibold text-sm">{video.title}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{video.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-50">
                      <div className="flex items-center gap-1">
                        <img src="/videos/iconamoon_eye-light.svg" alt="views" className="w-4 h-4 opacity-60" />
                        <span className="text-[#222B45] font-semibold">{video.views}</span>
                      </div>
                      <ToggleSwitch enabled={video.is_enabled} onChange={() => handleToggleStatus(video.id, video.is_enabled)} />
                      <span className="text-[#5B7C93]">{video.location}</span>
                    </div>
                    <p className="text-xs text-gray-400 text-right">{video.created_at}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddVideoModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditData(null); setEditVideoId(null); }}
        onSave={handleSaveVideo}
        editData={editData}
        isLoading={isCreating || isUpdating}
      />

      <ConfirmDeleteModal
        isOpen={deleteVideoId !== null}
        onClose={() => setDeleteVideoId(null)}
        onConfirm={handleConfirmDelete}
        title="هل أنت متأكد من حذف الفيديو؟"
        description="لا يمكن استرجاع الفيديو بعد حذفه"
        confirmText="نعم، قم بالحذف"
        cancelText="إلغاء"
      />
    </div>
  );
}
