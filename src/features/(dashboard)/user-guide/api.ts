// TODO: Re-enable API calls once backend endpoints are ready
// import api from "@/src/lib/axios";
import {
    VideosResponse,
    SingleVideoResponse,
    VideoPayload,
    BaseResponse,
} from "./types";


// Remove this block and uncomment the real implementations below when ready.

const MOCK_VIDEOS_RESPONSE: VideosResponse = {
    status: true,
    message: "ok",
    recordsTotal: 0,
    recordsFiltered: 0,
    active_count: 0,
    total_views: 0,
    data: [],
};

const MOCK_SINGLE_RESPONSE: SingleVideoResponse = {
    status: false,
    message: "not available",
    record: null as never,
};

const MOCK_BASE_RESPONSE: BaseResponse = {
    status: true,
    message: "ok",
};

export const getVideos = async (_params?: URLSearchParams): Promise<VideosResponse> => {
    return MOCK_VIDEOS_RESPONSE;
};

export const getGuideVideoByLocation = async (_location: string): Promise<SingleVideoResponse> => {
    return MOCK_SINGLE_RESPONSE;
};

export const getVideo = async (_id: number): Promise<SingleVideoResponse> => {
    return MOCK_SINGLE_RESPONSE;
};

export const createVideo = async (_payload: VideoPayload): Promise<SingleVideoResponse> => {
    return MOCK_SINGLE_RESPONSE;
};

export const updateVideo = async (_id: number, _payload: VideoPayload): Promise<SingleVideoResponse> => {
    return MOCK_SINGLE_RESPONSE;
};

export const deleteVideo = async (_id: number): Promise<BaseResponse> => {
    return MOCK_BASE_RESPONSE;
};

export const updateVideoStatus = async (_id: number, _is_enabled: boolean): Promise<BaseResponse> => {
    return MOCK_BASE_RESPONSE;
};

// ---- real implemtaion whn it come  #uncomment ) ----
/*
import api from "@/src/lib/axios";

function buildPayload(payload: VideoPayload): FormData | Record<string, unknown> {
    const hasFiles = !!payload.video_file || !!payload.thumbnail_file;

    if (hasFiles) {
        const fd = new FormData();
        fd.append("title", payload.title);
        fd.append("description", payload.description);
        fd.append("video_source", payload.video_source);
        fd.append("is_enabled", payload.is_enabled ? "1" : "0");
        payload.display_pages.forEach((p) => fd.append("display_pages[]", p));

        if (payload.video_file) {
            fd.append("video_file", payload.video_file);
        } else if (payload.video_url) {
            fd.append("video_url", payload.video_url);
        }

        if (payload.thumbnail_file) {
            fd.append("thumbnail_file", payload.thumbnail_file);
        } else if (payload.thumbnail_url) {
            fd.append("thumbnail_url", payload.thumbnail_url);
        }

        return fd;
    }

    return {
        title: payload.title,
        description: payload.description,
        video_url: payload.video_url,
        thumbnail_url: payload.thumbnail_url,
        video_source: payload.video_source,
        display_pages: payload.display_pages,
        is_enabled: payload.is_enabled,
    };
}

export const getVideos = async (params?: URLSearchParams): Promise<VideosResponse> => {
    const { data } = await api.get<VideosResponse>("/admin/user-guide/videos", { params });
    return data;
};

export const getGuideVideoByLocation = async (location: string): Promise<SingleVideoResponse> => {
    const { data } = await api.get<SingleVideoResponse>(`/admin/user-guide/videos/location/${location}`);
    return data;
};

export const getVideo = async (id: number): Promise<SingleVideoResponse> => {
    const { data } = await api.get<SingleVideoResponse>(`/admin/user-guide/videos/${id}`);
    return data;
};

export const createVideo = async (payload: VideoPayload): Promise<SingleVideoResponse> => {
    const body = buildPayload(payload);
    const isFormData = body instanceof FormData;
    const { data } = await api.post<SingleVideoResponse>("/admin/user-guide/videos", body, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return data;
};

export const updateVideo = async (id: number, payload: VideoPayload): Promise<SingleVideoResponse> => {
    const body = buildPayload(payload);
    const isFormData = body instanceof FormData;
    if (isFormData) {
        body.append("_method", "PUT");
    }
    const { data } = await api.post<SingleVideoResponse>(`/admin/user-guide/videos/${id}`, body, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return data;
};

export const deleteVideo = async (id: number): Promise<BaseResponse> => {
    const { data } = await api.delete<BaseResponse>(`/admin/user-guide/videos/${id}`);
    return data;
};

export const updateVideoStatus = async (id: number, is_enabled: boolean): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>(`/admin/user-guide/videos/${id}/update-status`, { is_enabled });
    return data;
};
*/
