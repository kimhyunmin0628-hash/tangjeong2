"use client";

import { useState } from "react";

interface Image {
  id: string;
  url: string;
  order: number;
  caption?: string | null;
}

interface Item {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  createdAt: Date | string;
  images: Image[];
}

/** "변경전"/"변경후"가 포함된 캡션이 연달아 붙은 이미지 쌍은 좌우로 나란히 배치 */
function renderImages(images: Image[], title: string) {
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < images.length) {
    const cur = images[i];
    const next = images[i + 1];
    if (cur.caption?.includes("변경전") && next?.caption?.includes("변경후")) {
      nodes.push(
        <div key={cur.id} className="grid grid-cols-2 gap-3">
          {[cur, next].map((img) => (
            <figure key={img.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={title}
                className="w-full rounded-xl border border-border object-contain"
              />
              <figcaption className="mt-1 text-center text-xs text-muted">
                {img.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      );
      i += 2;
    } else {
      nodes.push(
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={cur.id}
          src={cur.url}
          alt={title}
          className="w-full rounded-xl border border-border object-contain"
        />
      );
      i += 1;
    }
  }
  return nodes;
}

export default function ImprovementTabs({
  categories,
  labels,
  grouped,
}: {
  categories: string[];
  labels: Record<string, string>;
  grouped: Record<string, Item[]>;
}) {
  const [active, setActive] = useState(categories[0]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-border">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-t-lg px-5 py-3 text-lg font-bold transition sm:text-xl ${
              active === cat
                ? "border-b-2 border-brand text-brand"
                : "text-muted hover:text-foreground"
            }`}
          >
            {labels[cat]}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-10">
        {(grouped[active] ?? []).length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            등록된 자료가 없습니다.
          </p>
        ) : (
          grouped[active].map((item) => (
            <section key={item.id}>
              <h3 className="text-base font-bold text-foreground">
                {item.title}
              </h3>
              {item.description && (
                <p className="mt-1 text-sm text-muted">{item.description}</p>
              )}

              {item.images.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {renderImages(item.images, item.title)}
                </div>
              ) : (
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-brand hover:underline"
                >
                  파일 열기 →
                </a>
              )}
            </section>
          ))
        )}
      </div>
    </div>
  );
}
