"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMonthLabel } from "@/lib/constants";

export default function ProgressInputForm({
  nextLabel,
  nextPlanned,
}: {
  nextLabel: string | null;
  nextPlanned: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [actual, setActual] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!nextLabel) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card p-4 text-sm text-muted">
        계획된 전체 기간의 실적이 모두 입력되었습니다.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (actual === "") {
      setError("실적 공정율을 입력해주세요.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: nextLabel, actual: Number(Number(actual).toFixed(1)) }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "저장 중 오류가 발생했습니다.");
      return;
    }

    setActual("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-brand/40 bg-brand/5 p-4 text-left text-sm font-medium text-brand hover:bg-brand/10"
      >
        + 데이터 추가 ({formatMonthLabel(nextLabel)} 실적 입력)
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-brand/40 bg-brand/5 p-4"
    >
      <div className="min-w-[160px]">
        <p className="mb-1 text-xs font-medium text-foreground">
          {formatMonthLabel(nextLabel)} 실적 공정율(%)
        </p>
        <input
          type="number"
          min={0}
          max={100}
          step="0.1"
          autoFocus
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          placeholder={nextPlanned !== null ? `계획 ${nextPlanned}%` : "예: 85"}
          className="w-full rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "저장 중..." : "저장"}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setError(null);
        }}
        className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-card"
      >
        취소
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
