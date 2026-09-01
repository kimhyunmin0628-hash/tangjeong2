import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import NoticeForm from "./notice-form";
import DeleteNoticeButton from "./delete-notice-button";

export default async function NoticesPage() {
  const [session, notices] = await Promise.all([
    auth(),
    prisma.notice.findMany({
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: { author: true },
    }),
  ]);

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">공지사항</h1>
        <p className="mt-1 text-sm text-muted">
          현장 사무실(관리자)에서 등록한 공지사항을 확인하실 수 있습니다.
        </p>
      </div>

      {isAdmin && (
        <div className="mb-6">
          <NoticeForm />
        </div>
      )}

      {notices.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">
          등록된 공지사항이 없습니다.
        </p>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {notice.pinned && (
                    <span className="rounded bg-accent/20 px-2 py-0.5 text-[11px] font-bold text-accent">
                      고정
                    </span>
                  )}
                  <h2 className="text-sm font-bold text-foreground">
                    {notice.title}
                  </h2>
                </div>
                {isAdmin && <DeleteNoticeButton id={notice.id} />}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {notice.content}
              </p>
              <p className="mt-3 text-xs text-muted">
                {notice.author?.name ?? "관리자"} ·{" "}
                {notice.createdAt.toLocaleString("ko-KR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
