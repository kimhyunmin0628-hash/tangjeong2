import { auth } from "@/auth";
import LogoutButton from "@/components/logout-button";

export default async function PendingPage() {
  const session = await auth();
  const status = session?.user?.status;

  const isRejected = status === "REJECTED";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-brand-dark px-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 text-center shadow-xl">
        <p className="text-sm tracking-widest text-accent">
          THE SHARP TANGJEONG INFINITY CITY 2
        </p>
        <h1 className="mt-3 text-xl font-bold text-foreground">
          {isRejected ? "가입 승인이 반려되었습니다" : "입주자 인증 승인 대기 중입니다"}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {isRejected
            ? "동/호수 정보를 다시 확인하신 후 현장 사무실로 문의해주세요."
            : "관리자(현장 사무실)가 입주자 정보를 확인 중입니다. 승인이 완료되면 서비스 이용이 가능합니다."}
        </p>
        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
