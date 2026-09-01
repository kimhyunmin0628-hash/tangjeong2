import { prisma } from "@/lib/prisma";
import { getMonthRange, formatMonthLabel, SITE_START_MONTH } from "@/lib/constants";
import PhotosGrid from "./photos-grid";

export default async function PhotosPage() {
  const months = getMonthRange();

  const counts = await prisma.photo.groupBy({
    by: ["month"],
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((c) => [c.month, c._count._all]));

  const thumbs = await prisma.photo.findMany({
    where: { month: { in: months } },
    orderBy: { createdAt: "desc" },
    distinct: ["month"],
  });
  const thumbMap = new Map(thumbs.map((p) => [p.month, p.url]));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">현장사진</h1>
        <p className="mt-1 text-sm text-muted">
          {formatMonthLabel(SITE_START_MONTH)}부터 매달 현장 진행 사진을 확인하실 수 있습니다.
        </p>
      </div>

      <PhotosGrid
        items={months.map((month) => ({
          month,
          thumb: thumbMap.get(month) ?? null,
          count: countMap.get(month) ?? 0,
        }))}
      />
    </div>
  );
}
