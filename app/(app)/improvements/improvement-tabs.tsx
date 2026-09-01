"use client";

import { useState } from "react";

interface Image {
  id: string;
  url: string;
  order: number;
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
                  {item.images.map((img) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={img.id}
                      src={img.url}
                      alt={item.title}
                      className="w-full rounded-xl border border-border object-contain"
                    />
                  ))}
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
