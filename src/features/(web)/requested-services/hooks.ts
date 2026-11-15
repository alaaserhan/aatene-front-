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
    deleteRequestedService,
} from "./api";
import {
    CreateRequestedServicePayload,
    GetRequestedServiceBySlugResponse,
    GetRequestedServicesParams,
} from "./types";

// Every cached list that can show a requested service, including the home page section.
const LIST_QUERY_KEYS = ["requested-services", "my-requested-services", "homeRequestedServices"] as const;

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
        // No success toast: the create page shows its own "under review" modal.
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["requested-services"] });
            queryClient.invalidateQueries({ queryKey: ["my-requested-services"] });
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

export const useDeleteRequestedService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string | number) => deleteRequestedService(id),
        onSuccess: async (data, id) => {
            const isDeleted = (item: { id: number | string }) => String(item.id) === String(id);

            // Prune cached lists first so no screen renders the deleted item while it refetches.
            for (const key of LIST_QUERY_KEYS) {
                queryClient.setQueriesData<{ data?: { id: number | string }[]; recordsTotal?: number; recordsFiltered?: number }>(
                    { queryKey: [key] },
                    (old) => {
                        if (!Array.isArray(old?.data) || !old.data.some(isDeleted)) return old;
                        return {
                            ...old,
                            data: old.data.filter((item) => !isDeleted(item)),
                            ...(typeof old.recordsTotal === "number" && { recordsTotal: old.recordsTotal - 1 }),
                            ...(typeof old.recordsFiltered === "number" && { recordsFiltered: old.recordsFiltered - 1 }),
                        };
                    },
                );
            }
            queryClient.setQueriesData<GetRequestedServiceBySlugResponse>(
                { queryKey: ["requested-service"] },
                (old) =>
                    old?.latestActivity
                        ? { ...old, latestActivity: old.latestActivity.filter((item) => !isDeleted(item)) }
                        : old,
            );

            // Awaited so the confirm modal keeps its spinner until the lists on screen are fresh.
            await Promise.all(
                LIST_QUERY_KEYS.map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
            );
            // Mark only: refetching the open details page would 404 before it navigates away.
            queryClient.invalidateQueries({ queryKey: ["requested-service"], refetchType: "none" });

            toast.success(data?.message || "تم حذف الطلب بنجاح");
        },
    });
};

export const useRequestedServiceComments =(slug: string | number) => {
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
