import type { Subscription, UserProfile } from "@/types/subscription";

export type MatchResult = {
  sub: Subscription;
  eligible: boolean;
  reasons: string[]; // 불가 사유
};

/** 사용자 프로필 기준으로 청약 매칭 */
export function matchAll(
  subs: Subscription[],
  profile: UserProfile
): MatchResult[] {
  return subs.map((sub) => {
    const reasons: string[] = [];

    // 지역 필터
    if (
      profile.regions.length > 0 &&
      !profile.regions.some((r) => sub.region.includes(r))
    ) {
      reasons.push("관심 지역 아님");
    }

    // 유형 필터
    if (
      profile.types.length > 0 &&
      !profile.types.includes(sub.type)
    ) {
      reasons.push("관심 유형 아님");
    }

    // 청약통장
    if (sub.conditions.needsAccount && !profile.hasAccount) {
      reasons.push("청약통장 필요");
    }
    if (
      sub.conditions.accountMonths &&
      profile.accountMonths < sub.conditions.accountMonths
    ) {
      reasons.push(`통장 ${sub.conditions.accountMonths}개월 이상 필요`);
    }
    if (
      sub.conditions.accountPayments &&
      profile.accountPayments < sub.conditions.accountPayments
    ) {
      reasons.push(`납입 ${sub.conditions.accountPayments}회 이상 필요`);
    }
    if (
      sub.conditions.minDeposit &&
      profile.deposit < sub.conditions.minDeposit
    ) {
      reasons.push(`예치금 ${sub.conditions.minDeposit}만원 이상 필요`);
    }

    // 무주택
    if (sub.conditions.needsHomeless && !profile.isHomeless) {
      reasons.push("무주택자만 가능");
    }

    // 세대주
    if (sub.conditions.needsHouseholder && !profile.isHouseholder) {
      reasons.push("세대주만 가능");
    }

    // 나이
    if (sub.conditions.ageRange) {
      const { min, max } = sub.conditions.ageRange;
      if (profile.age < min || profile.age > max) {
        reasons.push(`만 ${min}~${max}세만 가능`);
      }
    }

    // 혼인
    if (sub.conditions.needsSingle && profile.isMarried) {
      reasons.push("미혼만 가능");
    }
    if (sub.conditions.needsMarried && !profile.isMarried) {
      reasons.push("기혼만 가능");
    }
    if (
      sub.conditions.marriageYears &&
      profile.isMarried &&
      profile.marriageYears > sub.conditions.marriageYears
    ) {
      reasons.push(`혼인 ${sub.conditions.marriageYears}년 이내만 가능`);
    }

    // 소득 (대략 비교 - 도시근로자 월평균소득 약 400만원 기준)
    if (sub.conditions.incomeLimit) {
      const urbanAvg = 400; // 만원
      const limit = (urbanAvg * sub.conditions.incomeLimit) / 100;
      if (profile.monthlyIncome > limit) {
        reasons.push(`월소득 ${Math.round(limit)}만원 이하만 가능`);
      }
    }

    // 자산
    if (sub.conditions.assetLimit && profile.totalAssets > sub.conditions.assetLimit) {
      reasons.push(`총자산 ${sub.conditions.assetLimit}만원 이하만 가능`);
    }

    return { sub, eligible: reasons.length === 0, reasons };
  });
}

/** 다가오는 일정 순 정렬 */
export function sortByUpcoming(results: MatchResult[]): MatchResult[] {
  const now = new Date().toISOString().slice(0, 10);
  return [...results].sort((a, b) => {
    // 적격 먼저
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    return getNextDate(a.sub, now).localeCompare(getNextDate(b.sub, now));
  });
}

function getNextDate(sub: Subscription, now: string): string {
  const dates = [
    sub.schedule.specialStartDate,
    sub.schedule.firstPriorityDate,
    sub.schedule.secondPriorityDate,
    sub.schedule.resultDate,
  ].filter((d): d is string => !!d && d >= now);
  return dates[0] ?? "9999-12-31";
}
