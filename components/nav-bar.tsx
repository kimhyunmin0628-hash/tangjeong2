import Link from "next/link";
import LogoutButton from "./logout-button";
import GeneratePresentationButton from "./generate-presentation-button";

const NAV_ITEMS = [
  { href: "/intro", label: "아파트 소개" },
  { href: "/photos", label: "현장사진" },
  { href: "/progress", label: "공정진행현황" },
  { href: "/quality", label: "품질관리" },
  { href: "/safety", label: "안전관리" },
  { href: "/improvements", label: "현장특화사항" },
  { href: "/notices", label: "공지사항" },
];

export default function NavBar({
  userName,
  isAdmin,
}: {
  userName: string;
  isAdmin: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-brand text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/intro" className="flex flex-col leading-tight">
          <span className="text-[11px] tracking-widest text-accent">
            THE SHARP TANGJEONG INFINITY CITY 2
          </span>
          <span className="text-base font-bold">더샵 탕정인피니티시티 2차</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/cost"
              className="rounded-md px-3 py-1.5 font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              원가관리
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin/residents"
              className="rounded-md bg-accent/90 px-3 py-1.5 font-semibold text-brand-dark transition hover:bg-accent"
            >
              관리자
            </Link>
          )}
          {isAdmin && <GeneratePresentationButton />}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-white/80 sm:inline">
            {userName}님
          </span>
          <LogoutButton className="rounded-lg border border-white/30 px-3 py-1.5 text-sm text-white hover:bg-white/10" />
        </div>
      </div>
    </header>
  );
}
