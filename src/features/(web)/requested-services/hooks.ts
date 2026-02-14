"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/src/hooks/use-api-query";
import { toast } from "sonner";
import {
    getRequestedServices,
    createRequestedService,
    getRequestedServiceBySlug,
    updateRequestedService,
} from "./api";
import {
    CreateRequestedServicePayload,
    GetRequestedServicesParams,
} from "./types";

export const useRequestedServices = (params?: GetRequestedServicesParams) => {
    return useApiQuery({
        queryKey: ["requested-services", params],
        queryFn: () => getRequestedServices(params),
    });
};

export const useRequestedServiceBySlug = (slugOrId: string | number) => {
    return useApiQuery({
        queryKey: ["requested-service", slugOrId],
        queryFn: () => getRequestedServiceBySlug(slugOrId),
        enabled: !!slugOrId,
    });
};

export const useCreateRequestedService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateRequestedServicePayload) =>
            createRequestedService(payload),
        onSuccess: (data) => {
            toast.success(data.message || "Requested service created successfully");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["requested-services"] });
        },
    });
};

export const useUpdateRequestedService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string | number; payload: CreateRequestedServicePayload }) =>
            updateRequestedService(id, payload),
        onSuccess: (data) => {
            toast.success(data.message || "Requested service updated successfully");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["requested-services"] });
            queryClient.invalidateQueries({ queryKey: ["requested-service"] });
        },
    });
};
