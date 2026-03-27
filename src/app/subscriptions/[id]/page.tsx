"use client";

import { use } from "react";
import { MOCK_SUBSCRIPTIONS } from "@/lib/mock-data";
import { formatPrice, formatArea, dDay, formatDate } from "@/lib/format";

export default function SubscriptionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const sub = MOCK_SUBSCRIPTIONS.find((s) => s.id === id);

  if (!sub) {
    return (
      <div className="flex items-center justify-center min-h-dvh text-toss-gray-500">
        청약 정보를 찾을 수 없어요
      </div>
    );
  }

  const scheduleItems = [
    { label: "모집공고", date: sub.schedule.announcementDate },
    { label: "특별공급", date: sub.schedule.specialStartDate },
    { label: "1순위", date: sub.schedule.firstPriorityDate },
    { label: "2순위", date: sub.schedule.secondPriorityDate },
    { label: "당첨발표", date: sub.schedule.resultDate },
    { label: "계약시작", date: sub.schedule.contractStartDate },
    { label: "계약종료", date: sub.schedule.contractEndDate },
  ].filter((s) => s.date);

  const cond = sub.conditions;

  return (
    <div className="pb-10">
      {/* 상단 바 */}
      <header className="sticky top-0 z-40 bg-white border-b border-toss-gray-100">
        <div className="flex items-center px-4 h-12">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 text-toss-gray-700">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="ml-2 font-semibold truncate">{sub.name}</h1>
        </div>
      </header>

      {/* 메인 */}
      <section className="px-5 pt-6 pb-4">
        <div className="flex gap-1.5 mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-toss-blue-light text-toss-blue">
            {sub.type}
          </span>
          {sub.specialTypes.map((t) => (
            <span key={t} className="text-xs px-2 py-1 rounded-full bg-toss-gray-100 text-toss-gray-700">
              {t}
            </span>
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-1">{sub.name}</h2>
        <p className="text-sm text-toss-gray-500">{sub.address}</p>
        <p className="text-sm text-toss-gray-500 mt-0.5">
          총 {sub.totalUnits.toLocaleString()}세대
        </p>
      </section>

      <hr className="border-toss-gray-100 mx-5" />

      {/* 평형별 분양가 */}
      <section className="px-5 py-5">
        <h3 className="text-base font-bold mb-3">평형별 분양가</h3>
        <div className="space-y-2">
          {sub.units.map((u) => (
            <div key={u.area} className="flex items-center justify-between p-3 rounded-xl bg-toss-gray-50">
              <div>
                <p className="font-semibold">{formatArea(u.area)}</p>
                <p className="text-xs text-toss-gray-500 mt-0.5">{u.count}세대</p>
              </div>
              <p className="text-lg font-bold text-toss-blue">{formatPrice(u.price)}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-toss-gray-100 mx-5" />

      {/* 일정 */}
      <section className="px-5 py-5">
        <h3 className="text-base font-bold mb-3">청약 일정</h3>
        <div className="space-y-3">
          {scheduleItems.map(({ label, date }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-toss-gray-500">{label}</span>
              <div className="text-right">
                <span className="text-sm font-medium">{formatDate(date!)}</span>
                <span className="text-xs text-toss-blue font-semibold ml-2">{dDay(date!)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-toss-gray-100 mx-5" />

      {/* 자격 조건 */}
      <section className="px-5 py-5">
        <h3 className="text-base font-bold mb-3">청약 자격</h3>
        <div className="space-y-2.5 text-sm">
          <CondRow label="청약통장" value={cond.needsAccount ? "필요" : "불필요"} />
          {cond.accountMonths && <CondRow label="가입기간" value={`${cond.accountMonths}개월 이상`} />}
          {cond.accountPayments && <CondRow label="납입횟수" value={`${cond.accountPayments}회 이상`} />}
          {cond.minDeposit && <CondRow label="예치금" value={`${formatPrice(cond.minDeposit)} 이상`} />}
          <CondRow label="무주택" value={cond.needsHomeless ? "필수" : "무관"} />
          <CondRow label="세대주" value={cond.needsHouseholder ? "필수" : "무관"} />
          {cond.incomeLimit && <CondRow label="소득기준" value={`도시근로자 ${cond.incomeLimit}% 이하`} />}
          {cond.assetLimit && <CondRow label="자산기준" value={`${formatPrice(cond.assetLimit)} 이하`} />}
          {cond.ageRange && <CondRow label="나이" value={`만 ${cond.ageRange.min}~${cond.ageRange.max}세`} />}
          {cond.needsSingle && <CondRow label="혼인" value="미혼만 가능" />}
          {cond.needsMarried && <CondRow label="혼인" value={`기혼 (${cond.marriageYears ?? ""}년 이내)`} />}
          {cond.notes && <p className="text-xs text-toss-gray-500 pt-1">{cond.notes}</p>}
        </div>
      </section>
    </div>
  );
}

function CondRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-toss-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
