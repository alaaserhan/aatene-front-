
import api from "@/src/lib/axios";
import { BaseResponse } from "../settings/api";

// --- Types ---

export interface ReportType {
    id: number;
    name: string;
    category: string;
    is_active: boolean;
}

export interface GetReportTypesResponse extends BaseResponse {
    report_types: ReportType[];
}

export interface CreateReportPayload {
    report_type_id: number;
    store_id?: number | null;
    product_id?: number | null;
    comment_id?: number | null;
    requested_service_id?: number | null;
    service_id?: number | null;
    service_board_question_id?: number | null;
    service_board_answer_id?: number | null;
    user_id?: number | null;
    content: string;
}

export interface ReportUser {
    id: number;
    fullname: string;
    avatar: string | null;
    email: string;
    phone: string;
    is_active: string;
    gender: string;
    referral_code: string | null;
    last_login_at: string;
    followers_count: number;
    followings_count: number;
    bio: string | null;
    date_of_birth: string | null;
    user_type: string;
    avatar_url?: string | null;
    cover?: string | null;
    cover_url?: string | null;
    is_banned?: boolean;
    favs_count?: number;
    review_rate?: string | null;
    review_count?: string | null;
    is_following?: boolean;
}

export interface ReportProduct { // Simplified based on example, can be expanded if shared type exists
    id: number;
    slug: string | null;
    name: string;
    description: string;
    short_description: string | null;
    cover: string | null;
    shown: boolean;
    is_favorite: boolean;
    in_compare: boolean;
    price: string;
    price_after_discount: string;
    discount_present: number;
    review_rate: string | null;
    review_count: string | null;
}

export interface ReportStore {
    id: number;
    slug: string;
    name: string;
    status: string;
    phone: string | null;
    whats_app: string | null;
    email: string | null;
    address: string | null;
    lat: string | null;
    lng: string | null;
    type: string;
    logo: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cover: any[];
    review_rate: string;
    review_count: string;
    open_status: string;
    am_i_following: boolean;
    is_favorite: boolean;
    view_count: number;
    created_at: string;
    updated_at: string;
}

export interface ReportService {
    id: number;
    title: string;
    slug: string;
}

export interface ReportComment {
    id: number;
    content: string;
    rate?: string;
}

export interface ReportBoardQuestion {
    id: number;
    content: string;
}

export interface ReportBoardAnswer {
    id: number;
    content: string;
}

export interface ReportResponseItem {
    id: number;
    admin: {
        id: number;
        slug: string;
        fullname: string;
        avatar: string | null;
        avatar_url: string | null;
        cover: string | null;
        cover_url: string | null;
        email: string;
        phone: string;
    } | null;
    response_text: string;
    response_files: string[];
    created_at: string;
}

export interface ReportRecord {
    id: number;
    uuid: string;
    report_type: {
        id: number;
        name: string;
    };
    status: "pending" | "processing" | "finished" | "cancelled" | string;
    store: ReportStore | null;
    product: ReportProduct | null;
    requested_service: Record<string, unknown> | null;
    service: ReportService | null;
    comment: ReportComment | null;
    board_question: ReportBoardQuestion | null;
    board_answer: ReportBoardAnswer | null;
    user: ReportUser;
    media: string[];
    content: string;
    response_text: string | null;
    responded_at: string | null;
    responses?: ReportResponseItem[];
    created_at: string;
    updated_at: string;
}

export interface CreateReportResponse extends BaseResponse {
    record: ReportRecord;
}

export interface ReportStats {
    total: number;
    by_status: {
        pending: number;
        processing: number;
        finished: number;
        cancelled: number;
    };
}

export interface GetReportStatsResponse extends BaseResponse, ReportStats { }

export interface GetReportsParams {
    report_type_id?: number;
    content?: string;
    type?: string;
    status?: "pending" | "processing" | "finished" | "cancelled";
}

export interface GetReportsResponse extends BaseResponse {
    total: number;
    reports: ReportRecord[];
}

export interface GetSingleReportResponse extends BaseResponse {
    record: ReportRecord; // Assuming 'record' key based on create response, or it might be directly the object or 'report'
}


// --- API Functions ---

// 1. Get Report Types
export const getReportTypes = async (): Promise<GetReportTypesResponse> => {
    const { data } = await api.get<GetReportTypesResponse>("/report-types");
    return data;
};

// 2. Add New Report
export const createReport = async (payload: CreateReportPayload): Promise<CreateReportResponse> => {
    const { data } = await api.post<CreateReportResponse>("/reports", payload);
    return data;
};

// 3. Get Report Stats
export const getReportStats = async (): Promise<GetReportStatsResponse> => {
    const { data } = await api.get<GetReportStatsResponse>("/reports/my/stats");
    return data;
};

// 4. Get Reports List
export const getReports = async (params?: GetReportsParams): Promise<GetReportsResponse> => {
    const { data } = await api.get<GetReportsResponse>("/reports/my", { params });
    return data;
};

// 5. Get Single Report
export const getSingleReport = async (uuid: string): Promise<ReportRecord> => {
    // Note: Response structure wasn't provided for this specific endpoint in example, 
    // but usually it returns the object directly or wrapped. 
    // I'll assume it returns the data which *contains* the record or IS the record.
    // Based on list item structure, I'll return the ReportRecord.
    // Use 'any' cast if wrapper is unknown, but aiming for ReportRecord.
    const { data } = await api.get<any>(`/reports/my/${uuid}`);
    return data?.record || data;
};
