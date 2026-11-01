// src/features/(dashboard)/stories/hooks.ts
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import * as api from "./api";
import { toast } from "sonner";

export function useGetStories(storeId?: number | string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["stories", storeId],
    queryFn: () => api.getStories(storeId),
    ...options,
  });
}

/**
 * Plays the active story video with sound. `activeVideoKey` is the active
 * story's id while it is a video in an open viewer, otherwise null.
 * Browsers can still refuse unmuted playback (iOS Safari when play() isn't
 * called inside the tap handler), so on NotAllowedError it falls back to muted
 * and leaves the sound to the toggle.
 */
export function useStoryVideoPlayback(activeVideoKey: number | string | null, isPaused: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (activeVideoKey == null || !video) return;

    video.currentTime = 0;
    video.play().catch((err: unknown) => {
      if (!(err instanceof DOMException) || err.name !== "NotAllowedError") return;
      video.muted = true;
      setIsMuted(true);
      video.play().catch(() => {});
    });

    // The previous story's element stays mounted as an inactive card, so it
    // has to be stopped or its audio keeps playing behind the next story.
    return () => video.pause();
  }, [activeVideoKey]);

  useEffect(() => {
    const video = videoRef.current;
    if (!isPaused || !video) return;

    video.pause();
    return () => {
      // Only resume the story we paused: when unpausing comes with a move to
      // another story, the ref already points at the new one, which plays itself.
      if (video.isConnected && video === videoRef.current) video.play().catch(() => {});
    };
  }, [isPaused]);

  const toggleMute = () => {
    const video = videoRef.current;
    const next = !isMuted;
    if (video) {
      // Set on the element inside the click handler, so iOS counts it as a user gesture.
      video.muted = next;
      if (video.paused) video.play().catch(() => {});
    }
    setIsMuted(next);
  };

  return { videoRef, isMuted, toggleMute };
}

export function useGetSingleStory(id: number | string, storeId?: number | string) {
  return useQuery({
    queryKey: ["stories", id, storeId],
    queryFn: () => api.getSingleStory(id, storeId),
    enabled: !!id,
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createStory,
    onSuccess: () => {
      toast.success("تم إنشاء القصة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الإنشاء");
    },
  });
}

export function useUpdateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateStory,
    onSuccess: (data) => {
      toast.success(data.message || "تم تعديل القصة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء التعديل");
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteStory,
    onSuccess: (data) => {
      toast.success(data.message || "تم حذف القصة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحذف");
    },
  });
}

export function useGetHighlights(storeId?: number | string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["highlights", storeId],
    queryFn: () => api.getHighlights(storeId),
    ...options,
  });
}

export function useGetSingleHighlight(id: number | string, storeId?: number | string) {
  return useQuery({
    queryKey: ["highlights", id, storeId],
    queryFn: () => api.getSingleHighlight(id, storeId),
    enabled: !!id,
  });
}

export function useCreateHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createHighlight,
    onSuccess: (data) => {
      toast.success(data.message || "تم إنشاء الهايلايت بنجاح");
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الإنشاء");
    },
  });
}

export function useUpdateHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateHighlight,
    onSuccess: (data) => {
      toast.success(data.message || "تم تعديل الهايلايت بنجاح");
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء التعديل");
    },
  });
}

export function useDeleteHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteHighlight,
    onSuccess: (data) => {
      toast.success(data.message || "تم حذف الهايلايت بنجاح");
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحذف");
    },
  });
}