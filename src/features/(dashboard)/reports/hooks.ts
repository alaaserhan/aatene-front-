import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { toast } from "sonner";
import { AxiosError } from "axios";

// --- Queries ---

export function useGetReports(params?: api.ReportsParams) {
  return useQuery({
    queryKey: ["reports", params?.page, params?.per_page, params?.store_id],
    queryFn: () => api.getReports(params),
    placeholderData: (previousData) => previousData,
  });
}

// New Hook: Get Report Types
export function useGetReportTypes(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["report-types"],
    queryFn: api.getReportTypes,
    enabled: options?.enabled,
  });
}

export function useCreateReportType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createReportType,
    onSuccess: (data) => {
      toast.success(data.message || "تم إنشاء سبب الرفض بنجاح");
      queryClient.invalidateQueries({ queryKey: ["report-types"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "فشل إنشاء سبب الرفض");
    },
  });
}

export function useGetSingleReport(id: string | number) {
  return useQuery({
    queryKey: ["report", id],
    queryFn: () => api.getSingleReport(id),
    enabled: !!id,
  });
}

// --- Mutations ---

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createReport,
    onSuccess: (data) => {
      toast.success(data.message || "تم إنشاء التقرير بنجاح");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "فشل إنشاء التقرير");
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: api.UpdateReportPayload }) =>
      api.updateReport(id, payload),
    onSuccess: (data) => {
      toast.success(data.message || "تم تحديث التقرير بنجاح");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "فشل تحديث التقرير");
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteReport,
    onSuccess: (data) => {
      toast.success(data.message || "تم حذف التقرير بنجاح");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "فشل حذف التقرير");
    },
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: api.UpdateStatusPayload }) =>
      api.updateReportStatus(id, payload),
    onSuccess: (data, variables) => {
      toast.success(data.message || "تم تحديث حالة التقرير بنجاح");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report", variables.id] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "فشل تحديث الحالة");
    },
  });
}