import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  
  const sessionCookie = request.cookies.get("edubazar_admin_session");
  const session = sessionCookie?.value;
  
  const isValid = (() => {
    try {
      if (!session) return false;
      const parts = session.split(".");
      if (parts.length !== 3) return false;
      
      const [role, expiresText, signature] = parts;
      if (role !== "admin" || !expiresText || !signature) return false;
      
      const expires = Number(expiresText);
      if (isNaN(expires) || expires < Math.floor(Date.now() / 1000)) return false;
      
      const payload = `${role}.${expiresText}`;
      const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
      if (!secret) return false;
      
      const crypto = require("node:crypto");
      const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
      
      if (expected.length !== signature.length) return false;
      
      for (let i = 0; i < expected.length; i++) {
        if (expected.charCodeAt(i) !== signature.charCodeAt(i)) return false;
      }
      
      return true;
    } catch {
      return false;
    }
  })();

  const isAdminLogin = url.pathname.startsWith("/admin/login");
  const isAdminArea = url.pathname.startsWith("/admin");

  if (!isValid && isAdminArea && !isAdminLogin) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isValid && isAdminLogin) {
    const dashboardUrl = new URL("/admin", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin/login"],
};
