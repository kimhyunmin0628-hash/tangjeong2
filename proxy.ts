import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PAGES = ["/login", "/signup"];
const PUBLIC_API_ROUTES = ["/api/signup"];

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isApi = pathname.startsWith("/api");
  const isPublicPage = PUBLIC_PAGES.some((p) => pathname.startsWith(p));
  const isPublicApiRoute = PUBLIC_API_ROUTES.some((p) => pathname.startsWith(p));

  if (isPublicApiRoute) {
    return NextResponse.next();
  }
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

  if (!isLoggedIn) {
    if (isApi) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    if (!isPublicPage) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    return NextResponse.next();
  }

  // 로그인 상태에서 로그인/회원가입 페이지 접근 시 홈으로
  if (isPublicPage) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // 승인 대기/거절 상태는 대기 페이지만 접근 가능
  if (user?.status !== "APPROVED" && pathname !== "/pending") {
    if (isApi) {
      return NextResponse.json({ error: "입주자 인증 승인 대기 중입니다." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/pending", nextUrl));
  }

  // 관리자 전용 영역 (입주자 계정은 원가관리에 진입 자체가 불가능해야 함)
  const isAdminArea =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/cost");
  if (isAdminArea && user?.role !== "ADMIN") {
    if (isApi) {
      return NextResponse.json({ error: "관리자만 접근할 수 있습니다." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads|api/auth).*)",
  ],
};
