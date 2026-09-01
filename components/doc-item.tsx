"use client";

import { useEffect, useState } from "react";

interface Image {
  id: string;
  url: string;
  caption: string | null;
  order: number;
}

interface Item {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  images: Image[];
  tableData?: unknown;
}

function isTableRows(data: unknown): data is string[][] {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every((row) => Array.isArray(row))
  );
}

/** 사진이 많고 설명 위주인 항목(품질관리·안전관리)을 위한 카드: 큰 제목 + 4열 그리드 + 캡션 + 팝업 확대 */
export default function DocItem({
  item,
  hideTitle,
}: {
  item: Item;
  hideTitle?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [openIndex]);

  const active = openIndex !== null ? item.images[openIndex] : null;

  return (
    <section>
      {!hideTitle && (
        <h3 className="mb-3 text-xl font-bold text-foreground sm:text-2xl">
          {item.title}
        </h3>
      )}
      {item.description && (
        <p className="mb-4 text-[15px] leading-relaxed text-foreground/90">
          {item.description}
        </p>
      )}

      {isTableRows(item.tableData) && (
        <div className="mb-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[480px] text-sm">
            <tbody>
              {item.tableData.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={rIdx === 0 ? "bg-brand/10 font-semibold" : "border-t border-border"}
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="whitespace-nowrap px-3 py-2 text-center text-foreground">
                      {cell || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {item.images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {item.images.map((img, idx) => (
            <div key={img.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.caption ?? item.title}
                onClick={() => setOpenIndex(idx)}
                className="aspect-[4/3] w-full cursor-zoom-in rounded-lg border border-border object-cover"
              />
              {img.caption && (
                <p className="mt-1 truncate text-xs text-muted" title={img.caption}>
                  {img.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        item.fileUrl && (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium text-brand hover:underline"
          >
            파일 열기 →
          </a>
        )
      )}

      {active && (
        <div
          onClick={() => setOpenIndex(null)}
          className="fixed inset-0 z-50 flex cursor-zoom-out flex-col items-center justify-center gap-3 bg-black/90 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.url}
            alt={active.caption ?? item.title}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />
          {active.caption && (
            <p className="text-sm text-white/80">{active.caption}</p>
          )}
          <button
            onClick={() => setOpenIndex(null)}
            aria-label="닫기"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
          >
            ×
          </button>
        </div>
      )}
    </section>
  );
}
