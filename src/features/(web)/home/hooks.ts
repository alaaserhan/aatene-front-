
import { useApiQuery } from "@/src/hooks/use-api-query";
import { getHomePageData } from "./api";

export const useHomePageData = () => {
    return useApiQuery({
        queryKey: ["homePageData"],
        queryFn: getHomePageData,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
