"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatMonthLabel } from "@/lib/constants";

interface MonthItem {
  month: string;
  thumb: string | null;
  count: number;
}

export default function PhotosGrid({ items }: { items: MonthItem[] }) {
  const [openMonth, setOpenMonth] = useState<string | null>(null);

  useEffect(() => {
    if (!openMonth) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMonth(null);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [openMonth]);

  const active = items.find((i) => i.month === openMonth) ?? null;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map(({ month, thumb, count }) => (
          <div
            key={month}
            className="overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-md"
          >
            <div className="flex aspect-[4/3] items-center justify-center bg-background">
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumb}
                  alt={formatMonthLabel(month)}
                  onClick={() => setOpenMonth(month)}
                  className="h-full w-full cursor-zoom-in object-cover"
                />
              ) : (
                <Link
                  href={`/photos/${month}`}
                  className="flex h-full w-full items-center justify-center text-xs text-muted"
                >
                  등록된 사진 없음
                </Link>
              )}
            </div>
            <Link href={`/photos/${month}`} className="block p-3 hover:bg-background">
              <p className="text-sm font-semibold text-foreground">
                {formatMonthLabel(month)}
              </p>
              <p className="text-xs text-muted">사진 {count}장</p>
            </Link>
          </div>
        ))}
      </div>

      {active?.thumb && (
        <div
          onClick={() => setOpenMonth(null)}
          className="fixed inset-0 z-50 flex cursor-zoom-out flex-col items-center justify-center gap-3 bg-black/90 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.thumb}
            alt={formatMonthLabel(active.month)}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />
          <p className="text-sm text-white/80">{formatMonthLabel(active.month)}</p>
          <button
            onClick={() => setOpenMonth(null)}
            aria-label="닫기"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
