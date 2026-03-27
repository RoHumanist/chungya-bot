/* ── 청약 유형 ── */
export type SubscriptionType =
  | "민간분양"
  | "공공분양"
  | "신혼희망타운"
  | "청년특별공급"
  | "행복주택"
  | "국민임대"
  | "장기전세"
  | "오피스텔";

export type SpecialType =
  | "일반"
  | "청년"
  | "신혼부부"
  | "생애최초"
  | "다자녀"
  | "노부모부양"
  | "국가유공자";

/* ── 청약 정보 ── */
export interface Subscription {
  id: string;
  name: string;
  type: SubscriptionType;
  region: string; // "서울 강남구"
  address: string;
  totalUnits: number;
  units: UnitInfo[];
  schedule: Schedule;
  conditions: Conditions;
  specialTypes: SpecialType[];
  sourceUrl?: string;
  fetchedAt: string;
}

export interface UnitInfo {
  area: number; // 전용면적 ㎡
  price: number; // 분양가 만원
  count: number;
}

export interface Schedule {
  announcementDate?: string;
  specialStartDate?: string;
  firstPriorityDate?: string;
  secondPriorityDate?: string;
  resultDate?: string;
  contractStartDate?: string;
  contractEndDate?: string;
}

export interface Conditions {
  needsAccount: boolean; // 청약통장 필요 여부
  accountMonths?: number; // 가입기간 (개월)
  accountPayments?: number; // 납입횟수
  minDeposit?: number; // 예치금 (만원)
  needsHomeless: boolean;
  needsHouseholder: boolean;
  incomeLimit?: number; // 도시근로자 월평균소득 대비 % (예: 100 = 100%)
  assetLimit?: number; // 자산기준 (만원)
  ageRange?: { min: number; max: number };
  needsSingle?: boolean; // 미혼 필수
  needsMarried?: boolean; // 기혼 필수
  marriageYears?: number; // 혼인 N년 이내
  notes?: string;
}

/* ── 유저 프로필 (내 조건) ── */
export interface UserProfile {
  // 기본
  age: number;
  isMarried: boolean;
  marriageYears: number;
  numChildren: number;

  // 주택
  isHomeless: boolean;
  isHouseholder: boolean;
  isFirstTimeBuyer: boolean; // 생애최초

  // 청약통장
  hasAccount: boolean;
  accountMonths: number;
  accountPayments: number;
  deposit: number; // 만원

  // 소득/자산
  monthlyIncome: number; // 만원
  totalAssets: number; // 만원

  // 관심
  regions: string[];
  types: SubscriptionType[];
}

export const DEFAULT_PROFILE: UserProfile = {
  age: 30,
  isMarried: false,
  marriageYears: 0,
  numChildren: 0,
  isHomeless: true,
  isHouseholder: false,
  isFirstTimeBuyer: true,
  hasAccount: true,
  accountMonths: 24,
  accountPayments: 24,
  deposit: 600,
  monthlyIncome: 350,
  totalAssets: 20000,
  regions: [],
  types: [],
};
