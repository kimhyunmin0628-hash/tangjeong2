import Link from "next/link";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-foreground">로그인</h2>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted">
        아직 계정이 없으신가요?{" "}
        <Link href="/signup" className="font-medium text-brand hover:underline">
          입주자 인증하고 가입하기
        </Link>
      </p>
    </div>
  );
}
