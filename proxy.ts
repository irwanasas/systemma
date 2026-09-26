import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/cookie";

export const proxy = (request: NextRequest): NextResponse => {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));
  const response = NextResponse.next();
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
};

export const config = {
  matcher: ["/((?!login|api/health|_next/static|_next/image|favicon.ico).*)"],
};
