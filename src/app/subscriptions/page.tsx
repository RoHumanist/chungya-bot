"use client";

import { useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import SubscriptionCard from "@/components/SubscriptionCard";
import LoadingFeed from "@/components/LoadingFeed";
import { useProfile } from "@/lib/filter-context";
import { useSubscriptions } from "@/lib/use-subscriptions";
import { matchAll, sortByUpcoming, type MatchResult } from "@/lib/match";
import type { SubscriptionType } from "@/types/subscription";

const FILTER_CHIPS: { value: "all" | "eligible" | SubscriptionType; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "eligible", label: "지원가능" },
  { value: "민간분양", label: "민간분양" },
  { value: "공공분양", label: "공공분양" },
  { value: "청년특별공급", label: "청년" },
  { value: "신혼희망타운", label: "신혼" },
  { value: "행복주택", label: "행복주택" },
  { value: "오피스텔", label: "오피스텔" },
];

export default function SubscriptionsPage() {
  const { profile } = useProfile();
  const { subscriptions, isLoading, isError } = useSubscriptions();
  const [chip, setChip] = useState<string>("all");

  const allResults = useMemo(() => {
    return sortByUpcoming(matchAll(subscriptions, profile));
  }, [subscriptions, profile]);

  const filtered = useMemo(() => {
    if (chip === "all") return allResults;
    if (chip === "eligible") return allResults.filter((r) => r.eligible);
    return allResults.filter((r) => r.sub.type === chip);
  }, [allResults, chip]);

  return (
    <div className="pb-20">
      <header className="sticky top-0 z-40 bg-white px-5 pt-14 pb-3">
        <button onClick={() => window.history.back()} className="mb-2 p-1 -ml-1 text-toss-gray-500">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">청약 목록</h1>
        <p className="text-sm text-toss-gray-500 mt-1">
          {isLoading ? "불러오는 중..." : `전체 ${allResults.length}건`}
        </p>
      </header>

      {/* 필터 칩 */}
      <div className="sticky top-[88px] z-30 bg-white px-4 pb-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {FILTER_CHIPS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setChip(value)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                chip === value
                  ? "bg-toss-black text-white"
                  : "bg-toss-gray-100 text-toss-gray-700"
              }`}
            >
              {label}
              {value === "eligible" && (
                <span className="ml-1">
                  {allResults.filter((r) => r.eligible).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingFeed />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-toss-gray-500">
          <p className="text-lg font-medium mb-2">불러올 수 없어요</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="pt-1">
          {filtered.map((r) => (
            <SubscriptionCard key={r.sub.id} result={r} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-toss-gray-500">
          <p className="text-lg font-medium">해당하는 청약이 없어요</p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
