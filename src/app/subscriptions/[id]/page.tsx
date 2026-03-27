"use client";

import { use } from "react";
import { useSubscriptions } from "@/lib/use-subscriptions";
import { formatPrice, formatArea, dDay, formatDate } from "@/lib/format";
import type { Subscription, SubscriptionType } from "@/types/subscription";

/* ── 청약 전략 가이드 (유형별) ── */
const STRATEGY: Record<SubscriptionType, { title: string; tips: string[] }> = {
  민간분양: {
    title: "민간분양 전략",
    tips: [
      "가점제 vs 추첨제 확인 — 85㎡ 이하는 가점 75% + 추첨 25%",
      "추첨제는 무주택이면 누구나 동일 확률, 가점 낮으면 추첨 노려보세요",
      "예치금 기준 확인 — 서울 85㎡ 이하는 300만원, 초과는 500만원",
      "1순위: 수도권 1년+ 거주, 청약통장 12개월+ 가입",
    ],
  },
  공공분양: {
    title: "공공분양 전략",
    tips: [
      "소득·자산 기준이 핵심 — 도시근로자 월평균소득 대비 확인",
      "특별공급 먼저 확인: 신혼·생애최초·다자녀 등 우선 기회",
      "가점보다 자격 요건 충족이 중요",
      "사전청약 당첨 시 본청약까지 자격 유지 필수",
    ],
  },
  청년특별공급: {
    title: "청년특별 전략",
    tips: [
      "만 19~39세 미혼 무주택자 대상",
      "본인 소득 월평균 140% 이하 (약 490만원)",
      "부모 소득 합산이 아닌 본인 소득만 봄",
      "청약통장 가입기간이 길수록 유리 (순위 가점)",
    ],
  },
  신혼희망타운: {
    title: "신혼부부 전략",
    tips: [
      "혼인 7년 이내 or 예비신혼부부 (6개월 내 결혼 예정)",
      "소득 130% 이하 (맞벌이 140%)",
      "자녀 있으면 가점 유리",
      "당첨 후 입주까지 혼인 유지 필요",
    ],
  },
  행복주택: {
    title: "행복주택 전략",
    tips: [
      "청약통장 불필요 — 별도 신청",
      "대학생·청년·신혼부부·고령자 등 대상별 자격 다름",
      "시세 60~80% 수준 임대료",
      "거주 기간 제한 있음 (청년 6년, 신혼 10년 등)",
    ],
  },
  국민임대: {
    title: "국민임대 전략",
    tips: [
      "월평균소득 70% 이하 (1인 90%)",
      "시세 대비 60~80% 임대료",
      "최장 30년 거주 가능",
      "자산 기준도 있으니 확인 필수",
    ],
  },
  장기전세: {
    title: "장기전세 전략",
    tips: [
      "전세금만으로 장기 거주 (최대 20년)",
      "무주택세대구성원 대상",
      "주변 시세 80% 이하 전세금",
      "소득 기준 없는 경우 많음 — 확인 필요",
    ],
  },
  오피스텔: {
    title: "오피스텔 전략",
    tips: [
      "만 19세 이상 누구나 신청 가능 (주택 수 무관)",
      "청약통장 불필요 — 추첨 100%",
      "투자 목적 시 전매제한·세금 확인",
      "실거주라면 전용면적·관리비 꼭 확인",
    ],
  },
};

/* ── 일정 상태 뱃지 ── */
function getScheduleStatus(dateStr: string): { label: string; color: string } {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return { label: "완료", color: "bg-toss-gray-100 text-toss-gray-500" };
  if (diff === 0) return { label: "오늘!", color: "bg-red-100 text-red-600" };
  if (diff <= 3) return { label: "임박", color: "bg-orange-100 text-orange-600" };
  if (diff <= 7) return { label: "이번주", color: "bg-toss-blue-light text-toss-blue" };
  return { label: "", color: "" };
}

/* ── 다음 주요 일정 찾기 ── */
function getNextEvent(sub: Subscription): { label: string; date: string } | null {
  const events = [
    { label: "특별공급", date: sub.schedule.specialStartDate },
    { label: "1순위 접수", date: sub.schedule.firstPriorityDate },
    { label: "2순위 접수", date: sub.schedule.secondPriorityDate },
    { label: "당첨 발표", date: sub.schedule.resultDate },
    { label: "계약 시작", date: sub.schedule.contractStartDate },
  ].filter((e) => e.date) as { label: string; date: string }[];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return events.find((e) => new Date(e.date) >= today) ?? null;
}

export default function SubscriptionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { subscriptions, isLoading } = useSubscriptions();
  const sub = subscriptions.find((s) => s.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh text-toss-gray-500">
        불러오는 중...
      </div>
    );
  }

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
  const strategy = STRATEGY[sub.type];
  const nextEvent = getNextEvent(sub);

  return (
    <div className="pb-24">
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

      {/* 다음 일정 하이라이트 */}
      {nextEvent && (
        <div className="mx-5 mt-4 p-4 rounded-2xl bg-toss-blue-light">
          <p className="text-xs text-toss-blue font-semibold mb-1">다음 일정</p>
          <p className="text-lg font-bold text-toss-blue">
            {nextEvent.label} {dDay(nextEvent.date)}
          </p>
          <p className="text-sm text-toss-blue opacity-80 mt-0.5">
            {formatDate(nextEvent.date)}
          </p>
        </div>
      )}

      {/* 메인 */}
      <section className="px-5 pt-5 pb-4">
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

      {/* 일정 (상태 뱃지 포함) */}
      <section className="px-5 py-5">
        <h3 className="text-base font-bold mb-3">청약 일정</h3>
        <div className="space-y-3">
          {scheduleItems.map(({ label, date }) => {
            const status = getScheduleStatus(date!);
            return (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-toss-gray-500">{label}</span>
                  {status.label && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{formatDate(date!)}</span>
                  <span className="text-xs text-toss-blue font-semibold ml-2">{dDay(date!)}</span>
                </div>
              </div>
            );
          })}
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

      <hr className="border-toss-gray-100 mx-5" />

      {/* 이렇게 넣으세요! 전략 가이드 */}
      {strategy && (
        <section className="px-5 py-5">
          <h3 className="text-base font-bold mb-1">{strategy.title}</h3>
          <p className="text-xs text-toss-gray-500 mb-3">이렇게 넣으세요!</p>
          <div className="space-y-2.5">
            {strategy.tips.map((tip, i) => (
              <div key={i} className="flex gap-2.5">
                <span className="text-toss-blue font-bold text-sm mt-0.5">{i + 1}</span>
                <p className="text-sm text-toss-gray-700 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 하단 고정: 청약 신청 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white px-5 py-4 border-t border-toss-gray-100 z-50">
        <a
          href={sub.sourceUrl || "https://www.applyhome.co.kr"}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3.5 rounded-2xl bg-toss-blue text-white font-semibold text-base text-center active:bg-blue-700 transition-colors"
        >
          청약홈에서 신청하기
        </a>
      </div>
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
