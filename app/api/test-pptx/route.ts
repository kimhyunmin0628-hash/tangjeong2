import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/require-admin";
import { generatePresentation } from "@/lib/generate-pptx";

export const dynamic = "force-dynamic";

export async function GET() {
  const steps: string[] = [];
  try {
    steps.push("start");
    const session = await requireAdmin();
    steps.push(`requireAdmin:${session ? "ok" : "null"}`);
    if (!session) return NextResponse.json({ ok: false, steps, error: "not admin" });

    const buffer = await generatePresentation(["INTRO"]);
    steps.push(`generate:${buffer.length}`);

    const blob = await put(`presentations/test-${Date.now()}.pptx`, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
    steps.push(`blob:${blob.url}`);

    return NextResponse.json({ ok: true, steps });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        steps,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : null,
      },
      { status: 500 }
    );
  }
}
