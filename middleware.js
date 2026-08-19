import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "loreshi_session";

export function middleware(request) {
  const sessionCookie = request.cookies.get(
    SESSION_COOKIE_NAME
  )?.value;

  const pathname = request.nextUrl.pathname;

  const protectedRoutes = [
    "/account",
    "/cart",
    "/checkout",
    "/payment",
    "/orders",
  ];

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL(
      "/auth",
      request.url
    );

    loginUrl.searchParams.set(
      "redirect",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/payment/:path*",
    "/orders/:path*",
  ],
};