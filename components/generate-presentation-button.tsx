"use client";

import { useState } from "react";

const SECTION_OPTIONS: { key: string; label: string }[] = [
  { key: "INTRO", label: "아파트소개" },
  { key: "PHOTOS", label: "현장사진" },
  { key: "PROGRESS", label: "공정진행현황" },
  { key: "QUALITY", label: "품질관리" },
  { key: "SAFETY", label: "안전관리" },
  { key: "IMPROVEMENTS", label: "현장특화사항" },
  { key: "COST", label: "원가관리" },
];

export default function GeneratePresentationButton() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(SECTION_OPTIONS.map((o) => o.key))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleGenerate() {
    if (selected.size === 0) {
      setError("포함할 메뉴를 하나 이상 선택해주세요.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generate-pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: Array.from(selected) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "생성 중 오류가 발생했습니다.");
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "안내자료.pptx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setLoading(false);
      setOpen(false);
    } catch {
      setError("생성 중 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-accent/60 px-3 py-1.5 font-medium text-accent transition hover:bg-accent/10"
      >
        발표자료생성
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 text-foreground shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-foreground">발표자료 생성</h2>
            <p className="mt-1 text-sm text-muted">
              PPT에 포함할 메뉴를 선택해주세요.
            </p>

            <div className="mt-4 space-y-2">
              {SECTION_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-background"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(opt.key)}
                    onChange={() => toggle(opt.key)}
                    className="h-4 w-4 accent-brand"
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-background disabled:opacity-60"
              >
                취소
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {loading ? "생성 중..." : "생성"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
