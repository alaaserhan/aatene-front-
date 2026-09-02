// src/features/(dashboard)/stores/create/hooks.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setStoreContext } from "@/src/store-context";
import { StoresQK } from "../hooks";
import * as api from "./api";

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: api.CreateStorePayload) => api.createStore(payload),

    onSuccess: (data) => {
      // Set the store cookies right away so StoreGuard doesn't race the
      // redirect that follows creation.
      const store = data?.record;
      if (store?.id) {
        setStoreContext({
          storeId: String(store.id),
          storeType: store.type,
          storeSlug: store.slug ?? null,
          storeRole: store.role_in_store ?? null,
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: StoresQK.listAny });
    },
  });
}
