/**
 * Confere de onde veio um pedido que altera dados (envio de arquivo, foto de perfil). O cookie de
 * sessão já é `SameSite=Lax`, que impede outro site de usá-lo; esta checagem é uma segunda camada.
 * Pedidos sem o cabeçalho Origin (navegação do próprio site, ferramentas de linha de comando) passam,
 * mas qualquer Origin diferente do endereço do sistema é recusado.
 */
export function origemInvalida(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  let hostDaOrigem: string;
  try {
    hostDaOrigem = new URL(origin).host;
  } catch {
    return true; // "null" ou lixo
  }
  const esperado = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  return !esperado || hostDaOrigem.toLowerCase() !== esperado.toLowerCase();
}
