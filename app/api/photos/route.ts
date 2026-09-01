import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { saveUploadedFile } from "@/lib/upload";

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "관리자만 업로드할 수 있습니다." }, { status: 403 });
  }

  const formData = await req.formData();
  const month = formData.get("month");
  const caption = formData.get("caption");
  const file = formData.get("file");

  if (typeof month !== "string" || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "잘못된 월 형식입니다." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }

  const url = await saveUploadedFile(file, `photos/${month}`);

  const photo = await prisma.photo.create({
    data: {
      month,
      url,
      caption: typeof caption === "string" && caption.trim() ? caption.trim() : null,
      uploadedById: session.user.id,
    },
  });

  return NextResponse.json({ ok: true, photo });
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

  await prisma.photo.delete({ where: { id } }).catch(() => null);

  return NextResponse.json({ ok: true });
}
