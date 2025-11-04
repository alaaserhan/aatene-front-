// src/features/(dashboard)/cities/hooks.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCities,
  createCity,
  updateCity,
  deleteCity,
  updateCityStatus,
  CityUpdatePayload,
  UpdateStatusPayload,
} from "./api";
import { toast } from "sonner";
import { URLSearchParams } from "url";

export const CITIES_QUERY_KEY = ["cities"];

export const useGetCities = (params: URLSearchParams) => {
  return useQuery({
    queryKey: [...CITIES_QUERY_KEY, params.toString()],
    queryFn: () => getCities(params),
  });
};

export const useCreateCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCity,
    onSuccess: (data) => {
      toast.success(data.message || "تم إضافة المدينة بنجاح");
      queryClient.invalidateQueries({ queryKey: CITIES_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Create city failed:", error);
    },
  });
};

export const useUpdateCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: number | string; payload: CityUpdatePayload }) =>
      updateCity(variables.id, variables.payload),
    onSuccess: (data) => {
      toast.success(data.message || "تم تعديل المدينة بنجاح");
      queryClient.invalidateQueries({ queryKey: CITIES_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Update city failed:", error);
    },
  });
};

export const useDeleteCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCity,
    onSuccess: (data) => {
      toast.success(data.message || "تم حذف المدينة بنجاح");
      queryClient.invalidateQueries({ queryKey: CITIES_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Delete city failed:", error);
    },
  });
};

export const useUpdateCityStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: number | string; payload: UpdateStatusPayload }) =>
      updateCityStatus(variables.id, variables.payload),
    onSuccess: (data) => {
      toast.success(data.message || "تم تحديث الحالة بنجاح");
      queryClient.invalidateQueries({ queryKey: CITIES_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Update city status failed:", error);
    },
  });
};