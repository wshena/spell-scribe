import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const protectedRoutes = [
  "/your-decks",
  "/collection",
  "/wishlist",
  "/account/settings",
];

const guestOnlyRoutes = [
  "/account/auth/login",
  "/account/auth/register",
];

const matchesRoute = (pathname: string, routes: string[]) =>
  routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

const withAuthCookies = (target: NextResponse, source: NextResponse) => {
  source.cookies.getAll().forEach((cookie) => {
    const { name, value, ...options } = cookie;
    target.cookies.set(name, value, options);
  });

  return target;
};

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { response, user } = await updateSession(request);

  if (!user && matchesRoute(pathname, protectedRoutes)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/account/auth/login";
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);

    return withAuthCookies(NextResponse.redirect(loginUrl), response);
  }

  if (user && matchesRoute(pathname, guestOnlyRoutes)) {
    const appUrl = request.nextUrl.clone();
    appUrl.pathname = "/your-decks";
    appUrl.search = "";

    return withAuthCookies(NextResponse.redirect(appUrl), response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
