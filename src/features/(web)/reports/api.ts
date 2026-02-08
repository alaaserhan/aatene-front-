
import api from "@/src/lib/axios";
import { BaseResponse } from "../settings/api";

// --- Types ---

export interface ReportType {
    id: number;
    name: string;
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

export interface ReportRecord {
    id: number;
    uuid: string;
    report_type: {
        id: number;
        name: string;
    };
    status: "pending" | "processing" | "finished" | "cancelled";
    store: any | null; // Placeholder as example is null
    product: ReportProduct | null;
    requested_service: any | null;
    service: any | null;
    user: ReportUser;
    media: any[];
    content: string;
    response_text: string | null;
    responded_at: string | null;
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
