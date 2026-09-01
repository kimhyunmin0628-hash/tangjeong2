import { prisma } from "@/lib/prisma";
import DocItemList from "@/components/doc-item-list";

export default async function SafetyPage() {
  const items = await prisma.improvementItem.findMany({
    where: { category: "SAFETY" },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { order: "asc" } } },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">안전관리</h1>
        <p className="mt-1 text-sm text-muted">
          현장에서 진행 중인 안전 관리 활동을 사진과 함께 안내해드립니다.
        </p>
      </div>

      <DocItemList items={items} />
    </div>
  );
}
