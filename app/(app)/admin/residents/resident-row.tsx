"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ResidentUser {
  id: string;
  name: string;
  dong: string;
  ho: string;
  phone: string;
  status: string;
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기중",
  APPROVED: "승인됨",
  REJECTED: "반려됨",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function ResidentRow({ user }: { user: ResidentUser }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);
    await fetch("/api/admin/residents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">
          {user.name}{" "}
          <span className="font-normal text-muted">
            · {user.dong}동 {user.ho}호
          </span>
        </p>
        <p className="text-xs text-muted">
          {user.phone} · {new Date(user.createdAt).toLocaleDateString("ko-KR")} 신청
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[user.status]}`}
        >
          {STATUS_LABEL[user.status]}
        </span>
        {user.status !== "APPROVED" && (
          <button
            disabled={loading}
            onClick={() => updateStatus("APPROVED")}
            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            승인
          </button>
        )}
        {user.status !== "REJECTED" && (
          <button
            disabled={loading}
            onClick={() => updateStatus("REJECTED")}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            반려
          </button>
        )}
      </div>
    </div>
  );
}
