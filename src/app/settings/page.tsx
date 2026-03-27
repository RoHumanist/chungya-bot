"use client";

import BottomNav from "@/components/BottomNav";
import ProfileForm from "@/components/ProfileForm";
import { useProfile } from "@/lib/filter-context";

export default function SettingsPage() {
  const { dirty } = useProfile();

  const handleBack = () => {
    if (dirty && !confirm("저장하지 않은 변경사항이 있어요. 나가시겠어요?")) return;
    window.history.back();
  };

  return (
    <div className="pb-20">
      <header className="sticky top-0 z-40 bg-white px-5 pt-14 pb-4">
        <button onClick={handleBack} className="mb-2 p-1 -ml-1 text-toss-gray-500">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">내 조건</h1>
        <p className="text-sm text-toss-gray-500 mt-1">
          조건을 바꾸면 맞는 청약이 달라져요
        </p>
      </header>
      <ProfileForm />
      <BottomNav />
    </div>
  );
}
