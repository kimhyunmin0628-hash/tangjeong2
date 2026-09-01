import * as XLSX from "xlsx";

export interface ParsedProgressPoint {
  label: string;
  planned: number;
  actual: number | null;
}

/**
 * 공정표 엑셀을 파싱한다.
 * 헤더 행에서 "계획"과 "실적" 문자열이 포함된 열을 찾고,
 * 나머지 한 열을 라벨(날짜/차수)로 사용한다.
 * 예: 구분 | 계획공정율(%) | 실적공정율(%)
 */
export function parseProgressExcel(buffer: Buffer): ParsedProgressPoint[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return [];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
  }) as unknown[][];

  if (rows.length === 0) return [];

  let headerIdx = -1;
  let plannedCol = -1;
  let actualCol = -1;
  let labelCol = 0;

  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const row = rows[i].map((c) => String(c ?? ""));
    const pIdx = row.findIndex((c) => c.includes("계획"));
    const aIdx = row.findIndex((c) => c.includes("실적"));
    if (pIdx !== -1 && aIdx !== -1) {
      headerIdx = i;
      plannedCol = pIdx;
      actualCol = aIdx;
      const lIdx = row.findIndex((c, idx) => c.trim() && idx !== pIdx && idx !== aIdx);
      labelCol = lIdx === -1 ? 0 : lIdx;
      break;
    }
  }

  if (headerIdx === -1) {
    throw new Error(
      "엑셀에서 '계획'과 '실적' 열을 찾을 수 없습니다. 헤더 행에 '계획공정율', '실적공정율'과 같은 열 이름이 있어야 합니다."
    );
  }

  const points: ParsedProgressPoint[] = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const label = String(row[labelCol] ?? "").trim();
    const planned = toPercent(row[plannedCol]);
    const actual = toPercent(row[actualCol]);

    if (!label && planned === null) continue;
    if (planned === null) continue;

    points.push({ label: label || `${i - headerIdx}`, planned, actual });
  }

  return points;
}

function toPercent(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v === "number") {
    return v <= 1 ? Math.round(v * 1000) / 10 : Math.round(v * 10) / 10;
  }
  const num = parseFloat(String(v).replace("%", "").trim());
  if (Number.isNaN(num)) return null;
  return num;
}
