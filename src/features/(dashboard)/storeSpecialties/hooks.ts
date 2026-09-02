// src/features/(dashboard)/storeSpecialties/hooks.ts
"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import * as api from "./api";
import { StoreSpecialtiesListResponse } from "./api";

const StoreSpecialtiesQK = {
    list: (params?: string) => ["storeSpecialties", "list", params] as const,
};

export const useGetStoreSpecialties = (
    params: URLSearchParams,
    options?: Partial<UseQueryOptions<StoreSpecialtiesListResponse, Error>>
) => {
    return useQuery({
        queryKey: StoreSpecialtiesQK.list(params.toString()),
        queryFn: () => api.getStoreSpecialties(params),
        ...options,
    });
};
