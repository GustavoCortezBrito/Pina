// Números e valores por extenso em português (usados em contratos e recibos).

const UNIDADES = [
  "zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez",
  "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove",
];
const DEZENAS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CENTENAS = [
  "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos",
  "seiscentos", "setecentos", "oitocentos", "novecentos",
];
const ESCALAS: Array<[string, string]> = [
  ["", ""],
  ["mil", "mil"],
  ["milhão", "milhões"],
  ["bilhão", "bilhões"],
];

function ate999(n: number): string {
  if (n === 100) return "cem";
  const partes: string[] = [];
  const c = Math.floor(n / 100);
  const r = n % 100;
  if (c) partes.push(CENTENAS[c]);
  if (r) {
    if (r < 20) partes.push(UNIDADES[r]);
    else {
      const u = r % 10;
      partes.push(u ? `${DEZENAS[Math.floor(r / 10)]} e ${UNIDADES[u]}` : DEZENAS[Math.floor(r / 10)]);
    }
  }
  return partes.join(" e ");
}

function grupos(n: number): number[] {
  const result: number[] = [];
  let x = n;
  while (x > 0) {
    result.push(x % 1000);
    x = Math.floor(x / 1000);
  }
  return result;
}

export function numeroPorExtenso(valor: number): string {
  const n = Math.floor(Math.abs(valor));
  if (n === 0) return "zero";
  const gs = grupos(n);
  const partes: Array<{ texto: string; valor: number }> = [];
  for (let i = gs.length - 1; i >= 0; i--) {
    const g = gs[i];
    if (!g) continue;
    let texto: string;
    if (i === 0) texto = ate999(g);
    else if (i === 1) texto = g === 1 ? "mil" : `${ate999(g)} mil`;
    else texto = `${ate999(g)} ${g === 1 ? ESCALAS[i][0] : ESCALAS[i][1]}`;
    partes.push({ texto, valor: g });
  }
  if (partes.length === 1) return partes[0].texto;
  const ultimo = partes[partes.length - 1];
  const usaE = ultimo.valor < 100 || ultimo.valor % 100 === 0;
  const inicio = partes.slice(0, -1).map((p) => p.texto).join(" ");
  return `${inicio}${usaE ? " e " : " "}${ultimo.texto}`;
}

/** 130000 → "mil e trezentos reais"; 150 → "um real e cinquenta centavos". */
export function valorPorExtenso(cents: number): string {
  const total = Math.abs(Math.round(cents));
  const reais = Math.floor(total / 100);
  const centavos = total % 100;
  const partes: string[] = [];
  if (reais > 0) {
    const gs = grupos(reais);
    const redondoEmMilhoes = reais >= 1_000_000 && gs[0] === 0 && gs[1] === 0;
    const moeda = reais === 1 ? "real" : "reais";
    partes.push(`${numeroPorExtenso(reais)} ${redondoEmMilhoes ? "de " : ""}${moeda}`);
  }
  if (centavos > 0) {
    partes.push(`${numeroPorExtenso(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`);
  }
  return partes.length ? partes.join(" e ") : "zero real";
}
