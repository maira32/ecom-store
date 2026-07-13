import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname.startsWith("/dashboard")) {

      if (req.nextauth.token?.role !== "admin") {
        return NextResponse.redirect(new URL("/admin-login", req.url));
      }
    }
  },
  {
    callbacks: {
      // Always let our middleware function above run (even with no token) so
      // it's the one deciding where to redirect, rather than withAuth falling
      // back to authOptions.pages.signIn (which is your regular customer
      // /login page — wrong destination for a /dashboard request).
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};