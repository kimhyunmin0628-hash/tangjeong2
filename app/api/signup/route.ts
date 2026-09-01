import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { name, dong, ho, phone, password } = body ?? {};

  if (!name || !dong || !ho || !phone || !password) {
    return NextResponse.json({ error: "모든 항목을 입력해주세요." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 4) {
    return NextResponse.json({ error: "비밀번호는 4자 이상이어야 합니다." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json(
      { error: "이미 가입 신청된 휴대전화번호입니다." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      dong,
      ho,
      phone,
      passwordHash,
      role: "RESIDENT",
      status: "PENDING",
    },
  });

  return NextResponse.json({ ok: true });
}
