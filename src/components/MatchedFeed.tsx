"use client";

import { useMemo } from "react";
import { useProfile } from "@/lib/filter-context";
import { useSubscriptions } from "@/lib/use-subscriptions";
import { matchAll, sortByUpcoming } from "@/lib/match";
import SubscriptionCard from "./SubscriptionCard";
import LoadingFeed from "./LoadingFeed";

export default function MatchedFeed() {
  const { profile } = useProfile();
  const { subscriptions, isLoading, isError } = useSubscriptions();

  const results = useMemo(() => {
    const matched = matchAll(subscriptions, profile);
    return sortByUpcoming(matched);
  }, [subscriptions, profile]);

  const eligibleCount = results.filter((r) => r.eligible).length;

  if (isLoading) return <LoadingFeed />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-toss-gray-500">
        <p className="text-lg font-medium mb-2">데이터를 불러올 수 없어요</p>
        <p className="text-sm">잠시 후 다시 시도해주세요</p>
      </div>
    );
  }

  return (
    <div>
      {/* 요약 */}
      <div className="px-5 pb-3">
        <p className="text-sm text-toss-gray-500">
          전체 {results.length}건 중{" "}
          <span className="font-bold text-toss-blue">{eligibleCount}건</span>{" "}
          지원 가능
        </p>
      </div>

      {/* 카드 목록 */}
      {results.length > 0 ? (
        <div className="pb-4">
          {results.map((r) => (
            <SubscriptionCard key={r.sub.id} result={r} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-toss-gray-500">
          <p className="text-lg font-medium mb-2">청약 정보가 없어요</p>
        </div>
      )}
    </div>
  );
}
