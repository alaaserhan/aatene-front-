import api from "@/src/lib/axios";
import { normalizeAskForPrice } from "@/src/lib/normalizeAskForPrice";
import * as Types from "./types";

function mapHomeServices(services: Types.Service[]): Types.Service[] {
    return services.map((service) => ({
        ...service,
        ask_for_price: normalizeAskForPrice(service.ask_for_price),
    }));
}

export const getFirstBanners = async (): Promise<Types.FirstBannersResponse> => {
    const { data } = await api.get<Types.FirstBannersResponse>("/pages/v2/home/banners/first");
    return data;
};

export const getSecondBanners = async (): Promise<Types.SecondBannersResponse> => {
    const { data } = await api.get<Types.SecondBannersResponse>("/pages/v2/home/banners/second");
    return data;
};

export const getThirdBanner = async (): Promise<Types.ThirdBannerResponse> => {
    const { data } = await api.get<Types.ThirdBannerResponse>("/pages/v2/home/banners/third");
    return data;
};

export const getFourthBanner = async (): Promise<Types.FourthBannerResponse> => {
    const { data } = await api.get<Types.FourthBannerResponse>("/pages/v2/home/banners/fourth");
    return data;
};

export const getFifthBanner = async (): Promise<Types.FifthBannerResponse> => {
    const { data } = await api.get<Types.FifthBannerResponse>("/pages/v2/home/banners/fifth");
    return data;
};

export const getSixthBanner = async (): Promise<Types.SixthBannerResponse> => {
    const { data } = await api.get<Types.SixthBannerResponse>("/pages/v2/home/banners/sixth");
    return data;
};

export const getNewProducts = async (): Promise<Types.NewProductsResponse> => {
    const { data } = await api.get<Types.NewProductsResponse>("/pages/v2/home/products/new");
    return data;
};

export const getPopularProducts = async (): Promise<Types.PopularProductsResponse> => {
    const { data } = await api.get<Types.PopularProductsResponse>("/pages/v2/home/products/popular");
    return data;
};

export const getSelectedForYou = async (): Promise<Types.SelectedForYouResponse> => {
    const { data } = await api.get<Types.SelectedForYouResponse>("/pages/v2/home/products/selected-for-you");
    return data;
};

export const getMayLike = async (): Promise<Types.MayLikeResponse> => {
    const { data } = await api.get<Types.MayLikeResponse>("/pages/v2/home/products/may-like");
    return data;
};

export const getMostPopularSingle = async (): Promise<Types.MostPopularSingleResponse> => {
    const { data } = await api.get<Types.MostPopularSingleResponse>("/pages/v2/home/products/popular");
    return data;
};

export const getTodayOffers = async (): Promise<Types.TodayOffersResponse> => {
    const { data } = await api.get<Types.TodayOffersResponse>("/pages/v2/home/offers/today");
    return data;
};

export const getWeekOffers = async (): Promise<Types.WeekOffersResponse> => {
    const { data } = await api.get<Types.WeekOffersResponse>("/pages/v2/home/offers/week");
    return data;
};

export const getSpecialServices = async (): Promise<Types.SpecialServicesResponse> => {
    const { data } = await api.get<Types.SpecialServicesResponse>("/pages/v2/home/services/special");
    if (Array.isArray(data?.data)) {
        data.data = mapHomeServices(data.data);
    }
    return data;
};

export const getPopularServices = async (): Promise<Types.PopularServicesResponse> => {
    const { data } = await api.get<Types.PopularServicesResponse>("/pages/v2/home/services/popular");
    if (Array.isArray(data?.data)) {
        data.data = mapHomeServices(data.data);
    }
    return data;
};

export const getRequestedServices = async (): Promise<Types.RequestedServicesResponse> => {
    const { data } = await api.get<Types.RequestedServicesResponse>("/pages/v2/home/services/requested");
    return data;
};

export const getStoryOwners = async (): Promise<Types.StoryOwnersResponse> => {
    const { data } = await api.get<Types.StoryOwnersResponse>("/pages/v2/home/stories/owners");
    return data;
};

export const getSpecialMerchants = async (): Promise<Types.SpecialMerchantsResponse> => {
    const { data } = await api.get<Types.SpecialMerchantsResponse>("/pages/v2/home/merchants/special");
    return data;
};

export const getTopRatedCategories = async (): Promise<Types.TopRatedCategoriesResponse> => {
    const { data } = await api.get<Types.TopRatedCategoriesResponse>("/pages/v2/home/categories/top-rated");
    return data;
};

export const getCategoriesWithProducts = async (): Promise<Types.CategoriesWithProductsResponse> => {
    const { data } = await api.get<Types.CategoriesWithProductsResponse>("/pages/v2/home/categories/with-products");
    return data;
};

export const getLatestBlogs = async (): Promise<Types.LatestBlogsResponse> => {
    const { data } = await api.get<Types.LatestBlogsResponse>("/pages/v2/home/blog/latest");
    return data;
};
