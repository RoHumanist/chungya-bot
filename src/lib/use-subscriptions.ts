"use client";

import useSWR from "swr";
import type { Subscription } from "@/types/subscription";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`API error: ${r.status}`);
    return r.json();
  });

export function useSubscriptions() {
  const { data, error, isLoading } = useSWR<Subscription[]>(
    "/api/subscriptions",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000, // 1분 내 중복 요청 방지
    }
  );

  return {
    subscriptions: data ?? [],
    isLoading,
    isError: !!error,
  };
}
