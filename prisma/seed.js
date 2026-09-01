const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const ADMIN_PHONE = "01000000000";
const ADMIN_PASSWORD = "admin1234";

async function main() {
  const existing = await prisma.user.findUnique({ where: { phone: ADMIN_PHONE } });
  if (existing) {
    console.log("관리자 계정이 이미 존재합니다:", ADMIN_PHONE);
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.user.create({
    data: {
      name: "현장 관리자",
      dong: "-",
      ho: "-",
      phone: ADMIN_PHONE,
      passwordHash,
      role: "ADMIN",
      status: "APPROVED",
    },
  });

  console.log("관리자 계정이 생성되었습니다.");
  console.log("  휴대전화번호:", ADMIN_PHONE);
  console.log("  비밀번호:", ADMIN_PASSWORD);
  console.log("로그인 후 반드시 비밀번호를 변경하세요.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
