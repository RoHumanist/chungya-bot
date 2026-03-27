"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/filter-context";
import type { SubscriptionType, UserProfile } from "@/types/subscription";

/* ── 지역 데이터: 시·도 → 시·군·구 ── */
const REGIONS: { code: string; name: string; group: string; subs?: string[] }[] = [
  { code: "100", name: "서울", group: "수도권", subs: [
    "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구",
    "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구",
    "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구",
  ]},
  { code: "410", name: "경기", group: "수도권", subs: [
    "수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시", "남양주시",
    "화성시", "평택시", "의정부시", "시흥시", "파주시", "광명시", "김포시", "군포시",
    "광주시", "이천시", "양주시", "오산시", "구리시", "안성시", "포천시", "의왕시",
    "하남시", "여주시", "양평군", "동두천시", "과천시", "가평군", "연천군",
  ]},
  { code: "400", name: "인천", group: "수도권", subs: [
    "중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구", "강화군", "옹진군",
  ]},
  { code: "600", name: "부산", group: "영남" },
  { code: "700", name: "대구", group: "영남" },
  { code: "680", name: "울산", group: "영남" },
  { code: "621", name: "경남", group: "영남" },
  { code: "712", name: "경북", group: "영남" },
  { code: "500", name: "광주", group: "호남" },
  { code: "560", name: "전북", group: "호남" },
  { code: "513", name: "전남", group: "호남" },
  { code: "300", name: "대전", group: "충청" },
  { code: "338", name: "세종", group: "충청" },
  { code: "360", name: "충북", group: "충청" },
  { code: "312", name: "충남", group: "충청" },
  { code: "200", name: "강원", group: "기타" },
  { code: "690", name: "제주", group: "기타" },
];

const REGION_GROUPS = ["수도권", "영남", "호남", "충청", "기타"];

const SUB_TYPES: { value: SubscriptionType; label: string; desc: string }[] = [
  { value: "민간분양", label: "민간분양", desc: "소득 무관, 통장잔액 기준" },
  { value: "공공분양", label: "공공분양", desc: "소득·자산 기준, 저렴" },
  { value: "신혼희망타운", label: "신혼희망타운", desc: "신혼부부 대상" },
  { value: "청년특별공급", label: "청년주택", desc: "만 19~39세 미혼" },
  { value: "행복주택", label: "행복주택", desc: "청약통장 불필요" },
  { value: "국민임대", label: "국민임대", desc: "저소득 대상 임대" },
  { value: "장기전세", label: "장기전세", desc: "전세금으로 장기 거주" },
  { value: "오피스텔", label: "오피스텔", desc: "조건 거의 없음" },
];

interface Props {
  isOnboarding?: boolean;
}

export default function ProfileForm({ isOnboarding }: Props) {
  const router = useRouter();
  const { profile, setProfile, save, dirty } = useProfile();

  const update = (partial: Partial<UserProfile>) => {
    setProfile({ ...profile, ...partial });
  };

  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const isAllRegions = profile.regions.includes("__ALL__");

  const toggleRegion = (region: string) => {
    const base = profile.regions.filter((r) => r !== "__ALL__");
    update({
      regions: base.includes(region)
        ? base.filter((r) => r !== region)
        : [...base, region],
    });
  };

  const toggleRegionAll = (regionName: string, subs: string[]) => {
    const base = profile.regions.filter((r) => r !== "__ALL__");
    const prefixed = subs.map((s) => `${regionName} ${s}`);
    const allSelected = prefixed.every((p) => base.includes(p));
    if (allSelected) {
      update({ regions: base.filter((r) => !prefixed.includes(r)) });
    } else {
      update({ regions: [...new Set([...base, ...prefixed])] });
    }
  };

  const selectAllRegions = () => {
    if (isAllRegions) update({ regions: [] });
    else update({ regions: ["__ALL__"] });
  };

  const toggleType = (t: SubscriptionType) => {
    update({
      types: profile.types.includes(t)
        ? profile.types.filter((v) => v !== t)
        : [...profile.types, t],
    });
  };

  const handleSave = () => {
    save();
    if (isOnboarding) {
      router.push("/subscriptions");
    }
  };

  return (
    <div className="pb-32">
      {/* 기본 정보 */}
      <Section title="기본 정보">
        <Row label="나이">
          <NumberInput value={profile.age} onChange={(v) => update({ age: v })} suffix="세" min={0} max={120} />
        </Row>
        <Toggle label="기혼" value={profile.isMarried} onChange={(v) => update({ isMarried: v })} />
        {profile.isMarried && (
          <Row label="혼인 경과">
            <NumberInput value={profile.marriageYears} onChange={(v) => update({ marriageYears: v })} suffix="년" min={0} max={50} />
          </Row>
        )}
        <Row label="자녀 수">
          <NumberInput value={profile.numChildren} onChange={(v) => update({ numChildren: v })} suffix="명" min={0} max={20} />
        </Row>
      </Section>

      <Divider />

      {/* 주택 */}
      <Section title="주택 상태">
        <Toggle label="무주택자" value={profile.isHomeless} onChange={(v) => update({ isHomeless: v })} />
        <Toggle label="세대주" value={profile.isHouseholder} onChange={(v) => update({ isHouseholder: v })} />
        <Toggle label="생애최초 주택구입" value={profile.isFirstTimeBuyer} onChange={(v) => update({ isFirstTimeBuyer: v })} />
      </Section>

      <Divider />

      {/* 청약통장 */}
      <Section title="청약통장">
        <Toggle label="청약통장 보유" value={profile.hasAccount} onChange={(v) => update({ hasAccount: v })} />
        {profile.hasAccount && (
          <>
            <Row label="가입 기간">
              <NumberInput value={profile.accountMonths} onChange={(v) => update({ accountMonths: v })} suffix="개월" min={0} max={600} />
            </Row>
            <Row label="납입 횟수">
              <NumberInput value={profile.accountPayments} onChange={(v) => update({ accountPayments: v })} suffix="회" min={0} max={600} />
            </Row>
            <Row label="예치금">
              <NumberInput value={profile.deposit} onChange={(v) => update({ deposit: v })} suffix="만원" width="w-28" />
            </Row>
          </>
        )}
      </Section>

      <Divider />

      {/* 소득/자산 */}
      <Section title="소득 · 자산">
        <Row label="월소득">
          <NumberInput value={profile.monthlyIncome} onChange={(v) => update({ monthlyIncome: v })} suffix="만원" width="w-28" />
        </Row>
        <Row label="총자산">
          <NumberInput value={profile.totalAssets} onChange={(v) => update({ totalAssets: v })} suffix="만원" width="w-32" />
        </Row>
      </Section>

      <Divider />

      {/* 관심 유형 */}
      <Section title="관심 유형" hint="선택 안 하면 전체">
        <div className="space-y-2">
          {SUB_TYPES.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => toggleType(value)}
              className={`w-full text-left p-3 rounded-xl border transition-colors ${
                profile.types.includes(value)
                  ? "border-toss-blue bg-toss-blue-light"
                  : "border-toss-gray-100 bg-white"
              }`}
            >
              <p className={`text-sm font-semibold ${profile.types.includes(value) ? "text-toss-blue" : "text-toss-gray-900"}`}>
                {label}
              </p>
              <p className="text-xs text-toss-gray-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </Section>

      <Divider />

      {/* 관심 지역 */}
      <Section title="관심 지역">
        <div className="space-y-3">
          {/* 전국 전체 버튼 */}
          <button
            onClick={selectAllRegions}
            className={`w-full py-3 rounded-2xl text-sm font-semibold transition-all border-2 ${
              isAllRegions
                ? "border-toss-blue bg-toss-blue-light text-toss-blue"
                : "border-toss-gray-100 bg-white text-toss-gray-700"
            }`}
          >
            전국 전체
          </button>

          {isAllRegions && (
            <p className="text-sm text-toss-blue font-medium text-center">
              전국의 모든 청약을 보여드릴게요
            </p>
          )}

          {!isAllRegions && REGION_GROUPS.map((group) => {
            const items = REGIONS.filter((r) => r.group === group);
            return (
              <div key={group}>
                <p className="text-xs font-bold text-toss-gray-500 mb-2">{group}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((r) => {
                    const hasSubs = r.subs && r.subs.length > 0;
                    const isExpanded = expandedRegion === r.code;
                    const subSelected = hasSubs
                      ? r.subs!.filter((s) => profile.regions.includes(`${r.name} ${s}`)).length
                      : 0;
                    const regionSelected = profile.regions.includes(r.name);

                    return (
                      <div key={r.code} className="contents">
                        <button
                          onClick={() => {
                            if (hasSubs) {
                              // 자동 expand: 클릭하면 바로 하위 지역 보여줌
                              if (isExpanded) {
                                setExpandedRegion(null);
                              } else {
                                setExpandedRegion(r.code);
                                // 하위 없이 시·도만 선택되어있었으면 제거 (하위 선택으로 전환)
                                if (regionSelected) {
                                  update({ regions: profile.regions.filter((reg) => reg !== r.name) });
                                }
                              }
                            } else {
                              toggleRegion(r.name);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            regionSelected || subSelected > 0
                              ? "bg-toss-blue text-white font-semibold"
                              : "bg-toss-gray-100 text-toss-gray-700"
                          }`}
                        >
                          {r.name}
                          {hasSubs && subSelected > 0 && (
                            <span className="ml-1 text-xs opacity-80">{subSelected}</span>
                          )}
                          {hasSubs && (
                            <span className="ml-0.5 text-[10px]">{isExpanded ? "▲" : "▼"}</span>
                          )}
                        </button>

                        {/* 하위 지역 (구/시) */}
                        {hasSubs && isExpanded && (
                          <div className="w-full mt-1 mb-2 ml-2 flex flex-wrap gap-1.5">
                            <button
                              onClick={() => toggleRegionAll(r.name, r.subs!)}
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                                subSelected === r.subs!.length
                                  ? "bg-toss-blue text-white"
                                  : "bg-toss-gray-200 text-toss-gray-600"
                              }`}
                            >
                              전체
                            </button>
                            {r.subs!.map((sub) => {
                              const full = `${r.name} ${sub}`;
                              return (
                                <button
                                  key={sub}
                                  onClick={() => toggleRegion(full)}
                                  className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                                    profile.regions.includes(full)
                                      ? "bg-toss-blue text-white font-semibold"
                                      : "bg-toss-gray-100 text-toss-gray-600"
                                  }`}
                                >
                                  {sub}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* 저장 버튼 - 고정 */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white px-5 py-3 border-t border-toss-gray-100 z-50">
        <button
          onClick={handleSave}
          className={`w-full py-3.5 rounded-2xl font-semibold text-base transition-colors ${
            isOnboarding || dirty
              ? "bg-toss-blue text-white active:bg-blue-600"
              : "bg-toss-gray-200 text-toss-gray-500"
          }`}
        >
          {isOnboarding ? "청약 보러가기" : dirty ? "저장하기" : "변경사항 없음"}
        </button>
      </div>
    </div>
  );
}

/* ── 작은 컴포넌트들 ── */

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="px-5 py-4">
      <h3 className="text-base font-bold mb-1">{title}</h3>
      {hint && <p className="text-xs text-toss-gray-500 mb-3">{hint}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function Divider() {
  return <hr className="border-toss-gray-100 mx-5" />;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-toss-gray-700">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-toss-gray-700">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-7 rounded-full transition-colors ${value ? "bg-toss-blue" : "bg-toss-gray-300"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

function NumberInput({
  value, onChange, suffix, width = "w-20", min = 0, max,
}: {
  value: number; onChange: (v: number) => void; suffix: string; width?: string; min?: number; max?: number;
}) {
  const clamp = (v: number) => {
    let n = isNaN(v) ? min : v;
    n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    return n;
  };
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className={`${width} px-3 py-2 border border-toss-gray-300 rounded-xl text-sm text-right focus:outline-none focus:border-toss-blue`}
      />
      <span className="text-sm text-toss-gray-500">{suffix}</span>
    </div>
  );
}
