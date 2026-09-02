"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function currentMonthLabel() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function ProgressInputForm() {
  const router = useRouter();
  const [label, setLabel] = useState(currentMonthLabel());
  const [planned, setPlanned] = useState("");
  const [actual, setActual] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!label.trim() || planned === "") {
      setError("월/차수 라벨과 계획 공정율을 입력해주세요.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: label.trim(),
        planned: Number(planned),
        actual: actual === "" ? null : Number(actual),
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "저장 중 오류가 발생했습니다.");
      return;
    }

    setLabel(currentMonthLabel());
    setPlanned("");
    setActual("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-brand/40 bg-brand/5 p-4"
    >
      <div className="min-w-[120px]">
        <label className="mb-1 block text-xs font-medium text-foreground">월/차수 라벨</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="2026-09"
          className="w-full rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <div className="min-w-[120px]">
        <label className="mb-1 block text-xs font-medium text-foreground">계획 공정율(%)</label>
        <input
          type="number"
          min={0}
          max={100}
          step="0.1"
          value={planned}
          onChange={(e) => setPlanned(e.target.value)}
          placeholder="예: 45"
          className="w-full rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <div className="min-w-[120px]">
        <label className="mb-1 block text-xs font-medium text-foreground">실적 공정율(%)</label>
        <input
          type="number"
          min={0}
          max={100}
          step="0.1"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          placeholder="미정이면 비워두기"
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
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
      <p className="w-full text-[11px] text-muted">
        이미 입력된 라벨을 다시 저장하면 해당 값이 수정됩니다. 실적을 비워두면 그래프에 계획선(점선)만 표시됩니다.
      </p>
    </form>
  );
}
