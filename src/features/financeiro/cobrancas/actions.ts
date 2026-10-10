"use server";

import { z } from "zod";
import { calcularEncargos, statusPorPagamentos } from "@/features/financeiro/services/encargos";
import { runAction } from "@/lib/action";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { parseISODate } from "@/lib/dates";
import { AppError } from "@/lib/errors";
import { requireUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";

const registrarPagamentoSchema = z.object({
  cobrancaId: z.string().min(1),
  dataPagamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  forma: z.enum(["PIX", "DINHEIRO", "TRANSFERENCIA", "BOLETO", "CARTAO", "OUTRO"]),
  observacao: z.string().trim().max(300).optional(),
});

export async function registrarPagamento(input: unknown) {
  return runAction(
    async () => {
      const user = await requireUser();
      const dados = registrarPagamentoSchema.parse(input);
      const dataPagamento = parseISODate(dados.dataPagamento);
      if (!dataPagamento) throw new AppError("Data de pagamento inválida.");

      const cobranca = await db.cobranca.findUnique({
        where: { id: dados.cobrancaId },
        include: { pagamentos: true },
      });
      if (!cobranca) throw new AppError("Cobrança não encontrada.");
      if (cobranca.status === "CANCELADO") throw new AppError("Esta cobrança está cancelada.");
      if (cobranca.status === "PAGO") throw new AppError("Esta cobrança já está paga.");

      const principalPago = cobranca.pagamentos.reduce((soma, p) => soma + p.valorPrincipal, 0);
      const saldo = cobranca.valorTotal - principalPago;
      if (saldo <= 0) throw new AppError("Não há saldo em aberto nesta cobrança.");

      const settings = await getSettings();
      const encargos = calcularEncargos({
        saldo,
        vencimento: cobranca.vencimento,
        dataPagamento,
        percMulta: Number(settings.financeiro.percMulta),
        percJurosMes: Number(settings.financeiro.percJurosMes),
        feriados: settings.feriados.municipais,
      });

      const pagamento = await db.$transaction(async (tx) => {
        const criado = await tx.pagamento.create({
          data: {
            cobrancaId: cobranca.id,
            dataPagamento,
            valorPrincipal: saldo,
            valorMulta: encargos.multa,
            valorJuros: encargos.juros,
            valorPago: saldo + encargos.multa + encargos.juros,
            forma: dados.forma,
            observacao: dados.observacao,
            registradoPorId: user.id,
          },
        });

        const novoStatus = statusPorPagamentos(cobranca.valorTotal, principalPago + saldo);
        await tx.cobranca.update({ where: { id: cobranca.id }, data: { status: novoStatus } });

        return criado;
      });

      await audit({
        usuarioId: user.id,
        acao: "RECEBER",
        entidade: "Cobranca",
        entidadeId: cobranca.id,
        dados: { pagamentoId: pagamento.id, valorPago: pagamento.valorPago },
      });

      return { pagamentoId: pagamento.id, cobrancaId: cobranca.id };
    },
    { message: "Pagamento registrado." },
  );
}
