import { auth } from "@/auth";
import NavBar from "@/components/nav-bar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar
        userName={session?.user?.name ?? ""}
        isAdmin={session?.user?.role === "ADMIN"}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border bg-card py-6 text-center text-xs text-muted">
        © 더샵 탕정인피니티시티 2차 입주자 현장안내 · 본 서비스는 입주예정자 전용입니다.
      </footer>
    </div>
  );
}
