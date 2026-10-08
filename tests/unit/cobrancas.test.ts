import { describe, expect, it } from "vitest";
import {
  calcularDataFim,
  calcularVencimento,
  gerarCobrancas,
} from "@/features/contratos/services/cobrancas";
import { toISODate, utcDate } from "@/lib/dates";

const base = {
  prazoMeses: 12,
  diaVencimento: 10,
  valorAluguel: 130_000,
  valorEncargos: 0,
  aluguelAntecipado: false,
};

describe("calcularDataFim", () => {
  it("termina na véspera do aniversário", () => {
    expect(toISODate(calcularDataFim(utcDate(2026, 10, 1), 12))).toBe("2027-09-30");
    expect(toISODate(calcularDataFim(utcDate(2026, 9, 15), 30))).toBe("2029-03-14");
  });

  it("lida com início no dia 31 e fevereiro", () => {
    expect(toISODate(calcularDataFim(utcDate(2026, 1, 31), 1))).toBe("2026-02-27");
    expect(toISODate(calcularDataFim(utcDate(2027, 12, 31), 2))).toBe("2028-02-28");
  });
});

describe("gerarCobrancas", () => {
  it("gera 12 cobranças integrais quando o contrato começa no dia 1", () => {
    const cobrancas = gerarCobrancas({ ...base, dataInicio: utcDate(2026, 10, 1) });
    expect(cobrancas).toHaveLength(12);
    expect(cobrancas.every((c) => c.valorAluguel === 130_000 && !c.proporcional)).toBe(true);
    expect(toISODate(cobrancas[0].competencia)).toBe("2026-10-01");
    expect(toISODate(cobrancas[0].vencimento)).toBe("2026-11-10");
    expect(toISODate(cobrancas[11].competencia)).toBe("2027-09-01");
  });

  it("proporcionaliza o primeiro e o último mês, somando o valor de 12 meses", () => {
    const cobrancas = gerarCobrancas({ ...base, dataInicio: utcDate(2026, 9, 15) });
    expect(cobrancas).toHaveLength(13);

    const primeira = cobrancas[0];
    expect(primeira.proporcional).toBe(true);
    expect(toISODate(primeira.periodoInicio)).toBe("2026-09-15");
    expect(toISODate(primeira.periodoFim)).toBe("2026-09-30");
    expect(primeira.valorAluguel).toBe(69_333); // 1300 × 16/30

    const ultima = cobrancas[12];
    expect(toISODate(ultima.periodoInicio)).toBe("2027-09-01");
    expect(toISODate(ultima.periodoFim)).toBe("2027-09-14");
    expect(ultima.valorAluguel).toBe(60_667); // 1300 × 14/30

    const total = cobrancas.reduce((acc, c) => acc + c.valorAluguel, 0);
    expect(total).toBe(130_000 * 12);
  });

  it("proporcionaliza também os encargos", () => {
    const [primeira] = gerarCobrancas({ ...base, valorEncargos: 15_000, dataInicio: utcDate(2026, 9, 16) });
    expect(primeira.valorEncargos).toBe(7_500); // 150 × 15/30
    expect(primeira.valorTotal).toBe(primeira.valorAluguel + primeira.valorEncargos);
  });

  it("usa os dias do mês em fevereiro de ano bissexto", () => {
    const [primeira] = gerarCobrancas({ ...base, prazoMeses: 1, dataInicio: utcDate(2028, 2, 15) });
    expect(primeira.valorAluguel).toBe(67_241); // 1300 × 15/29
  });

  it("limita o vencimento ao último dia do mês", () => {
    const cobrancas = gerarCobrancas({ ...base, diaVencimento: 31, dataInicio: utcDate(2027, 1, 1) });
    expect(toISODate(cobrancas[0].vencimento)).toBe("2027-02-28");
  });

  it("contrato de 1 mês começando no meio do mês gera duas parcelas proporcionais", () => {
    const cobrancas = gerarCobrancas({ ...base, prazoMeses: 1, dataInicio: utcDate(2026, 9, 20) });
    expect(cobrancas).toHaveLength(2);
    expect(cobrancas[0].valorAluguel + cobrancas[1].valorAluguel).toBe(130_000);
  });

  it("aluguel antecipado vence no próprio mês, nunca antes do início", () => {
    const cobrancas = gerarCobrancas({ ...base, aluguelAntecipado: true, dataInicio: utcDate(2026, 9, 15) });
    expect(toISODate(cobrancas[0].vencimento)).toBe("2026-09-15");
    expect(toISODate(cobrancas[1].vencimento)).toBe("2026-10-10");
  });

  it("retorna vazio para prazo inválido", () => {
    expect(gerarCobrancas({ ...base, prazoMeses: 0, dataInicio: utcDate(2026, 1, 1) })).toEqual([]);
  });
});

describe("calcularVencimento", () => {
  it("aluguel vencido paga no mês seguinte", () => {
    const venc = calcularVencimento(utcDate(2026, 12, 1), 5, false, utcDate(2026, 1, 1));
    expect(toISODate(venc)).toBe("2027-01-05");
  });
});
