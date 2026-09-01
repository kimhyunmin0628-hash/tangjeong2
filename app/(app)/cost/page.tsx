import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DocItem from "@/components/doc-item";
import CostSectionForm from "@/components/cost-section-form";
import { IMPROVEMENT_CATEGORY_LABELS } from "@/lib/constants";

const SECTION_ORDER = ["EXECUTION", "REVENUE", "RECEIVABLE"] as const;

export default async function CostPage() {
  const session = await auth();

  // 원가관리는 관리자만 접근 가능 (입주자는 진입 자체가 불가)
  if (session?.user?.role !== "ADMIN") {
    redirect("/intro");
  }

  const items = await prisma.improvementItem.findMany({
    where: { category: { in: [...SECTION_ORDER] } },
    include: { images: { orderBy: { order: "asc" } } },
  });

  const byCategory = Object.fromEntries(
    SECTION_ORDER.map((c) => [c, items.find((i) => i.category === c) ?? null])
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">원가관리</h1>
        <p className="mt-1 text-sm text-muted">
          실행현황 · 매출현황 · 채권현황 자료입니다. 관리자만 열람할 수 있습니다.
        </p>
      </div>

      {SECTION_ORDER.map((category) => {
        const item = byCategory[category];
        return (
          <div key={category} className="mb-12">
            <h2 className="mb-4 text-2xl font-extrabold text-brand sm:text-3xl">
              {IMPROVEMENT_CATEGORY_LABELS[category]}
            </h2>
            <CostSectionForm
              category={category}
              label={IMPROVEMENT_CATEGORY_LABELS[category]}
              initialTable={(item?.tableData as string[][] | null) ?? null}
              initialNote={item?.description ?? null}
              initialImages={item?.images.map((img) => ({ id: img.id, url: img.url })) ?? []}
            />
            {item ? (
              <DocItem item={item} hideTitle />
            ) : (
              <p className="py-6 text-center text-sm text-muted">등록된 자료가 없습니다.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
