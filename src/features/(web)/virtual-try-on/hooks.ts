"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiQuery } from "@/src/hooks/use-api-query";
import { useAuth } from "@/src/auth";
import { tryOnApi } from "./api";
import { getTryOnError, isTryOnDisabled, hasInsufficientTryOnBalance } from "./errors";
import type { TryOnGenerationStatus, TryOnInfo } from "./types";

export const tryOnKeys = {
  all: ["try-on"] as const,
  info: ["try-on", "info"] as const,
  categories: ["try-on", "categories"] as const,
  products: ["try-on", "products"] as const,
  list: ["try-on", "list"] as const,
  generations: ["try-on", "generations"] as const,
  generation: (uuid: string) => ["try-on", "generation", uuid] as const,
};

export function useTryOnInfo() {
  const { isLoggedIn } = useAuth();
  return useApiQuery({
    queryKey: tryOnKeys.info,
    queryFn: ({ signal }) => tryOnApi.getInfo(signal),
    enabled: isLoggedIn,
    staleTime: 30_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchInterval: 60_000,
  });
}

export function useTryOnAvailability(error: unknown) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!isTryOnDisabled(error)) return;
    queryClient.setQueriesData<TryOnInfo>({ queryKey: tryOnKeys.info }, (info) => info ? { ...info, is_active: false } : info);
  }, [error, queryClient]);
}

export function useTryOnCategories(enabled = true) {
  const query = useApiQuery({
    queryKey: tryOnKeys.categories,
    queryFn: ({ signal }) => tryOnApi.getCategories(signal),
    enabled,
    staleTime: 300_000,
  });
  useTryOnAvailability(query.error);
  return query;
}

export function useTryOnProducts(categoryId?: number, page = 1, enabled = true) {
  const query = useApiQuery({
    queryKey: [...tryOnKeys.products, { categoryId, page }],
    queryFn: ({ signal }) => tryOnApi.getProducts({ category_id: categoryId, page, per_page: 12 }, signal),
    enabled,
    staleTime: 60_000,
  });
  useTryOnAvailability(query.error);
  return query;
}

export function useTryOnList(enabled = true) {
  const query = useApiQuery({
    queryKey: tryOnKeys.list,
    queryFn: ({ signal }) => tryOnApi.getList(signal),
    enabled,
  });
  useTryOnAvailability(query.error);
  return query;
}

export function useTryOnProductIndex(enabled: boolean) {
  const query = useApiQuery({
    queryKey: [...tryOnKeys.products, "eligibility"],
    queryFn: ({ signal }) => tryOnApi.getProductIndex(signal),
    enabled,
    staleTime: 300_000,
  });
  useTryOnAvailability(query.error);
  return query;
}

function useMutationError(fallback: string) {
  const queryClient = useQueryClient();
  return (error: unknown) => {
    if (isTryOnDisabled(error)) {
      queryClient.setQueriesData<TryOnInfo>({ queryKey: tryOnKeys.info }, (info) => info ? { ...info, is_active: false } : info);
    }
    toast.error(getTryOnError(error, fallback));
  };
}

export function useUploadTryOnPhoto() {
  const queryClient = useQueryClient();
  const onError = useMutationError("تعذر رفع الصورة. يرجى المحاولة مجددًا.");
  return useMutation({
    mutationFn: tryOnApi.uploadPhoto,
    onSuccess: async (data) => {
      toast.success(data.message);
      await queryClient.invalidateQueries({ queryKey: tryOnKeys.info });
    },
    onError,
  });
}

function useTryOnListMutation(action: "add" | "remove") {
  const queryClient = useQueryClient();
  const onError = useMutationError("تعذر تحديث قائمة التجربة.");
  return useMutation({
    mutationKey: [...tryOnKeys.list, action],
    mutationFn: action === "add" ? tryOnApi.addToList : tryOnApi.removeFromList,
    onSuccess: async (data) => {
      toast.success(data.message);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tryOnKeys.list }),
        queryClient.invalidateQueries({ queryKey: tryOnKeys.products, predicate: (query) => query.queryKey[2] !== "eligibility" }),
        queryClient.invalidateQueries({ queryKey: tryOnKeys.info }),
      ]);
    },
    onError,
  });
}

export function useAddToTryOnList() { return useTryOnListMutation("add"); }
export function useRemoveFromTryOnList() { return useTryOnListMutation("remove"); }

export function useGenerateTryOn() {
  const queryClient = useQueryClient();
  const onError = useMutationError("تعذر بدء التجربة. يرجى المحاولة مجددًا.");
  return useMutation({
    mutationFn: tryOnApi.generate,
    onSuccess: async (data) => {
      toast.success(data.message);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tryOnKeys.generations }),
        queryClient.invalidateQueries({ queryKey: tryOnKeys.info }),
      ]);
    },
    onError: (error) => {
      onError(error);
      if (hasInsufficientTryOnBalance(error)) void queryClient.invalidateQueries({ queryKey: tryOnKeys.info });
    },
  });
}

export function useTryOnGenerations(page = 1, enabled = true) {
  const queryClient = useQueryClient();
  const statuses = useRef(new Map<string, TryOnGenerationStatus>());
  const query = useApiQuery({
    queryKey: [...tryOnKeys.generations, page],
    queryFn: ({ signal }) => tryOnApi.getGenerations(page, signal),
    enabled,
    refetchInterval: (query) => query.state.data?.items.some((item) => item.status === "pending") ? 5_000 : false,
  });
  useEffect(() => {
    if (!enabled || !query.data) return;
    let finished = false;
    for (const generation of query.data.items) {
      if (statuses.current.get(generation.uuid) === "pending" && generation.status !== "pending") finished = true;
      statuses.current.set(generation.uuid, generation.status);
    }
    if (finished) void queryClient.invalidateQueries({ queryKey: tryOnKeys.info });
  }, [enabled, query.data, queryClient]);
  return query;
}

export function useTryOnGeneration(uuid: string, enabled = true) {
  return useApiQuery({
    queryKey: tryOnKeys.generation(uuid),
    queryFn: ({ signal }) => tryOnApi.getGenerationByUuid(uuid, signal),
    enabled: enabled && !!uuid,
    refetchInterval: (query) => query.state.data?.status === "pending" ? 5_000 : false,
  });
}
