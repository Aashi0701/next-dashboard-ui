import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { routeAccessMap, Role } from "./lib/settings";

/* ---------------- ROLE MATCHERS ---------------- */
const roleMatchers = Object.entries(routeAccessMap).map(
  ([pattern, roles]) => ({
    matcher: createRouteMatcher([pattern]),
    allowedRoles: roles as Role[],
  })
);

/* ---------------- MIDDLEWARE ---------------- */
export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const url = req.nextUrl;
  const pathname = url.pathname;

  /* ---------------------------------------------
   * 1️⃣ Public access (not logged in)
   * ------------------------------------------- */
  if (!userId) {
    return NextResponse.next();
  }

  /* ---------------------------------------------
   * 2️⃣ Extract role safely
   * ------------------------------------------- */
  const role = (sessionClaims?.metadata as { role?: Role })?.role;

  // Session exists but role not yet hydrated → wait
  if (!role) {
    return NextResponse.next();
  }

  /* ---------------------------------------------
   * 3️⃣ HARD STOP: Logged-in user on HOME (/)
   *     → Redirect immediately (NO FLASH)
   * ------------------------------------------- */
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${role}`, req.url));
  }

  /* ---------------------------------------------
   * 4️⃣ Prevent logged-in users from seeing sign-in
   * ------------------------------------------- */
  if (pathname.startsWith("/sign-in")) {
    return NextResponse.redirect(new URL(`/${role}`, req.url));
  }

  /* ---------------------------------------------
   * 5️⃣ Role-based access enforcement
   * ------------------------------------------- */
  for (const { matcher, allowedRoles } of roleMatchers) {
    if (matcher(req) && !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL(`/${role}`, req.url));
    }
  }

  return NextResponse.next();
});

/* ---------------- MATCHER CONFIG ---------------- */
export const config = {
  matcher: [
    "/((?!_next|favicon.ico|.*\\.(?:css|js|jpg|jpeg|png|gif|svg|ico)).*)",
  ],
};
