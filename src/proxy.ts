import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { montarCsp, novoNonce } from "@/lib/csp";

/**
 * Checagem otimista: só olha se existe cookie de sessão, para evitar uma ida ao banco
 * a cada navegação. A validação de verdade acontece em cada página/ação (requireUser).
 * Também aplica a política de segurança de conteúdo (CSP) com um código novo a cada pedido.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // O site público (início e página de cada imóvel) não pede login; o painel fica em /painel e nas
  // demais rotas internas.
  const publica = pathname === "/" || pathname.startsWith("/imovel/");
  const logado = getSessionCookie(request) !== null;
  const naTelaDeLogin = pathname === "/login";

  // Não redireciona /login só pela existência do cookie: um cookie vencido/inválido causaria um
  // vai-e-vem infinito (/painel → /login → /painel). A própria página de login confere a sessão de verdade.
  if (!publica && !logado && !naTelaDeLogin) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  const nonce = novoNonce();
  const csp = montarCsp({
    nonce,
    desenvolvimento: process.env.NODE_ENV !== "production",
    https: (process.env.BETTER_AUTH_URL ?? "").startsWith("https://"),
  });

  // O Next lê o código do cabeçalho do PEDIDO para marcar os seus próprios scripts; o layout raiz o repassa ao tema.
  const cabecalhos = new Headers(request.headers);
  cabecalhos.set("x-nonce", nonce);
  cabecalhos.set("Content-Security-Policy", csp);
  const resposta = NextResponse.next({ request: { headers: cabecalhos } });
  resposta.headers.set("Content-Security-Policy", csp);
  return resposta;
}

export const config = {
  // Fora do proxy: APIs, arquivos do Next e qualquer arquivo estático (tem ponto no nome:
  // icon.svg, robots.txt, sitemap.xml, imagens da pasta public).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
