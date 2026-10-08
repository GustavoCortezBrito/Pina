import { describe, expect, it } from "vitest";
import {
  calcularNovoValor,
  proximoReajuste,
  recalcularCobranca,
} from "@/features/contratos/services/reajuste";
import { calcularMultaRescisoria, isRescisao } from "@/features/contratos/services/rescisao";
import {
  calcularEncargos,
  statusEfetivo,
  statusPorPagamentos,
} from "@/features/financeiro/services/encargos";
import { toISODate, utcDate } from "@/lib/dates";

describe("calcularEncargos", () => {
  const base = { saldo: 130_000, percMulta: 10, percJurosMes: 1 };

  it("não cobra nada até o vencimento", () => {
    const r = calcularEncargos({ ...base, vencimento: utcDate(2026, 10, 9), dataPagamento: utcDate(2026, 10, 9) });
    expect(r).toMatchObject({ diasAtraso: 0, multa: 0, juros: 0 });
  });

  it("vencimento no sábado pode ser pago na segunda sem encargos", () => {
    // 10/10/2026 é sábado; 12/10 é feriado (N. Sra. Aparecida) → limite 13/10
    const r = calcularEncargos({ ...base, vencimento: utcDate(2026, 10, 10), dataPagamento: utcDate(2026, 10, 13) });
    expect(toISODate(r.limite)).toBe("2026-10-13");
    expect(r.multa).toBe(0);
  });

  it("aplica multa única e juros pró-rata dia", () => {
    const r = calcularEncargos({ ...base, vencimento: utcDate(2026, 11, 10), dataPagamento: utcDate(2026, 11, 25) });
    expect(r.diasAtraso).toBe(15);
    expect(r.multa).toBe(13_000); // 10%
    expect(r.juros).toBe(650); // 1% × 15/30
  });

  it("respeita feriados municipais configurados", () => {
    const r = calcularEncargos({
      ...base,
      vencimento: utcDate(2026, 8, 25),
      dataPagamento: utcDate(2026, 8, 26),
      feriados: ["08-25"],
    });
    expect(r.multa).toBe(0);
  });
});

describe("status das cobranças", () => {
  it("calcula o status pelo principal pago", () => {
    expect(statusPorPagamentos(1000, 0)).toBe("PENDENTE");
    expect(statusPorPagamentos(1000, 400)).toBe("PAGO_PARCIAL");
    expect(statusPorPagamentos(1000, 1000)).toBe("PAGO");
  });

  it("atrasado é derivado do vencimento", () => {
    const venc = utcDate(2026, 9, 10); // quinta-feira
    expect(statusEfetivo("PENDENTE", venc, utcDate(2026, 9, 10))).toBe("PENDENTE");
    expect(statusEfetivo("PENDENTE", venc, utcDate(2026, 9, 11))).toBe("ATRASADO");
    expect(statusEfetivo("PAGO_PARCIAL", venc, utcDate(2026, 9, 11))).toBe("ATRASADO");
    expect(statusEfetivo("PAGO", venc, utcDate(2026, 9, 30))).toBe("PAGO");
  });
});

describe("reajuste", () => {
  it("aplica percentual com 4 casas", () => {
    expect(calcularNovoValor(130_000, 4.35)).toBe(135_655);
    expect(calcularNovoValor(130_000, 3.8912)).toBe(135_059);
    expect(calcularNovoValor(100_000, -1.5)).toBe(98_500);
  });

  it("calcula a data do próximo reajuste", () => {
    const params = { dataInicio: utcDate(2026, 9, 15), dataFim: utcDate(2029, 3, 14), indice: "IGPM" as const };
    expect(toISODate(proximoReajuste({ ...params, reajustesAplicados: 0 })!)).toBe("2027-09-15");
    expect(toISODate(proximoReajuste({ ...params, reajustesAplicados: 1 })!)).toBe("2028-09-15");
    expect(proximoReajuste({ ...params, reajustesAplicados: 2 })).toBeNull();
    expect(proximoReajuste({ ...params, indice: "NENHUM", reajustesAplicados: 0 })).toBeNull();
  });

  it("recalcula cobrança proporcional mantendo encargos e desconto", () => {
    const r = recalcularCobranca(
      { periodoInicio: utcDate(2026, 9, 16), periodoFim: utcDate(2026, 9, 30), valorEncargos: 5_000, desconto: 1_000 },
      140_000,
    );
    expect(r.valorAluguel).toBe(70_000);
    expect(r.valorTotal).toBe(74_000);
  });
});

describe("rescisão", () => {
  it("reduz a multa na proporção do tempo cumprido", () => {
    const r = calcularMultaRescisoria({
      valorAluguel: 100_000,
      multaMeses: 3,
      dataInicio: utcDate(2026, 1, 1),
      dataFim: utcDate(2026, 12, 31),
      dataSaida: utcDate(2026, 7, 2),
    });
    expect(r.diasTotais).toBe(365);
    expect(r.diasRestantes).toBe(182);
    expect(r.multaIntegral).toBe(300_000);
    expect(r.multa).toBe(149_589);
  });

  it("não há multa na data final", () => {
    const params = { valorAluguel: 100_000, multaMeses: 3, dataInicio: utcDate(2026, 1, 1), dataFim: utcDate(2026, 12, 31) };
    expect(calcularMultaRescisoria({ ...params, dataSaida: utcDate(2026, 12, 31) }).multa).toBe(0);
    expect(isRescisao(utcDate(2026, 12, 31), params.dataFim)).toBe(false);
    expect(isRescisao(utcDate(2026, 6, 1), params.dataFim)).toBe(true);
  });
});
