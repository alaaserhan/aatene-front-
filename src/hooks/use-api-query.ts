"use client";

import {
  useQuery,
  UseQueryOptions,
  QueryKey,
  QueryFunction,
  QueryFunctionContext,
} from "@tanstack/react-query";
import { notFound, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { useLanguage } from "./use-language";
import { loginUrl } from "@/src/auth/links";

type UseApiQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = QueryKey
> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  "queryKey" | "queryFn"
> & {
  queryKey: TQueryKey;
  queryFn: QueryFunction<TQueryFnData, TQueryKey>;
};

type Append<T extends readonly unknown[]> = [...T, string];

export const useApiQuery = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = QueryKey
>(
  options: UseApiQueryOptions<TQueryFnData, TError, TData, TQueryKey>
) => {
  const router = useRouter();
  const lang = useLanguage();

  const { queryKey, queryFn, ...restOptions } = options;

  // Make the new key's type explicit
  const appendedKey = [...queryKey, lang] as Append<TQueryKey>;

  // Adapt the queryFn’s context type to the new key
  const wrappedQueryFn: QueryFunction<TQueryFnData, Append<TQueryKey>> = (ctx) =>
    queryFn(ctx as unknown as QueryFunctionContext<TQueryKey>);

  const queryResult = useQuery<TQueryFnData, TError, TData, Append<TQueryKey>>({
    ...(restOptions as UseQueryOptions<TQueryFnData, TError, TData, Append<TQueryKey>>),
    queryKey: appendedKey,
    queryFn: wrappedQueryFn,
    retry: false,
    throwOnError: false,
  });

  useEffect(() => {
    if (queryResult.error) {
      if (queryResult.error instanceof AxiosError) {
        const res = queryResult.error.response;
        if (res?.status === 404) return notFound();
        if (res?.status === 401) {
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            router.push(loginUrl(lang, { authRequired: true }));
          }
          return;
        }
      } else {
        console.error("Non-Axios error in useApiQuery:", queryResult.error);
      }
    }
  }, [queryResult.error, router, lang]);

  return queryResult;
};
