// src/features/(dashboard)/tags/hooks.ts
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import * as api from "./api";

/** Search existing tags. Disabled while `enabled` is false so the dropdown only queries when open. */
export function useSearchTags(params: api.GetTagsParams, enabled = true) {
  return useQuery({
    queryKey: ["tags", params.type, params.search ?? "", params.per_page ?? 15, params.page ?? 1],
    queryFn: () => api.getTags(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
