import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { routeAccessMap } from "./lib/settings";

const matchers = Object.entries(routeAccessMap).map(
  ([pattern, roles]) => ({
    matcher: createRouteMatcher([pattern]),
    allowedRoles: roles,
  })
);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // ✅ 1. Not signed in → allow (login modal will handle it)
  if (!userId) {
    return NextResponse.next();
  }

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;

  // ✅ 2. Signed in, but role not yet attached → allow briefly
  if (!role) {
    return NextResponse.next();
  }

  // ✅ 3. Role-based route enforcement
  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req) && !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL(`/${role}`, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|.*\\.(?:css|js|jpg|jpeg|png|gif|svg|ico)).*)",
  ],
};
