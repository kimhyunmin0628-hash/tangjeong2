export const SITE_START_MONTH = "2024-04";

export const IMPROVEMENT_CATEGORY_LABELS: Record<string, string> = {
  LANDSCAPE: "조경특화",
  SCULPTURE: "조형물특화",
  COMMUNITY: "주민공동시설 특화",
  FACADE: "입면특화",
  QUALITY: "품질관리",
  SAFETY: "안전관리",
  EXECUTION: "실행현황",
  REVENUE: "매출현황",
  RECEIVABLE: "채권현황",
  OTHER: "기타",
};

// 현장특화사항(개선사항) 페이지의 탭 목록 — 품질관리/안전관리/원가관리는 별도 메뉴로 분리됨, 기타는 삭제됨
export const IMPROVEMENT_CATEGORIES: string[] = [
  "LANDSCAPE",
  "SCULPTURE",
  "COMMUNITY",
  "FACADE",
];

/** SITE_START_MONTH부터 이번 달까지 "YYYY-MM" 배열을 최신순으로 반환 */
export function getMonthRange(): string[] {
  const [startYear, startMonth] = SITE_START_MONTH.split("-").map(Number);
  const now = new Date();
  const months: string[] = [];

  let y = startYear;
  let m = startMonth;
  const endY = now.getFullYear();
  const endM = now.getMonth() + 1;

  while (y < endY || (y === endY && m <= endM)) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }

  return months.reverse();
}

export function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-");
  return `${y}년 ${Number(m)}월`;
}
