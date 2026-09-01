import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { saveUploadedFile, saveBuffer } from "@/lib/upload";
import { extractPptxImages } from "@/lib/extract-pptx-images";
import { IMPROVEMENT_CATEGORY_LABELS } from "@/lib/constants";

const ALL_CATEGORIES = Object.keys(IMPROVEMENT_CATEGORY_LABELS);

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "관리자만 등록할 수 있습니다." }, { status: 403 });
  }

  const formData = await req.formData();
  const category = formData.get("category");
  const title = formData.get("title");
  const description = formData.get("description");
  const file = formData.get("file");

  if (typeof category !== "string" || !ALL_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "잘못된 카테고리입니다." }, { status: 400 });
  }
  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "PDF 또는 PPT 파일을 첨부해주세요." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const fileType = ext === "pdf" ? "pdf" : ext === "ppt" || ext === "pptx" ? "ppt" : null;
  if (!fileType) {
    return NextResponse.json(
      { error: "PDF(.pdf) 또는 PPT(.ppt, .pptx) 파일만 업로드할 수 있습니다." },
      { status: 400 }
    );
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const url = await saveUploadedFile(file, "improvements");

  // pptx는 zip 구조이므로 내부 이미지를 추출해 페이지에 바로 보여줄 수 있게 저장
  let images: { url: string; order: number }[] = [];
  if (ext === "pptx") {
    try {
      const extracted = extractPptxImages(fileBuffer);
      images = await Promise.all(
        extracted.map(async (img, idx) => ({
          url: await saveBuffer(img.data, img.ext, "improvements/images"),
          order: idx,
        }))
      );
    } catch {
      images = [];
    }
  }

  const item = await prisma.improvementItem.create({
    data: {
      category: category as never,
      title: title.trim(),
      description: typeof description === "string" && description.trim() ? description.trim() : null,
      fileUrl: url,
      fileType,
      uploadedById: session.user.id,
      images: { create: images },
    },
    include: { images: true },
  });

  return NextResponse.json({ ok: true, item });
}

export async function DELETE(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "관리자만 삭제할 수 있습니다." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
  }

  await prisma.improvementItem.delete({ where: { id } }).catch(() => null);

  return NextResponse.json({ ok: true });
}
