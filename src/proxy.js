import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/about-us",
  "/career",
  "/landing-page",
];

const authRoutes = ["/auth/login", "/auth/register"];

export function proxy(request) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);

  let user = null;

  try {
    if (token) {
      user = verifyToken(token);
    }
  } catch (error) {
    user = null;
  }

  const isLoggedIn = !!user?.id;

  // 1. Not logged in and trying to access protected route
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Logged in user trying to access login/register page
  if (isLoggedIn && isAuthRoute) {
    const redirectUrl =
      user.role === "SEEKER"
        ? new URL("/jobs", request.url)
        : new URL("/dashboard", request.url);

    return NextResponse.redirect(redirectUrl);
  }

  // 3. SEEKER trying to access employer dashboard
  if (
    isLoggedIn &&
    user.role === "SEEKER" &&
    pathname.startsWith("/dashboard")
  ) {
    const jobUrl = new URL("/jobs", request.url);
    return NextResponse.redirect(jobUrl);
  }

  // 4. EMPLOYER trying to access seeker jobs area
  if (isLoggedIn && user.role === "EMPLOYER" && pathname.startsWith("/jobs")) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 5. Otherwise allow request
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
