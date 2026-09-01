import { prisma } from "@/lib/prisma";
import DocItemList from "@/components/doc-item-list";

// 대제목으로 묶어서 보여줄 그룹 정의 (맨 위부터 순서대로 배치)
const GROUPS: { heading: string; match: (title: string) => boolean; hideTitle?: boolean }[] = [
  {
    heading: "층간소음개선을 위한 안울림바닥구조 적용",
    match: (t) => ["①", "②", "③", "④"].some((p) => t.startsWith(p)),
  },
  {
    heading: "세대 단열 품질관리",
    match: (t) => t === "세대 단열 품질관리",
    hideTitle: true,
  },
  {
    heading: "세대 창호 떨림방지조치",
    match: (t) => t === "세대 창호 떨림방지조치",
    hideTitle: true,
  },
  {
    heading: "지하주차장 바닥 품질개선",
    match: (t) => t === "지하주차장 바닥 품질개선",
    hideTitle: true,
  },
];

export default async function QualityPage() {
  const items = await prisma.improvementItem.findMany({
    where: { category: "QUALITY" },
    orderBy: { createdAt: "asc" },
    include: { images: { orderBy: { order: "asc" } } },
  });

  const grouped = GROUPS.map((g) => ({
    ...g,
    items: items.filter((i) => g.match(i.title)),
  })).filter((g) => g.items.length > 0);

  const groupedIds = new Set(grouped.flatMap((g) => g.items.map((i) => i.id)));
  const otherItems = items.filter((i) => !groupedIds.has(i.id));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">품질관리</h1>
        <p className="mt-1 text-sm text-muted">
          현장에서 진행 중인 품질 개선 활동을 사진과 함께 안내해드립니다.
        </p>
      </div>

      {grouped.map((g) => (
        <div key={g.heading} className="mb-12">
          <h2 className="mb-6 text-2xl font-extrabold text-brand sm:text-3xl">
            {g.heading}
          </h2>
          <DocItemList items={g.items} hideTitle={g.hideTitle} />
        </div>
      ))}

      <DocItemList items={otherItems} />
    </div>
  );
}
