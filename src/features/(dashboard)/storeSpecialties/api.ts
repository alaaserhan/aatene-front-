// src/features/(dashboard)/storeSpecialties/api.ts
import api from "@/src/lib/axios";
import type { StoreStatus, StoreType } from "../stores/api";

export interface BaseResponse {
    status: boolean;
    message: string;
}

/** A store row keyed by its speciality, as returned by the specialties listing. */
export interface StoreSpecialty {
    id: number;
    name: string;
    slug: string;
    type: StoreType;
    speciality: string;
    status: StoreStatus;
    logo: string | null;
    logo_url: string | null;
}

export interface Pagination {
    total: number;
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
}

export interface StoreSpecialtiesListResponse extends BaseResponse {
    items: StoreSpecialty[];
    pagination: Pagination;
}

export const getStoreSpecialties = async (
    params: URLSearchParams
): Promise<StoreSpecialtiesListResponse> => {
    const { data } = await api.get<StoreSpecialtiesListResponse>(
        `/admin/stores/specialties?${params.toString()}`
    );
    return data;
};
