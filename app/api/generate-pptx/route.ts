import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/require-admin";
import { generatePresentation, SECTION_ORDER } from "@/lib/generate-pptx";

export const maxDuration = 120;

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "관리자만 생성할 수 있습니다." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const requested = Array.isArray(body?.sections) ? body.sections : [];
  const sections = SECTION_ORDER.filter((s) => requested.includes(s));

  if (sections.length === 0) {
    return NextResponse.json({ error: "포함할 메뉴를 하나 이상 선택해주세요." }, { status: 400 });
  }

  try {
    const buffer = await generatePresentation(sections);
    const blob = await put(`presentations/${Date.now()}.pptx`, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? `생성 중 오류가 발생했습니다: ${e.message}` : "생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
