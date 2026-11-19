/**
 * Valida o endereço para onde mandar a pessoa depois do login (parâmetro `next`). Só aceita caminhos
 * do próprio sistema: "//site.com" e "/\site.com" começam com barra, mas o navegador os trata como
 * endereço de outro site, o que serviria para um link de phishing.
 */
export function destinoSeguro(next: unknown, padrao = "/painel") {
  if (typeof next !== "string") return padrao;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return padrao;
  // Barras invertidas e quebras de linha também são normalizadas pelos navegadores.
  if (/[\\\r\n\t]/.test(next)) return padrao;
  return next;
}
