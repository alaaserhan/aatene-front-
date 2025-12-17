// src/features/(dashboard)/services/hooks.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import * as api from "./api";
import { toast } from "sonner";

export function useGetServices(params: URLSearchParams, storeId?: number | string) {
  return useQuery({
    queryKey: ["services", params.toString(), storeId],
    queryFn: () => api.getServices(params, storeId),
  });
}

export function useGetService(id: number | string, storeId?: number | string) {
  return useQuery({
    queryKey: ["services", id, storeId],
    queryFn: () => api.getSingleService(id, storeId),
    enabled: !!id,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createService,
    onSuccess: () => {
      toast.success("تم إنشاء الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الإنشاء");
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
      storeId
    }: {
      id: number | string;
      payload: api.ServicePayload;
      storeId?: number | string;
    }) => api.updateService(id, payload, storeId),
    onSuccess: (data) => {
      toast.success("تم تعديل الخدمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.setQueryData(["services", data.data.id], data);
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء التعديل");
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, storeId }: { id: number | string; storeId?: number | string }) => 
      api.deleteService(id, storeId),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["services"] });

      const previousData = queryClient.getQueriesData({ queryKey: ["services"] });

      queryClient.setQueriesData(
        { queryKey: ["services"] },
        (old: api.ServicesResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((item) => item.id !== id),
            recordsTotal: old.recordsTotal - 1,
            recordsFiltered: old.recordsFiltered - 1,
          };
        }
      );

      return { previousData };
    },
    onSuccess: () => {
      toast.success("تم حذف الخدمة بنجاح");
    },
    onError: (error: AxiosError<api.BaseResponse>, vars, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحذف");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useUpdateServiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
      storeId
    }: {
      id: number | string;
      payload: api.ServiceStatusPayload;
      storeId?: number | string;
    }) => api.updateServiceStatus(id, payload, storeId),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["services"] });
      
      const previousData = queryClient.getQueriesData({ queryKey: ["services"] });

      queryClient.setQueriesData(
        { queryKey: ["services"] },
        (old: api.ServicesResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, status: payload.status } : item
            ),
          };
        }
      );

      return { previousData };
    },
    onSuccess: () => {
      toast.success("تم تحديث الحالة بنجاح");
    },
    onError: (error: AxiosError<api.BaseResponse>, vars, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث الحالة");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}