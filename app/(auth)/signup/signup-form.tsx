"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    dong: "",
    ho: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 4) {
      setError("비밀번호는 4자 이상 입력해주세요.");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "가입 신청 중 오류가 발생했습니다.");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 1800);
  }

  if (done) {
    return (
      <div className="rounded-lg bg-brand/10 p-4 text-sm text-brand">
        가입 신청이 접수되었습니다. 관리자 승인 후 로그인하실 수 있습니다.
        <br />
        잠시 후 로그인 페이지로 이동합니다.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">이름</label>
        <input
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">동</label>
          <input
            required
            placeholder="예: 101"
            value={form.dong}
            onChange={(e) => update("dong", e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">호수</label>
          <input
            required
            placeholder="예: 1502"
            value={form.ho}
            onChange={(e) => update("ho", e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">휴대전화번호</label>
        <input
          type="tel"
          required
          placeholder="01012345678"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">비밀번호</label>
        <input
          type="password"
          required
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">비밀번호 확인</label>
        <input
          type="password"
          required
          value={form.passwordConfirm}
          onChange={(e) => update("passwordConfirm", e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "신청 중..." : "가입 신청"}
      </button>
    </form>
  );
}
