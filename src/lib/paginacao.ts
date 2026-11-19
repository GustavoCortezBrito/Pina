/** Número de página seguro para qualquer valor vindo da URL ("abc", "-5", "1e99" viram 1 ou o teto). */
export function paginaValida(valor: unknown): number {
  const n = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.trunc(n), 100_000);
}
