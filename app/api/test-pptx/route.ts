import { NextResponse } from "next/server";
import { generatePresentation } from "@/lib/generate-pptx";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const buffer = await generatePresentation(["INTRO"]);
    return NextResponse.json({ ok: true, size: buffer.length });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e), stack: e instanceof Error ? e.stack : null },
      { status: 500 }
    );
  }
}
