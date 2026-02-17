import { useQuery } from "@tanstack/react-query";
import { getService, getServicePageData, GetServiceResponse, GetServicePageDataResponse } from "./api";

export const useGetService = (slugOrId: string | number) => {
    return useQuery<GetServiceResponse, Error>({
        queryKey: ["service", slugOrId],
        queryFn: () => getService(slugOrId),
        enabled: !!slugOrId,
    });
};

export const useGetServicePageData = (slugOrId: string | number) => {
    return useQuery<GetServicePageDataResponse, Error>({
        queryKey: ["service-page-data", slugOrId],
        queryFn: () => getServicePageData(slugOrId),
        enabled: !!slugOrId,
    });
};

// Reviews
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getServiceReviews,
    addServiceReview,
    getServiceReviewReplies,
    GetServiceReviewsResponse
} from "./api";
import { AddReviewPayload } from "../product/types";

export const useGetServiceReviews = (slug: string, page: number = 1) => {
    return useQuery<GetServiceReviewsResponse, Error>({
        queryKey: ["service-reviews", slug, page],
        queryFn: () => getServiceReviews(slug, page),
        enabled: !!slug,
    });
};

export const useAddServiceReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ slug, payload }: { slug: string; payload: AddReviewPayload }) =>
            addServiceReview(slug, payload),
        onSuccess: (_, { slug }) => {
            queryClient.invalidateQueries({ queryKey: ["service-reviews", slug] });
            queryClient.invalidateQueries({ queryKey: ["service", slug] });
        },
    });
};

export const useGetServiceReviewReplies = (slug: string, id: number) => {
    return useQuery<GetServiceReviewsResponse, Error>({
        queryKey: ["service-review-replies", slug, id],
        queryFn: () => getServiceReviewReplies(slug, id),
        enabled: !!slug && !!id,
    });
};
