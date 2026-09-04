import fs from "fs";
import path from "path";
import sharp from "sharp";
import PptxGenJS from "pptxgenjs";
import { prisma } from "@/lib/prisma";
import {
  IMPROVEMENT_CATEGORIES,
  IMPROVEMENT_CATEGORY_LABELS,
  formatMonthLabel,
} from "@/lib/constants";

const NAVY = "0F2F5F";
const NAVY_DARK = "0A1F42";
const GOLD = "C8A45C";
const BG = "F5F6F8";
const TEXT = "1A2332";
const MUTED = "6B7280";
const WHITE = "FFFFFF";
const BORDER = "E2E5EB";

const SLIDE_W = 13.33;
const SLIDE_H = 7.5;

interface ImageInput {
  url: string;
  caption?: string | null;
}

async function fetchImageData(url: string): Promise<string | null> {
  try {
    let buffer: Buffer;
    if (url.startsWith("http")) {
      const res = await fetch(url);
      if (!res.ok) return null;
      buffer = Buffer.from(await res.arrayBuffer());
    } else {
      buffer = fs.readFileSync(path.join(process.cwd(), "public", url));
    }
    const resized = await sharp(buffer)
      .resize({ width: 1100, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 78 })
      .toBuffer();
    return `data:image/jpeg;base64,${resized.toString("base64")}`;
  } catch {
    return null;
  }
}

function addCoverSlide(pptx: PptxGenJS) {
  const slide = pptx.addSlide();
  slide.background = { color: NAVY };
  slide.addText("THE SHARP TANGJEONG INFINITY CITY 2", {
    x: 0.8, y: 2.6, w: 11.7, h: 0.5, fontSize: 14, color: GOLD, charSpacing: 2,
  });
  slide.addText("더샵 탕정인피니티시티 2차 안내자료", {
    x: 0.8, y: 3.1, w: 11.7, h: 1.2, fontSize: 40, bold: true, color: WHITE,
  });
  const today = new Date();
  slide.addText(
    `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`,
    { x: 0.8, y: 4.3, w: 11.7, h: 0.5, fontSize: 14, color: "C7D2E3" }
  );
}

function addSectionDivider(pptx: PptxGenJS, title: string, subtitle?: string) {
  const slide = pptx.addSlide();
  slide.background = { color: NAVY };
  slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 3.15, w: 0.9, h: 0.06, fill: { color: GOLD } });
  slide.addText(title, { x: 0.8, y: 3.3, w: 11.7, h: 1, fontSize: 32, bold: true, color: WHITE });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.8, y: 4.2, w: 11.7, h: 1.5, fontSize: 14, color: "C7D2E3", valign: "top" });
  }
  return slide;
}

/** 이미지 최대 4장을 2x2로 배치하는 "항목 상세" 슬라이드. 4장 초과 시 여러 장으로 이어짐 */
async function addDetailSlides(
  pptx: PptxGenJS,
  {
    title,
    description,
    images,
    table,
  }: { title: string; description?: string | null; images: ImageInput[]; table?: string[][] | null }
) {
  const chunks: ImageInput[][] = [];
  for (let i = 0; i < Math.max(images.length, 1); i += 4) {
    chunks.push(images.slice(i, i + 4));
  }
  if (images.length === 0) chunks.length = 1, (chunks[0] = []);

  for (let ci = 0; ci < chunks.length; ci++) {
    const slide = pptx.addSlide();
    slide.background = { color: WHITE };

    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: SLIDE_W, h: 1.0, fill: { color: NAVY } });
    const titleSuffix = chunks.length > 1 ? ` (${ci + 1}/${chunks.length})` : "";
    slide.addText(title + titleSuffix, {
      x: 0.6, y: 0, w: 12.1, h: 1.0, fontSize: 22, bold: true, color: WHITE, valign: "middle",
    });

    let contentTop = 1.3;
    if (description && ci === 0) {
      const lines = Math.max(1, Math.ceil(description.length / 140));
      const descH = Math.min(1.8, lines * 0.24 + 0.1);
      slide.addText(description, {
        x: 0.6, y: contentTop, w: 12.13, h: descH, fontSize: 12, color: MUTED, valign: "top",
      });
      contentTop += descH + 0.15;
    }

    if (table && table.length > 0 && ci === 0) {
      const colCount = table[0].length;
      const colW = Array(colCount).fill(12.13 / colCount);
      slide.addTable(
        table.map((row, ri) =>
          row.map((cell) => ({
            text: cell || "-",
            options: {
              fontSize: 9,
              color: ri === 0 ? WHITE : TEXT,
              fill: { color: ri === 0 ? NAVY : WHITE },
              align: "center" as const,
              bold: ri === 0,
            },
          }))
        ),
        { x: 0.6, y: contentTop, w: 12.13, colW, border: { type: "solid", color: BORDER, pt: 0.5 }, autoPage: false }
      );
      contentTop += 0.32 * table.length + 0.2;
    }

    const chunk = chunks[ci];
    if (chunk.length > 0) {
      const cols = chunk.length === 1 ? 1 : 2;
      const rows = Math.ceil(chunk.length / cols);
      const gap = 0.25;
      const areaW = 12.13;
      const areaH = SLIDE_H - contentTop - 0.4;
      const cellW = (areaW - gap * (cols - 1)) / cols;
      const cellH = (areaH - gap * (rows - 1)) / rows;

      const dataUrls = await Promise.all(chunk.map((img) => fetchImageData(img.url)));

      for (let i = 0; i < chunk.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = 0.6 + col * (cellW + gap);
        const y = contentTop + row * (cellH + gap);
        const data = dataUrls[i];
        const imgH = chunk[i].caption ? cellH - 0.35 : cellH;
        if (data) {
          slide.addImage({ data, x, y, w: cellW, h: imgH, sizing: { type: "contain", w: cellW, h: imgH } });
        } else {
          slide.addShape(pptx.ShapeType.rect, { x, y, w: cellW, h: imgH, fill: { color: BG }, line: { color: BORDER } });
        }
        if (chunk[i].caption) {
          slide.addText(chunk[i].caption!, {
            x, y: y + imgH, w: cellW, h: 0.3, fontSize: 10, align: "center", color: MUTED,
          });
        }
      }
    }
  }
}

async function buildIntro(pptx: PptxGenJS) {
  addSectionDivider(
    pptx,
    "더샵 탕정인피니티시티 2차",
    "더샵만의 차별화된 공간 설계로 일상생활에 특별함을 더하는 프리미엄 주거단지, " +
      "더샵 탕정인피니티시티 2차의 입주예정자 여러분을 환영합니다. 본 자료에서는 입주 전 공사 " +
      "현장의 진행 상황과 각종 안내사항을 확인하실 수 있습니다."
  );

  const INFO_ROWS: [string, string][] = [
    ["공사명", "아산 탕정지구 A3블럭 공동주택 신축공사 (더샵 탕정인피니티시티 2차)"],
    ["현장 위치", "충남 아산시 탕정면 매곡리 835번지"],
    ["공사 기간", "2024.02.01 ~ 2027.02.15 (36.5개월)"],
    ["규모", "지하 2층~지상 35층, 9개동, 1,214세대 (임대세대 164세대 포함) · 주차대수 1,603대"],
    ["대지면적", "55,107㎡ (16,669평)"],
    ["연면적 / 용적율", "192,810㎡ (58,325평) / 229.81%"],
    ["건축면적 / 건폐율", "7,108㎡ (2,150평) / 12.90%"],
    ["공사금액", "3,165억원 (VAT 제외)"],
    ["구조", "철근콘크리트구조"],
    ["발주자", "한국자산신탁㈜ (위탁자: 탕정도시개발㈜)"],
    ["설계자", "㈜동일건축건축사사무소"],
    ["시공자", "㈜포스코이앤씨 (THE SHARP)"],
  ];

  const infoSlide = pptx.addSlide();
  infoSlide.background = { color: WHITE };
  infoSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: SLIDE_W, h: 1.0, fill: { color: NAVY } });
  infoSlide.addText("단지 정보", { x: 0.6, y: 0, w: 12.1, h: 1.0, fontSize: 22, bold: true, color: WHITE, valign: "middle" });
  infoSlide.addTable(
    INFO_ROWS.map(([label, value]) => [
      { text: label, options: { bold: true, color: NAVY, fill: { color: BG }, fontSize: 11 } },
      { text: value, options: { color: TEXT, fontSize: 11 } },
    ]),
    { x: 0.6, y: 1.25, w: 12.13, colW: [2.6, 9.53], border: { type: "solid", color: BORDER, pt: 0.5 }, autoPage: false }
  );

  const unitSlide = pptx.addSlide();
  unitSlide.background = { color: WHITE };
  unitSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: SLIDE_W, h: 1.0, fill: { color: NAVY } });
  unitSlide.addText("평형 구성", { x: 0.6, y: 0, w: 12.1, h: 1.0, fontSize: 22, bold: true, color: WHITE, valign: "middle" });
  const UNIT_TYPES = ["84㎡ A", "84㎡ B", "84㎡ C", "70㎡ A", "70㎡ B", "70㎡ C"];
  UNIT_TYPES.forEach((name, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.6 + col * 4.05;
    const y = 1.3 + row * 1.0;
    unitSlide.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.8, h: 0.8, fill: { color: BG }, line: { color: BORDER }, rectRadius: 0.08 });
    unitSlide.addText(name, { x, y, w: 3.8, h: 0.8, fontSize: 16, bold: true, color: NAVY, align: "center", valign: "middle" });
  });

  await addDetailSlides(pptx, {
    title: "투시도 및 평면도",
    images: [
      { url: "/images/intro/perspective-1.jpg", caption: "현장 투시도 1" },
      { url: "/images/intro/perspective-2.jpg", caption: "현장 투시도 2" },
      { url: "/images/intro/unit-type-plan.png", caption: "평형별 타입 평면도" },
      { url: "/images/intro/site-org-chart.png", caption: "현장조직도" },
    ],
  });
}

async function buildPhotos(pptx: PptxGenJS) {
  addSectionDivider(pptx, "현장사진", "월별 현장 진행 사진");

  const photos = await prisma.photo.findMany({ orderBy: { createdAt: "desc" } });
  const byMonth = new Map<string, (typeof photos)[number]>();
  for (const p of photos) {
    if (!byMonth.has(p.month)) byMonth.set(p.month, p);
  }
  const monthly = Array.from(byMonth.values())
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 8)
    .reverse();

  await addDetailSlides(pptx, {
    title: "현장사진",
    images: monthly.map((p) => ({ url: p.url, caption: formatMonthLabel(p.month) })),
  });
}

async function buildProgress(pptx: PptxGenJS) {
  const upload = await prisma.progressUpload.findFirst({
    orderBy: { createdAt: "desc" },
    include: { points: { orderBy: { order: "asc" } } },
  });
  const points = upload?.points ?? [];
  const latestPoint = [...points].reverse().find((p) => p.actual !== null);
  const lastPlanned = latestPoint ? latestPoint.planned : null;

  const slide = pptx.addSlide();
  slide.background = { color: WHITE };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: SLIDE_W, h: 1.0, fill: { color: NAVY } });
  slide.addText("공정진행현황", { x: 0.6, y: 0, w: 12.1, h: 1.0, fontSize: 22, bold: true, color: WHITE, valign: "middle" });

  const stats: [string, string, string][] = [
    ["현재 실적 공정율", latestPoint ? `${latestPoint.actual!.toFixed(1)}%` : "-", NAVY],
    ["현재 계획 공정율", lastPlanned !== null ? `${lastPlanned.toFixed(1)}%` : "-", TEXT],
    ["차이", latestPoint && lastPlanned !== null ? `${(latestPoint.actual! - lastPlanned).toFixed(1)}%p` : "-", TEXT],
  ];
  stats.forEach(([label, value, color], i) => {
    const x = 0.6 + i * 4.1;
    slide.addShape(pptx.ShapeType.roundRect, { x, y: 1.25, w: 3.85, h: 1.1, fill: { color: BG }, line: { color: BORDER }, rectRadius: 0.06 });
    slide.addText(label, { x: x + 0.2, y: 1.35, w: 3.45, h: 0.35, fontSize: 11, color: MUTED });
    slide.addText(value, { x: x + 0.2, y: 1.65, w: 3.45, h: 0.6, fontSize: 24, bold: true, color });
  });

  if (points.length > 0) {
    const labels = points.map((p) => p.label);
    slide.addChart(
      pptx.ChartType.line,
      [
        { name: "계획", labels, values: points.map((p) => p.planned) },
        { name: "실적", labels, values: points.map((p) => (p.actual === null ? null : p.actual)) as number[] },
      ],
      {
        x: 0.6, y: 2.6, w: 12.13, h: 4.5,
        chartColors: [GOLD, NAVY],
        lineDataSymbol: "circle",
        lineSize: 2.5,
        showLegend: true,
        legendPos: "b",
        catAxisLabelFontSize: 8,
        valAxisMinVal: 0,
        valAxisMaxVal: 100,
        showTitle: false,
      }
    );
  }
}

async function buildImprovementItems(pptx: PptxGenJS, category: string) {
  const items = await prisma.improvementItem.findMany({
    where: { category: category as never },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { order: "asc" } } },
  });
  for (const item of items) {
    await addDetailSlides(pptx, {
      title: item.title,
      description: item.description,
      images: item.images.map((img) => ({ url: img.url, caption: img.caption })),
      table: (item.tableData as string[][] | null) ?? null,
    });
  }
  return items.length;
}

async function buildQuality(pptx: PptxGenJS) {
  addSectionDivider(pptx, "품질관리", "현장에서 진행 중인 품질 개선 활동");
  await buildImprovementItems(pptx, "QUALITY");
}

async function buildSafety(pptx: PptxGenJS) {
  addSectionDivider(pptx, "안전관리", "현장에서 진행 중인 안전 관리 활동");
  await buildImprovementItems(pptx, "SAFETY");
}

async function buildImprovements(pptx: PptxGenJS) {
  addSectionDivider(pptx, "현장특화사항", "조경특화 · 조형물특화 · 주민공동시설 특화 · 입면특화");
  for (const category of IMPROVEMENT_CATEGORIES) {
    const label = IMPROVEMENT_CATEGORY_LABELS[category];
    const count = await prisma.improvementItem.count({ where: { category: category as never } });
    if (count === 0) continue;
    addSectionDivider(pptx, label);
    await buildImprovementItems(pptx, category);
  }
}

async function buildCost(pptx: PptxGenJS) {
  addSectionDivider(pptx, "원가관리", "실행현황 · 매출현황 · 채권현황");
  const SECTION_ORDER = ["EXECUTION", "REVENUE", "RECEIVABLE"] as const;
  for (const category of SECTION_ORDER) {
    const item = await prisma.improvementItem.findFirst({
      where: { category: category as never },
      include: { images: { orderBy: { order: "asc" } } },
    });
    if (!item) continue;

    const slide = pptx.addSlide();
    slide.background = { color: WHITE };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: SLIDE_W, h: 1.0, fill: { color: NAVY } });
    slide.addText(IMPROVEMENT_CATEGORY_LABELS[category], {
      x: 0.6, y: 0, w: 12.1, h: 1.0, fontSize: 22, bold: true, color: WHITE, valign: "middle",
    });

    let top = 1.25;
    const table = item.tableData as string[][] | null;
    if (Array.isArray(table) && table.length > 0) {
      const colCount = table[0].length;
      const colW = Array(colCount).fill(12.13 / colCount);
      slide.addTable(
        table.map((row, ri) =>
          row.map((cell) => ({
            text: cell || "-",
            options: {
              fontSize: 9,
              color: ri === 0 ? WHITE : TEXT,
              fill: { color: ri === 0 ? NAVY : WHITE },
              align: "center" as const,
              bold: ri === 0,
            },
          }))
        ),
        { x: 0.6, y: top, w: 12.13, colW, border: { type: "solid", color: BORDER, pt: 0.5 }, autoPage: false }
      );
      top += 0.35 * table.length + 0.3;
    }

    if (item.description) {
      slide.addText(item.description, { x: 0.6, y: top, w: 12.13, h: 0.6, fontSize: 11, color: MUTED });
      top += 0.7;
    }

    if (item.images.length > 0 && top < SLIDE_H - 1) {
      const imgs = item.images.slice(0, 2);
      const dataUrls = await Promise.all(imgs.map((img) => fetchImageData(img.url)));
      const cellW = 5.9;
      const cellH = SLIDE_H - top - 0.3;
      imgs.forEach((img, i) => {
        const data = dataUrls[i];
        const x = 0.6 + i * (cellW + 0.3);
        if (data) {
          slide.addImage({ data, x, y: top, w: cellW, h: cellH, sizing: { type: "contain", w: cellW, h: cellH } });
        }
      });
    }
  }
}

const BUILDERS: Record<string, (pptx: PptxGenJS) => Promise<void>> = {
  INTRO: buildIntro,
  PHOTOS: buildPhotos,
  PROGRESS: buildProgress,
  QUALITY: buildQuality,
  SAFETY: buildSafety,
  IMPROVEMENTS: buildImprovements,
  COST: buildCost,
};

export const SECTION_ORDER = ["INTRO", "PHOTOS", "PROGRESS", "QUALITY", "SAFETY", "IMPROVEMENTS", "COST"];

export async function generatePresentation(sections: string[]): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "더샵 탕정인피니티시티 2차";

  addCoverSlide(pptx);

  const ordered = SECTION_ORDER.filter((s) => sections.includes(s));
  for (const key of ordered) {
    await BUILDERS[key](pptx);
  }

  const data = await pptx.write({ outputType: "nodebuffer" });
  return data as Buffer;
}
