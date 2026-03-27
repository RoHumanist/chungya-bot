import { NextResponse } from "next/server";
import { fetchAllSubscriptions } from "@/lib/api-client";
import { transformAll } from "@/lib/transform";
import { MOCK_SUBSCRIPTIONS } from "@/lib/mock-data";

/**
 * GET /api/subscriptions
 *
 * API 키 있으면 → 공공데이터포털 실데이터
 * API 키 없으면 → mock 데이터 폴백
 */
export async function GET() {
  const hasKey = !!process.env.PUBLIC_DATA_API_KEY;

  if (!hasKey) {
    return NextResponse.json(MOCK_SUBSCRIPTIONS);
  }

  try {
    const raw = await fetchAllSubscriptions();
    const subscriptions = transformAll(raw);

    // 기간 지난 건 제거 (마지막 일정이 오늘 이전이면)
    const today = new Date().toISOString().slice(0, 10);
    const active = subscriptions.filter((s) => {
      const lastDate =
        s.schedule.contractEndDate ??
        s.schedule.resultDate ??
        s.schedule.secondPriorityDate ??
        s.schedule.firstPriorityDate ??
        s.schedule.specialStartDate ??
        "9999-12-31";
      return lastDate >= today;
    });

    return NextResponse.json(active);
  } catch (e) {
    console.error("API fetch failed, falling back to mock:", e);
    return NextResponse.json(MOCK_SUBSCRIPTIONS);
  }
}
