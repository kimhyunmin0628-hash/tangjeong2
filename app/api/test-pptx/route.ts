import { NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";

export async function GET() {
  try {
    const pptx = new PptxGenJS();
    const slide = pptx.addSlide();
    slide.addText("hello", { x: 1, y: 1, w: 5, h: 1 });
    const buffer = await pptx.write({ outputType: "nodebuffer" });
    return NextResponse.json({ ok: true, size: (buffer as Buffer).length });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e), stack: e instanceof Error ? e.stack : null },
      { status: 500 }
    );
  }
}
