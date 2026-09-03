"use client";

export default function ProgressPrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-card"
    >
      인쇄
    </button>
  );
}
