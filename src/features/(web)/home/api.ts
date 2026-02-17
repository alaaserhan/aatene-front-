import api from "@/src/lib/axios";
import { HomePageResponse } from "./types";

export const getHomePageData = async (): Promise<HomePageResponse> => {
    const { data } = await api.get<HomePageResponse>("/pages/home");
    return data;
};
