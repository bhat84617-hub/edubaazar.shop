import { NextRequest, NextResponse } from "next/server";
import { isValidAdminSession } from "@/lib/admin-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get("edubazar_admin_session")?.value;
    if (!isValidAdminSession(session)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
