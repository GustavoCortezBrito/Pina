import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Checagem otimista: só olha se existe cookie de sessão, para evitar uma ida ao banco
 * a cada navegação. A validação de verdade acontece em cada página/ação (requireUser).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // O site público (início e página de cada imóvel) não pede login; o painel fica em /painel e nas
  // demais rotas internas.
  if (pathname === "/" || pathname.startsWith("/imovel/")) return NextResponse.next();
  const logado = getSessionCookie(request) !== null;
  const naTelaDeLogin = pathname === "/login";

  if (!logado && !naTelaDeLogin) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // Não redireciona /login só pela existência do cookie: um cookie vencido/inválido causaria um
  // vai-e-vem infinito (/painel → /login → /painel). A própria página de login confere a sessão de verdade.
  return NextResponse.next();
}

export const config = {
  // Fora do proxy: APIs, arquivos do Next e qualquer arquivo estático (tem ponto no nome:
  // icon.svg, robots.txt, sitemap.xml, imagens da pasta public).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
