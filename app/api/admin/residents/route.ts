import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "관리자만 처리할 수 있습니다." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { id, status } = body ?? {};

  if (typeof id !== "string" || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ ok: true, user: { id: user.id, status: user.status } });
}
