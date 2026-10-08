import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Checagem otimista: só olha se existe cookie de sessão, para evitar uma ida ao banco
 * a cada navegação. A validação de verdade acontece em cada página/ação (requireUser).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const logado = getSessionCookie(request) !== null;
  const naTelaDeLogin = pathname === "/login";

  if (!logado && !naTelaDeLogin) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (logado && naTelaDeLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|icon.svg|favicon.ico).*)"],
};
