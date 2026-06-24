import { useApiQuery } from "@/src/hooks/use-api-query";
import * as api from "./api";
import { SpecialMerchantsResponse } from "./types";

const staleTime = 5 * 60 * 1000; // 5 minutes

export const useFirstBanners = (options?: { enabled?: boolean }) => {
    return useApiQuery({
        queryKey: ["homeFirstBanners"],
        queryFn: api.getFirstBanners,
        staleTime,
        ...options,
    });
};

export const useSecondBanners = () => {
    return useApiQuery({
        queryKey: ["homeSecondBanners"],
        queryFn: api.getSecondBanners,
        staleTime,
    });
};

export const useThirdBanner = () => {
    return useApiQuery({
        queryKey: ["homeThirdBanner"],
        queryFn: api.getThirdBanner,
        staleTime,
    });
};

export const useFourthBanner = () => {
    return useApiQuery({
        queryKey: ["homeFourthBanner"],
        queryFn: api.getFourthBanner,
        staleTime,
    });
};

export const useFifthBanner = () => {
    return useApiQuery({
        queryKey: ["homeFifthBanner"],
        queryFn: api.getFifthBanner,
        staleTime,
    });
};

export const useSixthBanner = () => {
    return useApiQuery({
        queryKey: ["homeSixthBanner"],
        queryFn: api.getSixthBanner,
        staleTime,
    });
};

export const useNewProducts = () => {
    return useApiQuery({
        queryKey: ["homeNewProducts"],
        queryFn: api.getNewProducts,
        staleTime,
    });
};

export const usePopularProducts = () => {
    return useApiQuery({
        queryKey: ["homePopularProducts"],
        queryFn: api.getPopularProducts,
        staleTime,
    });
};

export const useSelectedForYou = () => {
    return useApiQuery({
        queryKey: ["homeSelectedForYou"],
        queryFn: api.getSelectedForYou,
        staleTime,
    });
};

export const useMayLike = () => {
    return useApiQuery({
        queryKey: ["homeMayLike"],
        queryFn: api.getMayLike,
        staleTime,
    });
};

export const useMostPopularSingle = () => {
    return useApiQuery({
        queryKey: ["homeMostPopularSingle"],
        queryFn: api.getMostPopularSingle,
        staleTime,
    });
};

export const useTodayOffers = () => {
    return useApiQuery({
        queryKey: ["homeTodayOffers"],
        queryFn: api.getTodayOffers,
        staleTime,
    });
};

export const useWeekOffers = () => {
    return useApiQuery({
        queryKey: ["homeWeekOffers"],
        queryFn: api.getWeekOffers,
        staleTime,
    });
};

export const useSpecialServices = () => {
    return useApiQuery({
        queryKey: ["homeSpecialServices"],
        queryFn: api.getSpecialServices,
        staleTime,
    });
};

export const usePopularServices = (options?: { enabled?: boolean }) => {
    return useApiQuery({
        queryKey: ["homePopularServices"],
        queryFn: api.getPopularServices,
        staleTime,
        ...options,
    });
};

export const useRequestedServices = () => {
    return useApiQuery({
        queryKey: ["homeRequestedServices"],
        queryFn: api.getRequestedServices,
        staleTime,
    });
};

export const useStoryOwners = () => {
    return useApiQuery({
        queryKey: ["homeStoryOwners"],
        queryFn: api.getStoryOwners,
        staleTime,
    });
};

export const useSpecialMerchants = (initialData?: SpecialMerchantsResponse) => {
    return useApiQuery({
        queryKey: ["homeSpecialMerchants"],
        queryFn: api.getSpecialMerchants,
        staleTime,
        initialData,
    });
};

export const useTopRatedCategories = () => {
    return useApiQuery({
        queryKey: ["homeTopRatedCategories"],
        queryFn: api.getTopRatedCategories,
        staleTime,
    });
};

export const useCategoriesWithProducts = () => {
    return useApiQuery({
        queryKey: ["homeCategoriesWithProducts"],
        queryFn: api.getCategoriesWithProducts,
        staleTime,
    });
};

export const useLatestBlogs = () => {
    return useApiQuery({
        queryKey: ["homeLatestBlogs"],
        queryFn: api.getLatestBlogs,
        staleTime,
    });
};
