
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getReportTypes,
    createReport,
    getReportStats,
    getReports,
    getSingleReport,
    CreateReportPayload,
    GetReportsParams
} from "./api";

// --- Query Keys ---
export const REPORTS_QK = {
    types: ["report-types"] as const,
    stats: ["report-stats"] as const,
    list: (params?: GetReportsParams) => ["reports-list", params] as const,
    single: (uuid: string) => ["report-single", uuid] as const,
};

// --- Hooks ---

export const useGetReportTypes = () => {
    return useQuery({
        queryKey: REPORTS_QK.types,
        queryFn: getReportTypes,
    });
};

export const useCreateReport = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createReport,
        onSuccess: (data) => {
            toast.success(data.message || "Report submitted successfully");
            qc.invalidateQueries({ queryKey: ["reports-list"] }); // Invalidate all lists
            qc.invalidateQueries({ queryKey: REPORTS_QK.stats });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to submit report");
        },
    });
};

export const useGetReportStats = () => {
    return useQuery({
        queryKey: REPORTS_QK.stats,
        queryFn: getReportStats,
    });
};

export const useGetReports = (params?: GetReportsParams) => {
    return useQuery({
        queryKey: REPORTS_QK.list(params),
        queryFn: () => getReports(params),
    });
};

export const useGetSingleReport = (uuid: string) => {
    return useQuery({
        queryKey: REPORTS_QK.single(uuid),
        queryFn: () => getSingleReport(uuid),
        enabled: !!uuid,
    });
};
