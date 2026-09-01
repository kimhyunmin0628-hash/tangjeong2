"use client";

import { useEffect, useState } from "react";
import DeletePhotoButton from "./delete-photo-button";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
}

export default function PhotoGrid({
  photos,
  monthLabel,
  isAdmin,
}: {
  photos: Photo[];
  monthLabel: string;
  isAdmin: boolean;
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

  const active = openIndex !== null ? photos[openIndex] : null;

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.caption ?? monthLabel}
              onClick={() => setOpenIndex(idx)}
              className="aspect-[4/3] w-full cursor-zoom-in object-cover transition hover:opacity-90"
            />
            <div className="flex items-center justify-between gap-2 p-3">
              <p className="truncate text-xs text-muted">{photo.caption || "-"}</p>
              {isAdmin && <DeletePhotoButton id={photo.id} />}
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div
          onClick={() => setOpenIndex(null)}
          className="fixed inset-0 z-50 flex cursor-zoom-out flex-col items-center justify-center gap-3 bg-black/90 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.url}
            alt={active.caption ?? monthLabel}
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
    </>
  );
}
