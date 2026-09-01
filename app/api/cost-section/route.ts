import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { saveUploadedFile } from "@/lib/upload";
import { IMPROVEMENT_CATEGORY_LABELS } from "@/lib/constants";

const SECTIONS = ["EXECUTION", "REVENUE", "RECEIVABLE"] as const;
type Section = (typeof SECTIONS)[number];

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "관리자만 등록할 수 있습니다." }, { status: 403 });
  }

  const formData = await req.formData();
  const category = formData.get("category");
  if (typeof category !== "string" || !SECTIONS.includes(category as Section)) {
    return NextResponse.json({ error: "잘못된 카테고리입니다." }, { status: 400 });
  }

  const noteRaw = formData.get("note");
  const note = typeof noteRaw === "string" && noteRaw.trim() ? noteRaw.trim() : null;

  let tableData: string[][] | null = null;
  const tableRaw = formData.get("tableData");
  if (typeof tableRaw === "string" && tableRaw.trim()) {
    try {
      const parsed = JSON.parse(tableRaw);
      if (Array.isArray(parsed) && parsed.every((row) => Array.isArray(row))) {
        tableData = parsed;
      }
    } catch {
      return NextResponse.json({ error: "표 데이터 형식이 올바르지 않습니다." }, { status: 400 });
    }
  }

  let keepImageIds: string[] = [];
  const keepRaw = formData.get("keepImageIds");
  if (typeof keepRaw === "string" && keepRaw.trim()) {
    try {
      const parsed = JSON.parse(keepRaw);
      if (Array.isArray(parsed)) keepImageIds = parsed.filter((v) => typeof v === "string");
    } catch {
      keepImageIds = [];
    }
  }

  const newFiles = formData.getAll("images").filter((v): v is File => v instanceof File);

  const existing = await prisma.improvementItem.findFirst({
    where: { category: category as never },
    include: { images: true },
  });

  const toDelete = existing ? existing.images.filter((img) => !keepImageIds.includes(img.id)) : [];
  if (toDelete.length > 0) {
    await prisma.improvementImage.deleteMany({ where: { id: { in: toDelete.map((i) => i.id) } } });
  }
  const keptCount = existing ? existing.images.length - toDelete.length : 0;

  const newImages = await Promise.all(
    newFiles.map(async (file, idx) => ({
      url: await saveUploadedFile(file, "improvements/images"),
      order: keptCount + idx,
    }))
  );

  const tableDataValue = tableData === null ? Prisma.JsonNull : tableData;

  const item = existing
    ? await prisma.improvementItem.update({
        where: { id: existing.id },
        data: { description: note, tableData: tableDataValue, images: { create: newImages } },
        include: { images: { orderBy: { order: "asc" } } },
      })
    : await prisma.improvementItem.create({
        data: {
          category: category as never,
          title: IMPROVEMENT_CATEGORY_LABELS[category],
          description: note,
          tableData: tableDataValue,
          fileUrl: "",
          fileType: "manual",
          uploadedById: session.user.id,
          images: { create: newImages },
        },
        include: { images: { orderBy: { order: "asc" } } },
      });

  return NextResponse.json({ ok: true, item });
}
