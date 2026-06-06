// src/features/(dashboard)/reports/api.ts
import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import { Product } from "../products/api";

// ============== Types & Interfaces ==============

export type ReportStatus = "pending" | "processing" | "finished" | "cancelled";

// Used inside the Report object
export interface ReportType {
  id: number;
  name: string;
}

// Used for the /report-types endpoint (Full details)
export interface ReportTypeDetail {
  id: number;
  name: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
}

export interface User {
  id: number;
  fullname: string;
  avatar: string | null;
  email: string;
  phone: string | null;
  user_type?: string;
}

export interface ReportResponse {
  id: number;
  response_text: string;
  response_files: string[];
  admin: {
    id: number;
    fullname: string;
    avatar_url: string | null;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: number;
  uuid: string | null;
  report_type: ReportType;
  status: ReportStatus;
  store: Store | null;
  user: User | null;
  product: Product | null;
  media: string | string[] | null;
  content?: string;
  responses?: ReportResponse[];
  response_text?: string;
  response_files?: string[];
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

// ============== Responses ==============

export interface ReportsListResponse {
  status: boolean;
  message: string;
  recordsTotal: number;
  recordsFiltered: number;
  data: Report[];
}

export interface ReportTypesListResponse {
  status: boolean;
  message: string;
  recordsTotal: number;
  recordsFiltered: number;
  data: ReportTypeDetail[];
  report_types?: ReportTypeDetail[];
}

export interface SingleReportResponse {
  status: boolean;
  message: string;
  record: Report;
}

export interface GenericResponse {
  status: boolean;
  message: string;
}

// ============== Payloads ==============

export interface CreateReportPayload {
  report_type_id: string | number;
  status: ReportStatus;
  store_id: string | number;
  product_id?: string | number;
  user_id: string | number;
  content: string;
  media?: string;
}

export interface UpdateReportPayload {
  report_type_id: string | number;
  status: ReportStatus;
  store_id: string | number;
  user_id: string | number;
  content: string;
}

export interface UpdateStatusPayload {
  status: ReportStatus;
}

export interface ReportsParams {
  page?: number;
  per_page?: number;
  store_id?: string | number;
  status?: ReportStatus;
  type?: "store" | "product" | "service" | "requested_service" | string;
}

// ============== API Functions ==============

export const getReports = async (params?: ReportsParams): Promise<ReportsListResponse> => {
  const endpoint = getDynamicEndpoint("/reports");
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.per_page) queryParams.append("per_page", String(params.per_page));
  if (params?.store_id) queryParams.append("store_id", String(params.store_id));
  if (params?.type) queryParams.append("type", params.type);
  if (params?.status) queryParams.append("status", params.status);

  const { data } = await api.get<ReportsListResponse>(`${endpoint}?${queryParams.toString()}`);
  return data;
};

export const getReportTypes = async (): Promise<ReportTypesListResponse> => {
  const endpoint = getDynamicEndpoint("/report-types");
  const { data } = await api.get<ReportTypesListResponse>(endpoint);
  return data;
};

export const getSingleReport = async (id: string | number): Promise<SingleReportResponse> => {
  const endpoint = getDynamicEndpoint(`/reports/${id}`);
  const { data } = await api.get<SingleReportResponse>(endpoint);
  return data;
};

export const createReport = async (payload: CreateReportPayload): Promise<GenericResponse> => {
  const endpoint = getDynamicEndpoint("/reports");
  const { data } = await api.post<GenericResponse>(endpoint, payload);
  return data;
};

export const updateReport = async (id: string | number, payload: UpdateReportPayload): Promise<GenericResponse> => {
  const endpoint = getDynamicEndpoint(`rts/${id}`);
  const { data } = await api.post<GenericResponse>(endpoint, payload);
  return data;
};

export const deleteReport = async (id: string | number): Promise<GenericResponse> => {
  const endpoint = getDynamicEndpoint(`/reports/${id}`);
  const { data } = await api.delete<GenericResponse>(endpoint);
  return data;
};


export interface CreateReportTypePayload {
  name: string;
  is_active: number | boolean;
  category?: string;
}

export const createReportType = async (payload: CreateReportTypePayload): Promise<GenericResponse> => {
  const endpoint = getDynamicEndpoint("/report-types"); // Post endpoint for report types
  const { data } = await api.post<GenericResponse>(endpoint, payload);
  return data;
};

export const deleteReportType = async (id: string | number): Promise<GenericResponse> => {
  const endpoint = getDynamicEndpoint(`/report-types/${id}`);
  const { data } = await api.delete<GenericResponse>(endpoint);
  return data;
};

export const updateReportStatus = async (id: string | number, payload: UpdateStatusPayload): Promise<GenericResponse> => {
  const endpoint = getDynamicEndpoint(`/reports/${id}/update-status`);
  const { data } = await api.post<GenericResponse>(endpoint, payload);
  return data;
};

export const addReportResponse = async (
  id: string | number,
  response_text: string,
  response_files: File[]
): Promise<GenericResponse> => {
  const endpoint = getDynamicEndpoint(`/reports/${id}/response`);
  const formData = new FormData();
  formData.append("response_text", response_text);
  if (response_files && response_files.length > 0) {
    response_files.forEach((file) => {
      formData.append("response_files[]", file);
    });
  }

  const { data } = await api.post<GenericResponse>(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};