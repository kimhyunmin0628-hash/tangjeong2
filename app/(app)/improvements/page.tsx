import { prisma } from "@/lib/prisma";
import { IMPROVEMENT_CATEGORIES, IMPROVEMENT_CATEGORY_LABELS } from "@/lib/constants";
import ImprovementTabs from "./improvement-tabs";

export default async function ImprovementsPage() {
  const items = await prisma.improvementItem.findMany({
    where: { category: { notIn: ["QUALITY", "SAFETY"] } },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { order: "asc" } } },
  });

  const grouped = Object.fromEntries(
    IMPROVEMENT_CATEGORIES.map((cat) => [
      cat,
      items.filter((i) => i.category === cat),
    ])
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">현장특화사항</h1>
        <p className="mt-1 text-sm text-muted">
          조경특화 · 조형물특화 · 주민공동시설 특화 · 입면특화 자료를
          카테고리별로 확인하실 수 있습니다.
        </p>
      </div>

      <ImprovementTabs
        categories={IMPROVEMENT_CATEGORIES}
        labels={IMPROVEMENT_CATEGORY_LABELS}
        grouped={grouped}
      />
    </div>
  );
}
