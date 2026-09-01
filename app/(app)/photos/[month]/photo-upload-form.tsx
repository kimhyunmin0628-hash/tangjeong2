"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function PhotoUploadForm({ month }: { month: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const files = fileRef.current?.files;
    if (!files || files.length === 0) {
      setError("업로드할 사진을 선택해주세요.");
      return;
    }

    setLoading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("month", month);
      formData.append("caption", caption);
      formData.append("file", file);
      const res = await fetch("/api/photos", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "업로드 중 오류가 발생했습니다.");
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setCaption("");
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-brand/40 bg-brand/5 p-4"
    >
      <div className="flex-1 min-w-[160px]">
        <label className="mb-1 block text-xs font-medium text-foreground">
          사진 선택 (여러 장 가능)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="w-full text-sm"
        />
      </div>
      <div className="flex-1 min-w-[160px]">
        <label className="mb-1 block text-xs font-medium text-foreground">
          설명 (선택)
        </label>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="예: 3층 골조 공사"
          className="w-full rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "업로드 중..." : "업로드"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
