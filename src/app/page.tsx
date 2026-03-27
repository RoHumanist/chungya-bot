"use client";

import { useProfile } from "@/lib/filter-context";
import BottomNav from "@/components/BottomNav";
import Onboarding from "@/components/Onboarding";
import MatchedFeed from "@/components/MatchedFeed";

export default function Home() {
  const { hasSetup } = useProfile();

  if (!hasSetup) {
    return <Onboarding />;
  }

  return (
    <div className="pb-20">
      <header className="sticky top-0 z-40 bg-white px-5 pt-14 pb-4">
        <h1 className="text-2xl font-bold">청약알리미</h1>
        <p className="text-sm text-toss-gray-500 mt-1">
          내 조건에 맞는 청약이에요
        </p>
      </header>
      <MatchedFeed />
      <BottomNav />
    </div>
  );
}
