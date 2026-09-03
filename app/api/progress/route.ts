import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "관리자만 입력할 수 있습니다." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  const actual = Math.round(Number(body?.actual) * 10) / 10;

  if (!label) {
    return NextResponse.json({ error: "월/차수 라벨이 없습니다." }, { status: 400 });
  }
  if (!Number.isFinite(actual) || actual < 0 || actual > 100) {
    return NextResponse.json({ error: "실적 공정율은 0~100 사이 숫자여야 합니다." }, { status: 400 });
  }

  const upload = await prisma.progressUpload.findFirst({
    orderBy: { createdAt: "desc" },
    include: { points: true },
  });

  const point = upload?.points.find((p) => p.label === label);
  if (!upload || !point) {
    return NextResponse.json({ error: "해당 월의 계획 공정율 데이터를 찾을 수 없습니다." }, { status: 400 });
  }

  await prisma.progressPoint.update({ where: { id: point.id }, data: { actual } });
  await prisma.progressUpload.update({ where: { id: upload.id }, data: { updatedAt: new Date() } });

  return NextResponse.json({ ok: true });
}
