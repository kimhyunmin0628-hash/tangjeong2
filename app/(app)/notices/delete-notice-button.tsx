"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteNoticeButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("이 공지사항을 삭제하시겠습니까?")) return;
    setLoading(true);
    await fetch(`/api/notices?id=${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="shrink-0 text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      삭제
    </button>
  );
}
