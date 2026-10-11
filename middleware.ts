/**
 * Middleware (Edge): protege /admin/dashboard/* y evita mostrar el login a quien
 * ya tiene sesión. Es la primera barrera; el dashboard y las APIs de admin
 * vuelven a verificar la sesión en el servidor (defensa en profundidad).
 */
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  // En Workers, OpenNext vuelca vars/secrets de tipo string en process.env.
  const secret = process.env.SESSION_SECRET;

  // Sin secreto accesible aquí (p.ej. algunos entornos de dev) solo comprobamos
  // la presencia de la cookie; la verificación criptográfica la hace la página.
  const authenticated = secret ? Boolean(await verifySession(token, secret)) : Boolean(token);

  if (pathname.startsWith("/admin/dashboard") && !authenticated) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname + search);
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  if (pathname === "/admin/login" && authenticated) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (pathname === "/admin") {
    return NextResponse.redirect(new URL(authenticated ? "/admin/dashboard" : "/admin/login", request.url));
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/login", "/admin/dashboard/:path*"],
};
