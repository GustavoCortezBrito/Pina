import { describe, expect, it } from "vitest";
import { addMonths, easterSunday, isDiaUtil, parseISODate, toISODate, utcDate } from "@/lib/dates";
import { numeroPorExtenso, valorPorExtenso } from "@/lib/extenso";
import { formatCNPJ, formatDocumento, formatPhone, whatsappLink } from "@/lib/format";
import { applyPercent, formatBRL, parseBRL, prorate } from "@/lib/money";
import { isValidCNPJ, isValidCPF } from "@/lib/validators";

describe("money", () => {
  it("formata e interpreta reais", () => {
    expect(formatBRL(123_456)).toBe("R$ 1.234,56");
    expect(parseBRL("1.234,56")).toBe(123_456);
    expect(parseBRL("R$ 1.300")).toBe(130_000);
    expect(parseBRL("99.9")).toBe(9_990);
    expect(parseBRL("abc")).toBeNull();
  });

  it("arredonda meio centavo para cima (e simetricamente)", () => {
    expect(prorate(1, 1, 2)).toBe(1);
    expect(prorate(-1, 1, 2)).toBe(-1);
    expect(applyPercent(5, 10)).toBe(1); // 0,5 centavo → 1
    expect(applyPercent(4, 10)).toBe(0);
  });
});

describe("dates", () => {
  it("valida datas ISO", () => {
    expect(parseISODate("2026-02-30")).toBeNull();
    expect(toISODate(parseISODate("2028-02-29")!)).toBe("2028-02-29");
  });

  it("soma meses respeitando o fim do mês", () => {
    expect(toISODate(addMonths(utcDate(2026, 1, 31), 1))).toBe("2026-02-28");
    expect(toISODate(addMonths(utcDate(2026, 11, 30), 3))).toBe("2027-02-28");
    expect(toISODate(addMonths(utcDate(2026, 3, 15), -3))).toBe("2025-12-15");
  });

  it("calcula Páscoa e feriados móveis", () => {
    expect(toISODate(easterSunday(2026))).toBe("2026-04-05");
    expect(toISODate(easterSunday(2027))).toBe("2027-03-28");
    expect(isDiaUtil(utcDate(2026, 4, 3))).toBe(false); // Sexta-feira Santa
    expect(isDiaUtil(utcDate(2026, 2, 17))).toBe(false); // Carnaval
    expect(isDiaUtil(utcDate(2026, 11, 20))).toBe(false); // Consciência Negra
    expect(isDiaUtil(utcDate(2026, 9, 17))).toBe(true);
  });
});

describe("documentos", () => {
  it("valida CPF", () => {
    expect(isValidCPF("529.982.247-25")).toBe(true);
    expect(isValidCPF("529.982.247-24")).toBe(false);
    expect(isValidCPF("111.111.111-11")).toBe(false);
  });

  it("valida CNPJ numérico e alfanumérico", () => {
    expect(isValidCNPJ("11.222.333/0001-81")).toBe(true);
    expect(isValidCNPJ("11.222.333/0001-80")).toBe(false);
    expect(isValidCNPJ("12.ABC.345/01DE-35")).toBe(true);
    expect(isValidCNPJ("12.ABC.345/01DE-36")).toBe(false);
  });

  it("formata documentos e telefones", () => {
    expect(formatDocumento("52998224725")).toBe("529.982.247-25");
    expect(formatCNPJ("11222333000181")).toBe("11.222.333/0001-81");
    expect(formatDocumento("12ABC34501DE35")).toBe("12.ABC.345/01DE-35");
    expect(formatPhone("17991234567")).toBe("(17) 99123-4567");
    expect(formatPhone("1733221100")).toBe("(17) 3322-1100");
    expect(whatsappLink("(17) 99123-4567", "Olá")).toBe("https://wa.me/5517991234567?text=Ol%C3%A1");
  });
});

describe("extenso", () => {
  it("escreve números", () => {
    expect(numeroPorExtenso(0)).toBe("zero");
    expect(numeroPorExtenso(21)).toBe("vinte e um");
    expect(numeroPorExtenso(100)).toBe("cem");
    expect(numeroPorExtenso(101)).toBe("cento e um");
    expect(numeroPorExtenso(1300)).toBe("mil e trezentos");
    expect(numeroPorExtenso(1350)).toBe("mil trezentos e cinquenta");
    expect(numeroPorExtenso(2050)).toBe("dois mil e cinquenta");
    expect(numeroPorExtenso(30)).toBe("trinta");
    expect(numeroPorExtenso(1_000_000)).toBe("um milhão");
    expect(numeroPorExtenso(2_500_000)).toBe("dois milhões e quinhentos mil");
  });

  it("escreve valores em reais", () => {
    expect(valorPorExtenso(130_000)).toBe("mil e trezentos reais");
    expect(valorPorExtenso(150)).toBe("um real e cinquenta centavos");
    expect(valorPorExtenso(1)).toBe("um centavo");
    expect(valorPorExtenso(100_000_000)).toBe("um milhão de reais");
    expect(valorPorExtenso(98_765)).toBe("novecentos e oitenta e sete reais e sessenta e cinco centavos");
  });
});
