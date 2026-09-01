import Link from "next/link";
import SignupForm from "./signup-form";

export default function SignupPage() {
  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-foreground">입주자 인증 가입</h2>
      <p className="mb-6 text-sm text-muted">
        입력하신 동/호수 정보는 관리자(현장 사무실) 확인 후 승인되며, 승인 완료 시 로그인하실 수 있습니다.
      </p>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-muted">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
