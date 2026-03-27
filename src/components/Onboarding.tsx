"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/filter-context";
import type { UserProfile, SubscriptionType } from "@/types/subscription";

/* ── 스텝 정의 ── */
const STEPS = [
  { id: "welcome", title: "반가워요!", sub: "몇 가지만 알려주시면\n딱 맞는 청약을 찾아드릴게요", emoji: "👋" },
  { id: "age", title: "나이가 어떻게 되세요?", sub: "", emoji: "" },
  { id: "marriage", title: "결혼하셨나요?", sub: "", emoji: "" },
  { id: "housing", title: "주택 상태를 알려주세요", sub: "", emoji: "" },
  { id: "account", title: "청약통장이 있으신가요?", sub: "", emoji: "" },
  { id: "income", title: "소득과 자산을 알려주세요", sub: "대략적이면 충분해요", emoji: "" },
  { id: "interest", title: "관심 있는 청약 유형은?", sub: "선택 안 하면 전체 다 보여드려요", emoji: "" },
  { id: "region", title: "관심 지역이 있으세요?", sub: "선택 안 하면 전국 전체", emoji: "" },
] as const;

const ENCOURAGEMENTS = [
  "", // welcome
  "좋아요! 시작해볼까요?",
  "잘하고 계세요!",
  "거의 다 왔어요!",
  "조금만 더요!",
  "마지막 스텝이에요!",
  "거의 끝났어요! 💪",
  "마지막이에요!",
];

const REGIONS: { code: string; name: string; group?: string }[] = [
  { code: "100", name: "서울", group: "수도권" },
  { code: "410", name: "경기", group: "수도권" },
  { code: "400", name: "인천", group: "수도권" },
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

const REGION_GROUPS = ["수도권", "영남", "호남", "충청", "기타"] as const;
const SUDOGWON = REGIONS.filter((r) => r.group === "수도권").map((r) => r.code);

const SUB_TYPES: { value: SubscriptionType; label: string; desc: string }[] = [
  { value: "민간분양", label: "민간분양", desc: "통장 잔액 기준" },
  { value: "공공분양", label: "공공분양", desc: "소득·자산 기준, 저렴" },
  { value: "신혼희망타운", label: "신혼희망타운", desc: "신혼부부 대상" },
  { value: "청년특별공급", label: "청년주택", desc: "만 19~39세 미혼" },
  { value: "행복주택", label: "행복주택", desc: "통장 불필요" },
  { value: "국민임대", label: "국민임대", desc: "저소득 대상" },
  { value: "장기전세", label: "장기전세", desc: "전세금 장기 거주" },
  { value: "오피스텔", label: "오피스텔", desc: "조건 거의 없음" },
];

export default function Onboarding() {
  const router = useRouter();
  const { profile, setProfile, save } = useProfile();
  const [step, setStep] = useState(0);

  const update = useCallback(
    (partial: Partial<UserProfile>) => setProfile({ ...profile, ...partial }),
    [profile, setProfile]
  );

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };
  const back = () => step > 0 && setStep(step - 1);
  const skip = () => next(); // 스킵 = 기본값으로 넘기기

  const finish = () => {
    save();
    router.push("/subscriptions");
  };

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* 프로그레스 바 */}
      {!isFirst && (
        <div className="h-1 bg-toss-gray-100">
          <div
            className="h-full bg-toss-blue transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 상단 네비 */}
      {!isFirst && (
        <div className="flex items-center px-4 py-3">
          <button onClick={back} className="p-1 -ml-1 text-toss-gray-700">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {/* 격려 메시지 */}
      {ENCOURAGEMENTS[step] && (
        <div className="px-6 pt-2">
          <span className="text-sm font-medium text-toss-blue">
            {ENCOURAGEMENTS[step]}
          </span>
        </div>
      )}

      {/* 질문 헤더 */}
      <div className="px-6 pt-4 pb-6">
        {s.emoji && <p className="text-4xl mb-4">{s.emoji}</p>}
        <h1 className="text-[26px] font-bold leading-tight whitespace-pre-line">
          {s.title}
        </h1>
        {s.sub && (
          <p className="text-base text-toss-gray-500 mt-2 leading-relaxed whitespace-pre-line">
            {s.sub}
          </p>
        )}
      </div>

      {/* 스텝 내용 */}
      <div className="flex-1 px-6 overflow-y-auto pb-32">
        {s.id === "welcome" && <WelcomeStep />}
        {s.id === "age" && <AgeStep value={profile.age} onChange={(v) => update({ age: v })} />}
        {s.id === "marriage" && (
          <MarriageStep
            isMarried={profile.isMarried}
            marriageYears={profile.marriageYears}
            numChildren={profile.numChildren}
            onChange={update}
          />
        )}
        {s.id === "housing" && (
          <HousingStep
            isHomeless={profile.isHomeless}
            isHouseholder={profile.isHouseholder}
            isFirstTimeBuyer={profile.isFirstTimeBuyer}
            onChange={update}
          />
        )}
        {s.id === "account" && (
          <AccountStep
            hasAccount={profile.hasAccount}
            accountMonths={profile.accountMonths}
            accountPayments={profile.accountPayments}
            deposit={profile.deposit}
            onChange={update}
          />
        )}
        {s.id === "income" && (
          <IncomeStep
            monthlyIncome={profile.monthlyIncome}
            totalAssets={profile.totalAssets}
            onChange={update}
          />
        )}
        {s.id === "interest" && (
          <InterestStep types={profile.types} onChange={(types) => update({ types })} />
        )}
        {s.id === "region" && (
          <RegionStep regions={profile.regions} onChange={(regions) => update({ regions })} />
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 z-50">
        <button
          onClick={next}
          className="w-full py-4 rounded-2xl bg-toss-blue text-white font-semibold text-base active:bg-blue-700 transition-colors"
        >
          {isFirst ? "시작하기" : isLast ? "청약 보러가기 🎉" : "다음"}
        </button>
        {!isFirst && !isLast && (
          <button
            onClick={skip}
            className="w-full py-3 text-sm text-toss-gray-500 font-medium"
          >
            모르시면 넘어가도 돼요
          </button>
        )}
      </div>
    </div>
  );
}

/* ── 개별 스텝 컴포넌트 ── */

function WelcomeStep() {
  return (
    <div className="space-y-4">
      {[
        { icon: "🔍", text: "전국 청약을 한눈에 모아봐요" },
        { icon: "✅", text: "내 조건에 맞는 것만 골라드려요" },
        { icon: "🔔", text: "새 청약이 나오면 알려드려요" },
      ].map(({ icon, text }) => (
        <div key={text} className="flex items-center gap-4 p-4 bg-toss-gray-50 rounded-2xl">
          <span className="text-2xl">{icon}</span>
          <span className="text-[15px] font-medium text-toss-gray-900">{text}</span>
        </div>
      ))}
    </div>
  );
}

function AgeStep({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-toss-gray-500">만</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-24 text-center text-3xl font-bold border-b-2 border-toss-blue py-2 focus:outline-none bg-transparent"
      />
      <span className="text-lg text-toss-gray-700 font-medium">세</span>
    </div>
  );
}

function MarriageStep({
  isMarried, marriageYears, numChildren, onChange,
}: {
  isMarried: boolean; marriageYears: number; numChildren: number;
  onChange: (p: Partial<UserProfile>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <ChoiceButton selected={!isMarried} onClick={() => onChange({ isMarried: false })} label="미혼" />
        <ChoiceButton selected={isMarried} onClick={() => onChange({ isMarried: true })} label="기혼" />
      </div>
      {isMarried && (
        <>
          <InputRow label="혼인 경과" value={marriageYears} suffix="년" onChange={(v) => onChange({ marriageYears: v })} />
          <InputRow label="자녀 수" value={numChildren} suffix="명" onChange={(v) => onChange({ numChildren: v })} />
        </>
      )}
      {!isMarried && (
        <InputRow label="자녀 수" value={numChildren} suffix="명" onChange={(v) => onChange({ numChildren: v })} />
      )}
    </div>
  );
}

function HousingStep({
  isHomeless, isHouseholder, isFirstTimeBuyer, onChange,
}: {
  isHomeless: boolean; isHouseholder: boolean; isFirstTimeBuyer: boolean;
  onChange: (p: Partial<UserProfile>) => void;
}) {
  return (
    <div className="space-y-3">
      <ToggleCard label="무주택자" desc="본인 명의 주택이 없어요" value={isHomeless} onChange={(v) => onChange({ isHomeless: v })} />
      <ToggleCard label="세대주" desc="세대주로 등록되어 있어요" value={isHouseholder} onChange={(v) => onChange({ isHouseholder: v })} />
      <ToggleCard label="생애최초 주택구입" desc="지금까지 주택을 소유한 적 없어요" value={isFirstTimeBuyer} onChange={(v) => onChange({ isFirstTimeBuyer: v })} />
    </div>
  );
}

function AccountStep({
  hasAccount, accountMonths, accountPayments, deposit, onChange,
}: {
  hasAccount: boolean; accountMonths: number; accountPayments: number; deposit: number;
  onChange: (p: Partial<UserProfile>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <ChoiceButton selected={hasAccount} onClick={() => onChange({ hasAccount: true })} label="있어요" />
        <ChoiceButton selected={!hasAccount} onClick={() => onChange({ hasAccount: false })} label="없어요" />
      </div>
      {hasAccount && (
        <>
          <InputRow label="가입 기간" value={accountMonths} suffix="개월" onChange={(v) => onChange({ accountMonths: v })} />
          <InputRow label="납입 횟수" value={accountPayments} suffix="회" onChange={(v) => onChange({ accountPayments: v })} />
          <InputRow label="예치금" value={deposit} suffix="만원" onChange={(v) => onChange({ deposit: v })} wide />
        </>
      )}
    </div>
  );
}

function IncomeStep({
  monthlyIncome, totalAssets, onChange,
}: {
  monthlyIncome: number; totalAssets: number;
  onChange: (p: Partial<UserProfile>) => void;
}) {
  return (
    <div className="space-y-5">
      <InputRow label="월소득 (세전)" value={monthlyIncome} suffix="만원" onChange={(v) => onChange({ monthlyIncome: v })} wide />
      <InputRow label="총자산 (대략)" value={totalAssets} suffix="만원" onChange={(v) => onChange({ totalAssets: v })} wide />
      <p className="text-xs text-toss-gray-500 mt-2">
        공공분양·청년주택 등에서 소득·자산 기준을 확인해요
      </p>
    </div>
  );
}

function InterestStep({
  types, onChange,
}: {
  types: SubscriptionType[]; onChange: (t: SubscriptionType[]) => void;
}) {
  const toggle = (v: SubscriptionType) => {
    onChange(types.includes(v) ? types.filter((t) => t !== v) : [...types, v]);
  };
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {SUB_TYPES.map(({ value, label, desc }) => (
        <button
          key={value}
          onClick={() => toggle(value)}
          className={`text-left p-4 rounded-2xl border-2 transition-all ${
            types.includes(value)
              ? "border-toss-blue bg-toss-blue-light"
              : "border-toss-gray-100 bg-white"
          }`}
        >
          <p className={`text-sm font-bold ${types.includes(value) ? "text-toss-blue" : "text-toss-gray-900"}`}>
            {label}
          </p>
          <p className="text-xs text-toss-gray-500 mt-1">{desc}</p>
        </button>
      ))}
    </div>
  );
}

function RegionStep({
  regions, onChange,
}: {
  regions: string[]; onChange: (r: string[]) => void;
}) {
  const allCodes = REGIONS.map((r) => r.code);
  const isAll = regions.length === 0;
  const isSudo = SUDOGWON.every((c) => regions.includes(c));

  const toggle = (code: string) => {
    onChange(regions.includes(code) ? regions.filter((r) => r !== code) : [...regions, code]);
  };

  const selectAll = () => onChange([]);
  const selectSudo = () => {
    if (isSudo) onChange(regions.filter((r) => !SUDOGWON.includes(r)));
    else onChange([...new Set([...regions, ...SUDOGWON])]);
  };
  const selectGroup = (group: string) => {
    const codes = REGIONS.filter((r) => r.group === group).map((r) => r.code);
    const allSelected = codes.every((c) => regions.includes(c));
    if (allSelected) onChange(regions.filter((r) => !codes.includes(r)));
    else onChange([...new Set([...regions, ...codes])]);
  };

  return (
    <div className="space-y-4">
      {/* 전국 / 수도권 퀵 선택 */}
      <div className="flex gap-2.5">
        <button
          onClick={selectAll}
          className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all border-2 ${
            isAll
              ? "border-toss-blue bg-toss-blue-light text-toss-blue"
              : "border-toss-gray-100 bg-white text-toss-gray-700"
          }`}
        >
          전국 전체
        </button>
        <button
          onClick={selectSudo}
          className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all border-2 ${
            isSudo && !isAll
              ? "border-toss-blue bg-toss-blue-light text-toss-blue"
              : "border-toss-gray-100 bg-white text-toss-gray-700"
          }`}
        >
          수도권
        </button>
      </div>

      {/* 지역 그룹별 */}
      {REGION_GROUPS.map((group) => {
        const items = REGIONS.filter((r) => r.group === group);
        const allSelected = items.every((r) => regions.includes(r.code));
        return (
          <div key={group}>
            <button
              onClick={() => selectGroup(group)}
              className="flex items-center gap-2 mb-2"
            >
              <span className="text-xs font-bold text-toss-gray-500 uppercase">{group}</span>
              {allSelected && !isAll && (
                <span className="text-[10px] px-1.5 py-0.5 bg-toss-blue text-white rounded-full font-bold">ALL</span>
              )}
            </button>
            <div className="flex flex-wrap gap-2">
              {items.map((r) => (
                <button
                  key={r.code}
                  onClick={() => { if (isAll) onChange([r.code]); else toggle(r.code); }}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    isAll || regions.includes(r.code)
                      ? "bg-toss-blue text-white shadow-sm"
                      : "bg-toss-gray-100 text-toss-gray-700"
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── 공용 UI ── */

function ChoiceButton({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-4 rounded-2xl text-base font-semibold transition-all border-2 ${
        selected
          ? "border-toss-blue bg-toss-blue-light text-toss-blue"
          : "border-toss-gray-100 bg-white text-toss-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

function ToggleCard({
  label, desc, value, onChange,
}: {
  label: string; desc: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
        value
          ? "border-toss-blue bg-toss-blue-light"
          : "border-toss-gray-100 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-[15px] font-bold ${value ? "text-toss-blue" : "text-toss-gray-900"}`}>{label}</p>
          <p className="text-xs text-toss-gray-500 mt-0.5">{desc}</p>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          value ? "border-toss-blue bg-toss-blue" : "border-toss-gray-300"
        }`}>
          {value && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

function InputRow({
  label, value, suffix, onChange, wide,
}: {
  label: string; value: number; suffix: string; onChange: (v: number) => void; wide?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[15px] text-toss-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={`${wide ? "w-28" : "w-20"} px-3 py-2.5 border-2 border-toss-gray-200 rounded-xl text-sm text-right font-semibold focus:outline-none focus:border-toss-blue transition-colors bg-white`}
        />
        <span className="text-sm text-toss-gray-500 min-w-fit">{suffix}</span>
      </div>
    </div>
  );
}
