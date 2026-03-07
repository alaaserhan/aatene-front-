"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiQuery } from "@/src/hooks/use-api-query";
import {
    getVideos,
    getStats,
    getGuideVideoByLocation,
    getVideo,
    createVideo,
    updateVideo,
    deleteVideo,
    updateVideoStatus,
} from "./api";
import { VideoPayload } from "./types";

// Helper: معالجة أخطاء إضافة/تحديث الفيديو (تجنب التكرار)
function handleVideoMutationError(error: any, defaultMessage: string) {
    const errorMessage = error?.response?.data?.message || "";
    const errors = error?.response?.data?.errors;
    
    // استخراج أول رسالة خطأ من errors object
    let firstError = "";
    if (errors && typeof errors === "object") {
        const firstKey = Object.keys(errors)[0];
        if (firstKey) {
            const errorValue = errors[firstKey];
            firstError = Array.isArray(errorValue) ? errorValue[0] : errorValue;
        }
    }
    
    // تحقق من نوع الخطأ
    const combinedMessage = errorMessage + " " + firstError;
    if (
        combinedMessage.includes("use case") || 
        combinedMessage.includes("unique") || 
        combinedMessage.includes("موجود") || 
        combinedMessage.includes("exists") || 
        combinedMessage.includes("محذوف") || 
        combinedMessage.includes("trashed") || 
        combinedMessage.includes("deleted") || 
        combinedMessage.includes("display_pages")
    ) {
        toast.error(
            "موقع العرض المُختار مستخدم بالفعل في فيديو آخر. إذا كان الفيديو محذوفاً، اذهب لصفحة المحذوفات واحذفه نهائياً أولاً", 
            { duration: 5000 }
        );
    } else {
        toast.error(firstError || errorMessage || defaultMessage);
    }
}

export const useGetVideos = (params?: URLSearchParams) => {
    return useApiQuery({
        queryKey: ["user-guide-videos", params?.toString()],
        queryFn: () => getVideos(params),
        
        refetchOnWindowFocus: true,
        staleTime: 0,
    });
};

export const useGetStats = () => {
    return useApiQuery({
        queryKey: ["user-guide-stats"],
        queryFn: () => getStats(),
    });
};

export const useGetGuideVideoByLocation = (location: string) => {
    return useApiQuery({
        queryKey: ["user-guide-video-location", location],
        queryFn: () => getGuideVideoByLocation(location),
        enabled: !!location,
    });
};

export const useGetVideo = (id: number) => {
    return useApiQuery({
        queryKey: ["user-guide-video", id],
        queryFn: () => getVideo(id),
        enabled: !!id,
    });
};

export const useCreateVideo = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: VideoPayload) => createVideo(payload),
        onSuccess: () => {
            toast.success("تم إضافة الفيديو بنجاح");
            queryClient.invalidateQueries({ queryKey: ["user-guide-videos"] });
            queryClient.invalidateQueries({ queryKey: ["user-guide-stats"] });
        },
        onError: (error: any) => {
            handleVideoMutationError(error, "حدث خطأ أثناء إضافة الفيديو، يرجى المحاولة مرة أخرى");
        },
    });
};

export const useUpdateVideo = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: VideoPayload }) => updateVideo(id, payload),
        onSuccess: (data) => {
            toast.success("تم تحديث الفيديو بنجاح");
            queryClient.invalidateQueries({ queryKey: ["user-guide-videos"] });
            queryClient.invalidateQueries({ queryKey: ["user-guide-stats"] });
            queryClient.invalidateQueries({ queryKey: ["user-guide-video", data.record.id] });
        },
        onError: (error: any) => {
            handleVideoMutationError(error, "حدث خطأ أثناء تحديث الفيديو، يرجى المحاولة مرة أخرى");
        },
    });
};

export const useDeleteVideo = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteVideo(id),
        onSuccess: () => {
            toast.success("تم حذف الفيديو بنجاح");
            queryClient.invalidateQueries({ queryKey: ["user-guide-videos"] });
            queryClient.invalidateQueries({ queryKey: ["user-guide-stats"] });
        },
        onError: () => {
            toast.error("حدث خطأ أثناء حذف الفيديو، يرجى المحاولة مرة أخرى");
        },
    });
};

export const useUpdateVideoStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, is_enabled }: { id: number; is_enabled: boolean }) => updateVideoStatus(id, is_enabled),
        onSuccess: (_data, variables) => {
            toast.success(variables.is_enabled ? "تم تفعيل الفيديو" : "تم إيقاف الفيديو");
            queryClient.invalidateQueries({ queryKey: ["user-guide-videos"] });
            queryClient.invalidateQueries({ queryKey: ["user-guide-stats"] });
        },
        onError: () => {
            toast.error("حدث خطأ أثناء تحديث حالة الفيديو");
        },
    });
};
