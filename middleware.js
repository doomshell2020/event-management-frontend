// middleware.js
import { NextResponse } from "next/server";

/**
 * Middleware handles route protection for:
 * - Admin panel routes (/admin)
 * - User routes (like /profile, /dashboard, etc.)
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get tokens
  const adminAuthToken = request.cookies.get("adminAuthToken")?.value;
  const userAuthToken = request.cookies.get("userAuthToken")?.value;

  // -----------------------------
  // ✅ PUBLIC ROUTES (no redirect)
  // -----------------------------
  const publicRoutes = ["/login", "/register", "/forgot-password"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const eventDetailRegex = /^\/event\/\d+\/[a-zA-Z0-9\-]+\/?$/;

  if (eventDetailRegex.test(pathname)) {
    return NextResponse.next();
  }


  // -----------------------------
  // 🧩 ADMIN ROUTE PROTECTION
  // -----------------------------
  if (pathname.startsWith("/admin")) {
    // Allow admin login/auth routes
    if (pathname.startsWith("/admin/auth")) {
      return NextResponse.next();
    }

    // If no admin token → redirect to admin login
    if (!adminAuthToken) {
      return NextResponse.redirect(new URL("/admin/auth", request.url));
    }
  }

  // -----------------------------
  // 👤 USER ROUTE PROTECTION
  // -----------------------------
  const protectedUserRoutes = ["/profile", "/dashboard", "/orders", "/cart", "/event","/event/dashboard"];
  const isProtectedUserRoute = protectedUserRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedUserRoute) {
    if (!userAuthToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ✅ Allow access by default
  return NextResponse.next();
}

// Apply middleware to only these routes (for better performance)
export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
    "/orders/:path*",
    "/cart/:path*",
    "/event/:path*",
  ],
};
