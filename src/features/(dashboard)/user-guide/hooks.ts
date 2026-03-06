"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiQuery } from "@/src/hooks/use-api-query";
import {
    getVideos,
    getGuideVideoByLocation,
    getVideo,
    createVideo,
    updateVideo,
    deleteVideo,
    updateVideoStatus,
} from "./api";
import { VideoPayload } from "./types";
import { AxiosError } from "axios";

export const useGetVideos = (params?: URLSearchParams) => {
    return useApiQuery({
        queryKey: ["user-guide-videos", params?.toString()],
        queryFn: () => getVideos(params),
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
        onSuccess: (data) => {
            toast.success(data.message || "تم إضافة الفيديو بنجاح");
            queryClient.invalidateQueries({ queryKey: ["user-guide-videos"] });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء إضافة الفيديو");
        },
    });
};

export const useUpdateVideo = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: VideoPayload }) => updateVideo(id, payload),
        onSuccess: (data) => {
            toast.success(data.message || "تم تحديث الفيديو بنجاح");
            queryClient.invalidateQueries({ queryKey: ["user-guide-videos"] });
            queryClient.invalidateQueries({ queryKey: ["user-guide-video", data.record.id] });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث الفيديو");
        },
    });
};

export const useDeleteVideo = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteVideo(id),
        onSuccess: (data) => {
            toast.success(data.message || "تم حذف الفيديو بنجاح");
            queryClient.invalidateQueries({ queryKey: ["user-guide-videos"] });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف الفيديو");
        },
    });
};

export const useUpdateVideoStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, is_enabled }: { id: number; is_enabled: boolean }) => updateVideoStatus(id, is_enabled),
        onSuccess: (data) => {
            toast.success(data.message || "تم تحديث حالة الفيديو بنجاح");
            queryClient.invalidateQueries({ queryKey: ["user-guide-videos"] });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث الحالة");
        },
    });
};
