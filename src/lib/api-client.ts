/**
 * 공공데이터포털 - 한국부동산원 청약홈 분양정보 조회 서비스
 * https://www.data.go.kr/data/15098547/openapi.do
 *
 * 수도권(서울/경기/인천) + 지역코드 없는 전국건 조회
 * API 키 없으면 mock 폴백
 */

const BASE_URL =
  "https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1";

const API_KEY = process.env.PUBLIC_DATA_API_KEY ?? "";

// 수도권 지역코드
const METRO_REGIONS = [
  { code: "100", name: "서울" },
  { code: "410", name: "경기" },
  { code: "400", name: "인천" },
];

/* ── 공공데이터 API 응답 타입 ── */

export interface ApiAptItem {
  HOUSE_MANAGE_NO: string;
  PBLANC_NO: string;
  HOUSE_NM: string;
  HOUSE_SECD: string;
  HOUSE_SECD_NM: string;
  HOUSE_DTL_SECD: string;
  HOUSE_DTL_SECD_NM: string;
  RENT_SECD?: string;
  RENT_SECD_NM?: string;
  SUBSCRPT_AREA_CODE: string;
  SUBSCRPT_AREA_CODE_NM: string;
  HSSPLY_ZIP?: string;
  HSSPLY_ADRES: string;
  TOT_SUPLY_HSHLDCO: number;
  RCRIT_PBLANC_DE: string;
  RCEPT_BGNDE?: string;
  RCEPT_ENDDE?: string;
  SPSPLY_RCEPT_BGNDE?: string;
  SPSPLY_RCEPT_ENDDE?: string;
  GNRL_RNK1_CRSPAREA_RCPTDE?: string;
  GNRL_RNK1_CRSPAREA_ENDDE?: string;
  GNRL_RNK1_ETC_GG_RCPTDE?: string;
  GNRL_RNK1_ETC_GG_ENDDE?: string;
  GNRL_RNK1_ETC_AREA_RCPTDE?: string;
  GNRL_RNK1_ETC_AREA_ENDDE?: string;
  GNRL_RNK2_CRSPAREA_RCPTDE?: string;
  GNRL_RNK2_CRSPAREA_ENDDE?: string;
  GNRL_RNK2_ETC_GG_RCPTDE?: string;
  GNRL_RNK2_ETC_GG_ENDDE?: string;
  GNRL_RNK2_ETC_AREA_RCPTDE?: string;
  GNRL_RNK2_ETC_AREA_ENDDE?: string;
  PRZWNER_PRESNATN_DE?: string;
  CNTRCT_CNCLS_BGNDE?: string;
  CNTRCT_CNCLS_ENDDE?: string;
  HMPG_ADRES?: string;
  CNSTRCT_ENTRPS_NM?: string;
  MDHS_TELNO?: string;
  BSNS_MBY_NM?: string;
  MVN_PREARNGE_YM?: string;
  SPECLT_RDN_EARTH_AT?: string;
  MDAT_TRGET_AREA_SECD?: string;
  PARCPRC_ULS_AT?: string;
  IMPRMN_BSNS_AT?: string;
  PBLANC_URL?: string;
  NSPRC_NM?: string;
  [key: string]: unknown;
}

export interface ApiUnitItem {
  HOUSE_MANAGE_NO: string;
  PBLANC_NO: string;
  MODEL_NO: string;
  HOUSE_TY: string;
  SUPLY_AR: number;
  SPSPLY_HSHLDCO?: number;
  GNRL_SUPLY_HSHLDCO?: number;
  SUPLY_HSHLDCO: number;
  LTTOT_TOP_AMOUNT?: number;
  [key: string]: unknown;
}

interface ApiResponse<T> {
  currentCount: number;
  data: T[];
  matchCount: number;
  page: number;
  perPage: number;
  totalCount: number;
}

/* ── API 호출 ── */

async function fetchApi<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  if (!API_KEY) return [];

  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("serviceKey", API_KEY);
  url.searchParams.set("page", "1");
  url.searchParams.set("perPage", "100");

  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.error(`API ${endpoint} failed: ${res.status}`);
    return [];
  }

  const body: ApiResponse<T> = await res.json();
  return body.data ?? [];
}

/** 수도권 + 전국건 병렬 조회 */
async function fetchMetro<T>(endpoint: string): Promise<T[]> {
  const tasks = [
    // 수도권 지역별
    ...METRO_REGIONS.map((r) =>
      fetchApi<T>(endpoint, { "cond[SUBSCRPT_AREA_CODE::EQ]": r.code })
    ),
    // 지역코드 없는 전국/광역권 건 (서울+경기+인천 포함 가능)
    fetchApi<T>(endpoint),
  ];

  const results = await Promise.allSettled(tasks);
  const all: T[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }
  return all;
}

/* ── 공개 API ── */

export async function fetchAllSubscriptions() {
  const endpoints = [
    "getAPTLttotPblancDetail",
    "getUrbtyOfctlLttotPblancDetail",
    "getRemndrLttotPblancDetail",
    "getPblPvtRentLttotPblancDetail",
    "getOPTLttotPblancDetail",
  ] as const;

  const results = await Promise.all(
    endpoints.map((ep) => fetchMetro<ApiAptItem>(ep))
  );

  const all = results.flat();

  // 중복 제거 (주택관리번호 + 공고번호)
  const seen = new Set<string>();
  return all.filter((item) => {
    const key = `${item.HOUSE_MANAGE_NO}-${item.PBLANC_NO}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchUnitDetails(
  houseManageNo: string,
  pblancNo: string,
  houseSecd: string
): Promise<ApiUnitItem[]> {
  const endpoint = ["01", "09", "10"].includes(houseSecd)
    ? "getAPTLttotPblancMdl"
    : "getUrbtyOfctlLttotPblancMdl";

  return fetchApi<ApiUnitItem>(endpoint, {
    "cond[HOUSE_MANAGE_NO::EQ]": houseManageNo,
    "cond[PBLANC_NO::EQ]": pblancNo,
  });
}
