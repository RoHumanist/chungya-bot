"use client";

import Link from "next/link";
import type { MatchResult } from "@/lib/match";
import { formatPrice, formatArea, dDay, formatDate } from "@/lib/format";

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  민간분양: { bg: "bg-blue-50", text: "text-blue-600" },
  공공분양: { bg: "bg-green-50", text: "text-green-600" },
  신혼희망타운: { bg: "bg-pink-50", text: "text-pink-600" },
  청년특별공급: { bg: "bg-purple-50", text: "text-purple-600" },
  행복주택: { bg: "bg-amber-50", text: "text-amber-600" },
  국민임대: { bg: "bg-teal-50", text: "text-teal-600" },
  장기전세: { bg: "bg-cyan-50", text: "text-cyan-600" },
  오피스텔: { bg: "bg-gray-100", text: "text-gray-600" },
};

export default function SubscriptionCard({ result }: { result: MatchResult }) {
  const { sub, eligible, reasons } = result;

  const nextDate =
    sub.schedule.specialStartDate ??
    sub.schedule.firstPriorityDate ??
    sub.schedule.resultDate;

  const minPrice = Math.min(...sub.units.map((u) => u.price));
  const maxPrice = Math.max(...sub.units.map((u) => u.price));
  const minArea = Math.min(...sub.units.map((u) => u.area));
  const maxArea = Math.max(...sub.units.map((u) => u.area));

  const color = TYPE_COLORS[sub.type] ?? TYPE_COLORS.오피스텔;

  return (
    <Link href={`/subscriptions/${sub.id}`}>
      <article
        className={`mx-4 mb-3 p-4 rounded-2xl border transition-colors active:scale-[0.98] ${
          eligible
            ? "bg-white border-toss-gray-100 shadow-sm"
            : "bg-toss-gray-50 border-toss-gray-100 opacity-70"
        }`}
      >
        {/* 상단: 유형 + D-day */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color.bg} ${color.text}`}>
              {sub.type}
            </span>
            {!eligible && (
              <span className="text-xs px-2 py-1 rounded-full bg-toss-red/10 text-toss-red font-medium">
                조건 불일치
              </span>
            )}
          </div>
          {nextDate && (
            <span className={`text-sm font-bold ${eligible ? "text-toss-blue" : "text-toss-gray-500"}`}>
              {dDay(nextDate)}
            </span>
          )}
        </div>

        {/* 단지명 + 지역 */}
        <h3 className="text-lg font-bold text-toss-black leading-tight">{sub.name}</h3>
        <p className="text-sm text-toss-gray-500 mt-0.5">{sub.region} · {sub.totalUnits.toLocaleString()}세대</p>

        {/* 핵심 정보 그리드 */}
        <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-toss-gray-100">
          <InfoCell
            label="분양가"
            value={
              minPrice === maxPrice
                ? formatPrice(minPrice)
                : `${formatPrice(minPrice)}~`
            }
          />
          <InfoCell
            label="면적"
            value={
              minArea === maxArea
                ? formatArea(minArea)
                : `${minArea}~${maxArea}㎡`
            }
          />
          <InfoCell
            label="청약일"
            value={nextDate ? formatDate(nextDate).replace(/\s*\(.\)/, "") : "-"}
          />
        </div>

        {/* 불가 사유 (비적격일 때만) */}
        {!eligible && reasons.length > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-toss-gray-100">
            <p className="text-xs text-toss-gray-500">
              {reasons.slice(0, 2).join(" · ")}
              {reasons.length > 2 && ` 외 ${reasons.length - 2}건`}
            </p>
          </div>
        )}
      </article>
    </Link>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-toss-gray-500">{label}</p>
      <p className="text-sm font-semibold text-toss-gray-900 mt-0.5">{value}</p>
    </div>
  );
}
