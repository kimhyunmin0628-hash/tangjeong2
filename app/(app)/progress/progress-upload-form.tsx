"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProgressUploadForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("공정표 엑셀 파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    const res = await fetch("/api/progress", { method: "POST", body: formData });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "업로드 중 오류가 발생했습니다.");
      return;
    }

    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-brand/40 bg-brand/5 p-4"
    >
      <div className="flex-1 min-w-[220px]">
        <label className="mb-1 block text-xs font-medium text-foreground">
          공정표 엑셀 업로드 (.xlsx)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="w-full text-sm"
        />
        <p className="mt-1 text-[11px] text-muted">
          헤더에 &quot;계획공정율&quot;, &quot;실적공정율&quot; 열이 포함된 시트를 업로드하면
          선그래프가 자동으로 갱신됩니다.
        </p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "업로드 중..." : "공정표 업로드"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
