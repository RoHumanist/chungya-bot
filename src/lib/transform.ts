/**
 * 공공데이터 API 응답 → 앱 Subscription 타입 변환
 */

import type { Subscription, SubscriptionType, SpecialType, UnitInfo } from "@/types/subscription";
import type { ApiAptItem, ApiUnitItem } from "./api-client";

/** 주택구분코드명 → 앱 유형 매핑 */
function mapType(item: ApiAptItem): SubscriptionType {
  const nm = item.HOUSE_DTL_SECD_NM ?? item.HOUSE_SECD_NM ?? "";

  if (nm.includes("오피스텔")) return "오피스텔";
  if (nm.includes("도시형")) return "오피스텔"; // 도시형은 오피스텔과 유사 취급
  if (nm.includes("민간임대") || nm.includes("공공지원민간")) return "민간분양";
  if (nm.includes("국민임대")) return "국민임대";
  if (nm.includes("행복주택")) return "행복주택";
  if (nm.includes("장기전세")) return "장기전세";

  // 공공 vs 민간 구분
  const secd = item.HOUSE_SECD ?? "";
  if (secd === "01" || nm.includes("공공")) return "공공분양";

  return "민간분양";
}

/** 주택명에서 특별공급 유형 추정 */
function guessSpecialTypes(item: ApiAptItem): SpecialType[] {
  const types: SpecialType[] = ["일반"];
  const nm = (item.HOUSE_NM ?? "") + (item.HOUSE_DTL_SECD_NM ?? "");

  if (nm.includes("신혼") || nm.includes("신혼희망")) types.push("신혼부부");
  if (nm.includes("청년")) types.push("청년");
  if (nm.includes("생애최초")) types.push("생애최초");
  if (nm.includes("다자녀")) types.push("다자녀");

  // 대부분의 APT는 신혼/생애최초/다자녀 특공이 있음
  const subType = mapType(item);
  if (subType === "민간분양" || subType === "공공분양") {
    if (!types.includes("신혼부부")) types.push("신혼부부");
    if (!types.includes("생애최초")) types.push("생애최초");
  }

  return types;
}

/** 지역명 추출 - 수도권(서울/경기/인천) */
function parseRegion(item: ApiAptItem): string {
  const area = item.SUBSCRPT_AREA_CODE_NM ?? "";
  const addr = item.HSSPLY_ADRES ?? "";

  const seoulMatch = addr.match(/서울(?:특별시)?\s*(\S+구)/);
  if (seoulMatch) return `서울 ${seoulMatch[1]}`;

  const gyeonggiMatch = addr.match(/경기(?:도)?\s*(\S+시)/);
  if (gyeonggiMatch) return `경기 ${gyeonggiMatch[1]}`;

  const incheonMatch = addr.match(/인천(?:광역시)?\s*(\S+구)/);
  if (incheonMatch) return `인천 ${incheonMatch[1]}`;

  if (area.includes("서울")) return "서울";
  if (area.includes("경기")) return "경기";
  if (area.includes("인천")) return "인천";

  return area || "기타";
}

/** 유형별 기본 조건 생성 */
function buildConditions(item: ApiAptItem, subType: SubscriptionType) {
  // 민간분양: 조건 느슨
  if (subType === "민간분양") {
    return {
      needsAccount: true,
      minDeposit: 300, // 서울 기준 최소 300만원
      needsHomeless: false,
      needsHouseholder: false,
    };
  }

  // 공공분양: 소득/자산 기준
  if (subType === "공공분양") {
    return {
      needsAccount: true,
      accountMonths: 24,
      accountPayments: 24,
      needsHomeless: true,
      needsHouseholder: false,
      incomeLimit: 100,
      assetLimit: 37900,
    };
  }

  // 행복주택: 통장 불필요
  if (subType === "행복주택") {
    return {
      needsAccount: false,
      needsHomeless: true,
      needsHouseholder: false,
      incomeLimit: 100,
      ageRange: { min: 19, max: 39 } as { min: number; max: number },
    };
  }

  // 국민임대
  if (subType === "국민임대") {
    return {
      needsAccount: true,
      accountMonths: 6,
      accountPayments: 6,
      needsHomeless: true,
      needsHouseholder: false,
      incomeLimit: 70,
      assetLimit: 37900,
    };
  }

  // 오피스텔: 거의 무조건
  if (subType === "오피스텔") {
    return {
      needsAccount: false,
      needsHomeless: false,
      needsHouseholder: false,
    };
  }

  // 기본값
  return {
    needsAccount: true,
    needsHomeless: true,
    needsHouseholder: false,
  };
}

/** API 단건 → Subscription 변환 */
export function transformApt(
  item: ApiAptItem,
  unitItems: ApiUnitItem[] = []
): Subscription {
  const subType = mapType(item);

  const units: UnitInfo[] = unitItems.map((u) => ({
    area: Math.round(u.SUPLY_AR * 0.3025 * 10) / 10, // 공급면적 → 전용면적 대략 환산
    price: u.LTTOT_TOP_AMOUNT ?? 0,
    count: u.SUPLY_HSHLDCO ?? 0,
  }));

  return {
    id: `${item.HOUSE_MANAGE_NO}-${item.PBLANC_NO}`,
    name: item.HOUSE_NM ?? "이름 없음",
    type: subType,
    region: parseRegion(item),
    address: item.HSSPLY_ADRES ?? "",
    totalUnits: item.TOT_SUPLY_HSHLDCO ?? 0,
    units: units.length > 0 ? units : [{ area: 0, price: 0, count: item.TOT_SUPLY_HSHLDCO ?? 0 }],
    schedule: {
      announcementDate: item.RCRIT_PBLANC_DE || undefined,
      specialStartDate: item.SPSPLY_RCEPT_BGNDE || undefined,
      firstPriorityDate: item.GNRL_RNK1_CRSPAREA_RCPTDE || undefined,
      secondPriorityDate: item.GNRL_RNK2_CRSPAREA_RCPTDE || undefined,
      resultDate: item.PRZWNER_PRESNATN_DE || undefined,
      contractStartDate: item.CNTRCT_CNCLS_BGNDE || undefined,
      contractEndDate: item.CNTRCT_CNCLS_ENDDE || undefined,
    },
    conditions: buildConditions(item, subType),
    specialTypes: guessSpecialTypes(item),
    sourceUrl: item.HMPG_ADRES || undefined,
    fetchedAt: new Date().toISOString(),
  };
}

/** 전체 변환 (단위정보 없이 기본 변환) */
export function transformAll(items: ApiAptItem[]): Subscription[] {
  return items
    .map((item) => transformApt(item))
    .filter((sub) => // 수도권만
      sub.region.includes("서울") ||
      sub.region.includes("경기") ||
      sub.region.includes("인천")
    );
}
