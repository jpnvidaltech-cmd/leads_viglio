import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminPage = req.nextUrl.pathname.startsWith("/dashboard/usuarios");

    // Redirigir si intenta acceder a página de admin sin rol admin
    if (isAdminPage && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Rutas que requieren autenticación
        const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
        const isApi = req.nextUrl.pathname.startsWith("/api") && !req.nextUrl.pathname.startsWith("/api/auth");

        if (isDashboard || isApi) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
