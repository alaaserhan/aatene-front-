// src/features/(dashboard)/services/hooks.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { invalidateAfterIdentityChange } from "@/src/lib/queryClient";
import * as api from "./api";


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
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
    },
  });
}

// src/features/(dashboard)/services/hooks.ts

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

    onSuccess: (data, variables) => {
      queryClient.setQueryData(["services", variables.id, variables.storeId], data);
      // The service's name and slug are also cached in public screens (home, search, store page)
      invalidateAfterIdentityChange(queryClient);
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, storeId }: { id: number | string; storeId?: number | string }) =>
      api.deleteService(id, storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("تم حذف الخدمة بنجاح");
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
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
    // No optimistic onMutate: the list and single responses are shaped differently
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      console.error("Update Status Error:", error);
    },
  });
}

export function useUpdateServiceShown() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      shown,
      storeId
    }: {
      id: number | string;
      shown: number | boolean;
      storeId?: number | string;
    }) => api.updateServiceShown(id, shown, storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
    },
  });
}

// RejectServiceModal reads its reasons from the web report-types (the reject-service category)
export function useGetRejectionReasons() {
  return useQuery({
    queryKey: ["rejection-reasons"],
    queryFn: api.getRejectionReasons,
  });
}