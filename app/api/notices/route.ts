import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "관리자만 공지사항을 등록할 수 있습니다." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { title, content, pinned } = body ?? {};

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
  }
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }

  const notice = await prisma.notice.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      pinned: Boolean(pinned),
      authorId: session.user.id,
    },
  });

  return NextResponse.json({ ok: true, notice });
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

  await prisma.notice.delete({ where: { id } }).catch(() => null);

  return NextResponse.json({ ok: true });
}
