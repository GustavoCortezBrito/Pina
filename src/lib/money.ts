// Valores monetários trafegam como inteiros em centavos. Os cálculos usam BigInt
// para não perder precisão (percentuais têm até 4 casas decimais).

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(cents: number | null | undefined): string {
  return brl.format((cents ?? 0) / 100);
}

/** Reais (number) → centavos. */
export function toCents(reais: number): number {
  return Math.round(reais * 100);
}

/** "1.234,56" | "1234.56" | "R$ 1.234,56" → centavos (null se inválido). */
export function parseBRL(input: string): number | null {
  const clean = input.replace(/[^\d,.-]/g, "").trim();
  if (!clean) return null;
  let normalized = clean;
  if (clean.includes(",")) {
    // Formato BR explícito: vírgula como decimal
    normalized = clean.replace(/\./g, "").replace(",", ".");
  } else if (/\.\d{3}$/.test(clean)) {
    // Ponto seguido de exatamente 3 dígitos no final → separador de milhar BR
    normalized = clean.replace(/\./g, "");
  }
  // Caso contrário, trata o ponto como decimal (ex: "99.9" → 99.9)
  const value = Number(normalized);
  return Number.isFinite(value) ? toCents(value) : null;
}

/** Divisão inteira com arredondamento "meio para cima" (simétrico para negativos). */
export function divRound(numerator: bigint, denominator: bigint): bigint {
  const negative = numerator < 0n !== denominator < 0n;
  const n = numerator < 0n ? -numerator : numerator;
  const d = denominator < 0n ? -denominator : denominator;
  const q = (n * 2n + d) / (2n * d);
  return negative ? -q : q;
}

/** Percentual com até 4 casas → inteiro escalado (4,35% → 43500). */
function scalePercent(percent: number): bigint {
  return BigInt(Math.round(percent * 10_000));
}

/**
 * `cents × percent% × num / den`, arredondado para o centavo.
 * Ex.: juros pró-rata = applyPercent(saldo, 1, dias, 30).
 */
export function applyPercent(cents: number, percent: number, num = 1, den = 1): number {
  const numerator = BigInt(cents) * scalePercent(percent) * BigInt(num);
  return Number(divRound(numerator, 1_000_000n * BigInt(den)));
}

/** `cents × num / den`, arredondado (usado em valores proporcionais por dia). */
export function prorate(cents: number, num: number, den: number): number {
  return Number(divRound(BigInt(cents) * BigInt(num), BigInt(den)));
}

/** Valor reajustado: cents × (1 + percent%). */
export function reajustar(cents: number, percent: number): number {
  return cents + applyPercent(cents, percent);
}

export function sum(values: Array<number | null | undefined>): number {
  return values.reduce<number>((acc, v) => acc + (v ?? 0), 0);
}
