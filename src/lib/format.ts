/** 만원 단위를 억/만 단위로 변환 */
export function formatPrice(manwon: number): string {
  if (manwon >= 10000) {
    const eok = Math.floor(manwon / 10000);
    const remainder = manwon % 10000;
    if (remainder === 0) return `${eok}억`;
    return `${eok}억 ${remainder.toLocaleString()}만`;
  }
  return `${manwon.toLocaleString()}만`;
}

/** ㎡ → 평 변환 */
export function sqmToPyeong(sqm: number): number {
  return Math.round(sqm * 0.3025 * 10) / 10;
}

/** 면적 표시 (㎡ + 평) */
export function formatArea(sqm: number): string {
  return `${sqm}㎡ (${sqmToPyeong(sqm)}평)`;
}

/** D-day 계산 */
export function dDay(dateStr: string): string {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "D-Day";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

/** 날짜 포맷 (M월 D일 (요일)) */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}
