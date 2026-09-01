import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { parseProgressExcel } from "@/lib/parse-progress-excel";

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "관리자만 업로드할 수 있습니다." }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "엑셀 파일이 없습니다." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let points;
  try {
    points = parseProgressExcel(buffer);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "엑셀 파싱에 실패했습니다." },
      { status: 400 }
    );
  }

  if (points.length === 0) {
    return NextResponse.json(
      { error: "엑셀에서 데이터를 찾을 수 없습니다." },
      { status: 400 }
    );
  }

  const upload = await prisma.progressUpload.create({
    data: {
      fileName: file.name,
      uploadedById: session.user.id,
      points: {
        create: points.map((p, idx) => ({
          label: p.label,
          planned: p.planned,
          actual: p.actual,
          order: idx,
        })),
      },
    },
    include: { points: true },
  });

  return NextResponse.json({ ok: true, upload });
}
