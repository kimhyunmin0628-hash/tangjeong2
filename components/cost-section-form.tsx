"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ImageItem {
  id: string;
  url: string;
}

interface Props {
  category: "EXECUTION" | "REVENUE" | "RECEIVABLE";
  label: string;
  initialTable: string[][] | null;
  initialNote: string | null;
  initialImages: ImageItem[];
}

/** 원가관리 3개 섹션(실행/매출/채권현황)을 관리자가 표+비고+이미지로 직접 입력·수정하는 폼 */
export default function CostSectionForm({
  category,
  label,
  initialTable,
  initialNote,
  initialImages,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [table, setTable] = useState<string[][]>(
    initialTable && initialTable.length > 0 ? initialTable : [["", ""]]
  );
  const [note, setNote] = useState(initialNote ?? "");
  const [keepIds, setKeepIds] = useState<Set<string>>(
    new Set(initialImages.map((i) => i.id))
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateCell(r: number, c: number, value: string) {
    setTable((prev) =>
      prev.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row))
    );
  }

  function addRow() {
    setTable((prev) => [...prev, prev[0] ? prev[0].map(() => "") : [""]]);
  }
  function removeRow(r: number) {
    setTable((prev) => (prev.length > 1 ? prev.filter((_, ri) => ri !== r) : prev));
  }
  function addCol() {
    setTable((prev) => prev.map((row) => [...row, ""]));
  }
  function removeCol(c: number) {
    setTable((prev) =>
      prev[0] && prev[0].length > 1 ? prev.map((row) => row.filter((_, ci) => ci !== c)) : prev
    );
  }

  function toggleKeep(id: string) {
    setKeepIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("category", category);
    formData.append("note", note);
    formData.append("tableData", JSON.stringify(table));
    formData.append("keepImageIds", JSON.stringify(Array.from(keepIds)));
    newFiles.forEach((f) => formData.append("images", f));

    const res = await fetch("/api/cost-section", { method: "POST", body: formData });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "저장 중 오류가 발생했습니다.");
      return;
    }

    setNewFiles([]);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-4 rounded-lg border border-brand/40 px-4 py-2 text-sm font-medium text-brand hover:bg-brand/5"
      >
        {label} 편집
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 space-y-4 rounded-xl border border-dashed border-brand/40 bg-brand/5 p-4"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-foreground">{label} 편집</h4>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted hover:underline">
          닫기
        </button>
      </div>

      <div>
        <div className="mb-2 flex gap-2">
          <button type="button" onClick={addRow} className="rounded border border-border px-2 py-1 text-xs">
            행 추가
          </button>
          <button type="button" onClick={addCol} className="rounded border border-border px-2 py-1 text-xs">
            열 추가
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="border-collapse text-sm">
            <tbody>
              {table.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className="border border-border p-0.5">
                      <input
                        value={cell}
                        onChange={(e) => updateCell(r, c, e.target.value)}
                        className="w-24 bg-transparent px-1 py-1 text-xs outline-none"
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      type="button"
                      onClick={() => removeRow(r)}
                      className="px-1 text-xs text-red-500 hover:underline"
                    >
                      행삭제
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                {table[0]?.map((_, c) => (
                  <td key={c} className="text-center">
                    <button
                      type="button"
                      onClick={() => removeCol(c)}
                      className="px-1 text-xs text-red-500 hover:underline"
                    >
                      열삭제
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">비고</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border p-2 text-sm"
        />
      </div>

      {initialImages.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            기존 이미지 (체크 해제 시 삭제)
          </label>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {initialImages.map((img) => (
              <label key={img.id} className="relative block cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className={`aspect-[4/3] w-full rounded border object-cover ${
                    keepIds.has(img.id) ? "border-brand" : "border-border opacity-40"
                  }`}
                />
                <input
                  type="checkbox"
                  checked={keepIds.has(img.id)}
                  onChange={() => toggleKeep(img.id)}
                  className="absolute right-1 top-1"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">새 이미지 추가</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
          className="w-full text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "저장 중..." : "저장"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
