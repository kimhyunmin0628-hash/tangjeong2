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
  const planned = Number(body?.planned);
  const actual =
    body?.actual === null || body?.actual === "" || body?.actual === undefined
      ? null
      : Number(body.actual);

  if (!label) {
    return NextResponse.json({ error: "월/차수 라벨을 입력해주세요." }, { status: 400 });
  }
  if (!Number.isFinite(planned) || planned < 0 || planned > 100) {
    return NextResponse.json({ error: "계획 공정율은 0~100 사이 숫자여야 합니다." }, { status: 400 });
  }
  if (actual !== null && (!Number.isFinite(actual) || actual < 0 || actual > 100)) {
    return NextResponse.json({ error: "실적 공정율은 0~100 사이 숫자여야 합니다." }, { status: 400 });
  }

  let upload = await prisma.progressUpload.findFirst({
    orderBy: { createdAt: "desc" },
    include: { points: true },
  });

  if (!upload) {
    upload = await prisma.progressUpload.create({
      data: { fileName: "수동 입력", uploadedById: session.user.id },
      include: { points: true },
    });
  }

  const existingPoint = upload.points.find((p) => p.label === label);

  if (existingPoint) {
    await prisma.progressPoint.update({
      where: { id: existingPoint.id },
      data: { planned, actual },
    });
  } else {
    const nextOrder = upload.points.length > 0 ? Math.max(...upload.points.map((p) => p.order)) + 1 : 0;
    await prisma.progressPoint.create({
      data: { label, planned, actual, order: nextOrder, uploadId: upload.id },
    });
  }

  await prisma.progressUpload.update({
    where: { id: upload.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
