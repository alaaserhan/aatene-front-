// src/features/(dashboard)/storeSpecialties/api.ts
import api from "@/src/lib/axios";

export interface BaseResponse {
    status: boolean;
    message: string;
}

export interface StoreSpecialty {
    speciality: string;
    stores_count: number;
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
