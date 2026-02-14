"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/src/hooks/use-api-query";
import { toast } from "sonner";
import {
    getRequestedServices,
    createRequestedService,
    getRequestedServiceBySlug,
    updateRequestedService,
    getRequestedServiceComments,
    addRequestedServiceComment,
    getMyRequestedServices,
} from "./api";
import {
    CreateRequestedServicePayload,
    GetRequestedServicesParams,
} from "./types";

export const useRequestedServices = (params?: GetRequestedServicesParams) => {
    return useApiQuery({
        queryKey: ["requested-services", JSON.stringify(params)],
        queryFn: () => getRequestedServices(params),
    });
};

export const useMyRequestedServices = (params?: GetRequestedServicesParams) => {
    return useApiQuery({
        queryKey: ["my-requested-services", JSON.stringify(params)],
        queryFn: () => getMyRequestedServices(params),
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

export const useRequestedServiceComments = (slug: string | number) => {
    return useApiQuery({
        queryKey: ["requested-service-comments", slug],
        queryFn: () => getRequestedServiceComments(slug),
        enabled: !!slug,
    });
};

export const useAddRequestedServiceComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            slug,
            payload,
        }: {
            slug: string | number;
            payload: FormData;
        }) => addRequestedServiceComment(slug, payload),
        onSuccess: (data) => {
            toast.success(data.message || "Comment added successfully");
        },
        onSettled: (_, __, { slug }) => {
            queryClient.invalidateQueries({
                queryKey: ["requested-service-comments", slug],
            });
            queryClient.invalidateQueries({
                queryKey: ["requested-service", slug],
            });
        },
    });
};
