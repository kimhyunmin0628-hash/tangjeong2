import { prisma } from "@/lib/prisma";
import ResidentRow from "./resident-row";

export default async function AdminResidentsPage() {
  const users = await prisma.user.findMany({
    where: { role: "RESIDENT" },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const pending = users.filter((u) => u.status === "PENDING");
  const others = users.filter((u) => u.status !== "PENDING");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">입주자 인증 관리</h1>
        <p className="mt-1 text-sm text-muted">
          가입 신청한 입주자의 동/호수 정보를 확인 후 승인해주세요.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold text-foreground">
          승인 대기 ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted">
            대기 중인 신청이 없습니다.
          </p>
        ) : (
          <div className="space-y-2">
            {pending.map((u) => (
              <ResidentRow key={u.id} user={serialize(u)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-foreground">
          전체 입주자 ({others.length})
        </h2>
        <div className="space-y-2">
          {others.map((u) => (
            <ResidentRow key={u.id} user={serialize(u)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function serialize(u: {
  id: string;
  name: string;
  dong: string;
  ho: string;
  phone: string;
  status: string;
  createdAt: Date;
}) {
  return {
    id: u.id,
    name: u.name,
    dong: u.dong,
    ho: u.ho,
    phone: u.phone,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
  };
}
