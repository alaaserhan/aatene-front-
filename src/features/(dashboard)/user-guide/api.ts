import api from "@/src/lib/axios";
import {
    Video,
    VideosResponse,
    SingleVideoResponse,
    StatsResponse,
    VideoPayload,
    BaseResponse,
} from "./types";

// Helper: رفع ملف للـ Media Center
export const uploadToMediaCenter = async (file: File, type: "image" | "media"): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    const { data } = await api.post<{ status: boolean; data: { file_name: string } }>(
        "/media-center/add-new",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    
    const baseURL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://aatene.dev/api")
        .replace(/\/api$/, "");
    return `${baseURL}/storage/${data.data.file_name}`;
};

// Helper: رفع الملفات (الفيديو والصورة المصغرة) إذا كانت موجودة
async function uploadFilesIfNeeded(payload: VideoPayload): Promise<{ videoUrl: string; imageUrl: string }> {
    let imageUrl = payload.thumbnail_url;
    if (payload.thumbnail_file) {
        imageUrl = await uploadToMediaCenter(payload.thumbnail_file, "image");
    }

    let videoUrl = payload.video_url;
    if (payload.video_file) {
        videoUrl = await uploadToMediaCenter(payload.video_file, "media");
    }

    return { videoUrl, imageUrl };
}

// Helper: تحويل البيانات من الباك لصيغة الفرونت
function mapVideo(raw: Record<string, unknown>): Video {
    return {
        id:            raw.id as number,
        title:         (raw.title as string) ?? "",
        description:   (raw.description as string) ?? "",          
        video_url:     (raw.video_url as string) ?? "",
        thumbnail_url: (raw.image_url as string) ?? "",            
        video_source:  "link",                                     
        display_pages: raw.use_case ? [(raw.use_case as string)] : [],
        is_enabled:    Boolean(raw.is_active),                     
        views:         (raw.view_count as number) ?? 0,            
        created_at:    (raw.created_at as string) ?? "",
        location:      (raw.use_case as string) ?? "",             
    };
}

// Helper: تحويل البيانات من الفرونت لصيغة الباك
function buildPayload(payload: VideoPayload): Record<string, unknown> {
    return {
        title:       payload.title,
        description: payload.description,
        video_url:   payload.video_url,
        image_url:   payload.thumbnail_url,                          
        use_case:    payload.display_pages[0] ?? "",                 
        is_active:   payload.is_enabled ? 1 : 0,                    
    };
}

export const getVideos = async (params?: URLSearchParams): Promise<VideosResponse> => {
    const { data } = await api.get<{ status: boolean; message: string; recordsTotal: number; recordsFiltered: number; data: Record<string, unknown>[] }>(
        "/admin/user-guide-videos",
        { params }
    );
    return {
        status:          data.status,
        message:         data.message,
        recordsTotal:    data.recordsTotal,
        recordsFiltered: data.recordsFiltered,
        
        active_count: 0,
        total_views:  0,
        data: data.data.map(mapVideo),
    };
};

export const getStats = async (): Promise<StatsResponse> => {
    const { data } = await api.get<StatsResponse>("/admin/user-guide-videos/stats");
    return data;
};

export const getGuideVideoByLocation = async (location: string): Promise<SingleVideoResponse> => {
    try {
        const { data } = await api.get<{ status: boolean; message: string; record: Record<string, unknown> | null }>(
            "/merchants/user-guide-videos",
            {
                params: { use_case: location },
                // x-silent: يخبر axios interceptor بعدم عرض toast عند الخطأ لهذا الطلب
                headers: { "x-silent": "true" },
            }
        );
        return {
            status:  data.status,
            message: data.message,
            record:  data.record ? mapVideo(data.record) : null as never,
        };
    } catch {
        // 404/422 = لا يوجد فيديو لهذا المكان أو غير مفعّل → نرجع null بصمت
        return { status: false, message: "not found", record: null as never };
    }
};

export const getVideo = async (id: number): Promise<SingleVideoResponse> => {
    const { data } = await api.get<{ status: boolean; message: string; record: Record<string, unknown> }>(
        `/admin/user-guide-videos/${id}`
    );
    return {
        status:  data.status,
        message: data.message,
        record:  mapVideo(data.record),
    };
};

export const createVideo = async (payload: VideoPayload): Promise<SingleVideoResponse> => {
    const { videoUrl, imageUrl } = await uploadFilesIfNeeded(payload);
    const body = buildPayload({ ...payload, thumbnail_url: imageUrl, video_url: videoUrl });
    
    const { data } = await api.post<{ status: boolean; message: string; record: Record<string, unknown> }>(
        "/admin/user-guide-videos",
        body,
        { headers: { "x-silent": "true" } }
    );
    
    return {
        status:  data.status,
        message: data.message,
        record:  mapVideo(data.record),
    };
};

export const updateVideo = async (id: number, payload: VideoPayload): Promise<SingleVideoResponse> => {
    const { videoUrl, imageUrl } = await uploadFilesIfNeeded(payload);
    const body = buildPayload({ ...payload, thumbnail_url: imageUrl, video_url: videoUrl });
    
    const { data } = await api.post<{ status: boolean; message: string; record: Record<string, unknown> }>(
        `/admin/user-guide-videos/${id}`,
        body,
        { headers: { "x-silent": "true" } }
    );
    
    return {
        status:  data.status,
        message: data.message,
        record:  mapVideo(data.record),
    };
};

export const deleteVideo = async (id: number): Promise<BaseResponse> => {
    const { data } = await api.delete<BaseResponse>(`/admin/user-guide-videos/${id}`);
    return data;
};

export const updateVideoStatus = async (id: number, is_enabled: boolean): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>(
        `/admin/user-guide-videos/${id}/update-status`,
        { is_active: is_enabled ? 1 : 0 }                          
    );
    return data;
};
