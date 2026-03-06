export interface Video {
    id: number;
    code: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    video_source: "link" | "upload";
    display_pages: string[];
    is_enabled: boolean;
    views: number;
    created_at: string;
    location?: string;
}

export interface VideoPayload {
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    video_source: "link" | "upload";
    display_pages: string[];
    is_enabled: boolean;
    // File fields – only used when video_source === "upload"
    video_file?: File | null;
    thumbnail_file?: File | null;
}

export interface BaseResponse {
    status: boolean;
    message: string;
}

export interface VideosResponse extends BaseResponse {
    recordsTotal: number;
    recordsFiltered: number;
    active_count: number;
    total_views: number;
    data: Video[];
}

export interface SingleVideoResponse extends BaseResponse {
    record: Video;
}
