"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={
        className ??
        "rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background"
      }
    >
      로그아웃
    </button>
  );
}
