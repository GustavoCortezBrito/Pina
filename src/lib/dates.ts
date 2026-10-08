// Datas "sem hora" (vencimento, competência, início de contrato) são representadas
// como Date à meia-noite UTC — é assim que o Prisma lê/grava colunas @db.Date.
// Todas as contas de calendário abaixo usam getters/setters UTC.

export const TIMEZONE = "America/Sao_Paulo";
const DAY_MS = 86_400_000;

export function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

/** Hoje no calendário de São Paulo. */
export function today(): Date {
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parseISODate(iso)!;
}

/** "2026-09-17" → Date UTC (null se inválida). */
export function parseISODate(value: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = utcDate(y, m, d);
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? date : null;
}

/** "2026-09" → primeiro dia do mês. */
export function parseISOMonth(value: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const [, y, m] = match.map(Number);
  return m >= 1 && m <= 12 ? utcDate(y, m, 1) : null;
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function toISOMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function startOfMonth(date: Date): Date {
  return utcDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
}

export function endOfMonth(date: Date): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  return utcDate(y, m, daysInMonth(y, m));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Soma meses mantendo o dia, limitado ao último dia do mês (31/01 + 1 → 28/02). */
export function addMonths(date: Date, months: number): Date {
  const total = date.getUTCFullYear() * 12 + date.getUTCMonth() + months;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  return utcDate(year, month, Math.min(date.getUTCDate(), daysInMonth(year, month)));
}

/** Data com o dia desejado dentro do mês de `monthRef` (limitado ao fim do mês). */
export function dayInMonth(monthRef: Date, day: number): Date {
  const y = monthRef.getUTCFullYear();
  const m = monthRef.getUTCMonth() + 1;
  return utcDate(y, m, Math.min(day, daysInMonth(y, m)));
}

/** Diferença em dias corridos (a − b). */
export function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / DAY_MS);
}

export function minDate(a: Date, b: Date): Date {
  return a.getTime() <= b.getTime() ? a : b;
}

export function maxDate(a: Date, b: Date): Date {
  return a.getTime() >= b.getTime() ? a : b;
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}

// ───────── Formatação ─────────

const dateFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", month: "short", year: "numeric" });
const longFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const dateTimeFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIMEZONE,
  dateStyle: "short",
  timeStyle: "short",
});

export function formatDate(date: Date | null | undefined): string {
  return date ? dateFmt.format(date) : "—";
}

/** "set. de 2026" → "set/2026" */
export function formatMonth(date: Date | null | undefined): string {
  if (!date) return "—";
  const parts = monthFmt.formatToParts(date);
  const month = parts.find((p) => p.type === "month")?.value.replace(".", "") ?? "";
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  return `${month}/${year}`;
}

export function formatDateLong(date: Date): string {
  return longFmt.format(date);
}

/** Para timestamps reais (criadoEm etc.), exibidos no fuso de São Paulo. */
export function formatDateTime(date: Date | null | undefined): string {
  return date ? dateTimeFmt.format(date) : "—";
}

// ───────── Dias úteis e feriados ─────────

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher). */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utcDate(year, month, day);
}

const FERIADOS_FIXOS = ["01-01", "04-21", "05-01", "09-07", "10-12", "11-02", "11-15", "11-20", "12-25"];

/** Feriados nacionais + dias sem expediente bancário (Carnaval, Sexta-feira Santa, Corpus Christi). */
export function feriadosDoAno(year: number, extrasMMDD: string[] = []): Set<string> {
  const pascoa = easterSunday(year);
  const moveis = [-48, -47, -2, 60].map((offset) => toISODate(addDays(pascoa, offset)));
  const fixos = [...FERIADOS_FIXOS, ...extrasMMDD].map((mmdd) => `${year}-${mmdd}`);
  return new Set([...fixos, ...moveis]);
}

export function isDiaUtil(date: Date, extrasMMDD: string[] = []): boolean {
  const weekday = date.getUTCDay();
  if (weekday === 0 || weekday === 6) return false;
  return !feriadosDoAno(date.getUTCFullYear(), extrasMMDD).has(toISODate(date));
}

/** A própria data, se for dia útil; senão, o próximo dia útil. */
export function proximoDiaUtil(date: Date, extrasMMDD: string[] = []): Date {
  let current = date;
  while (!isDiaUtil(current, extrasMMDD)) current = addDays(current, 1);
  return current;
}
