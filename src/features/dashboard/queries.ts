import "server-only";
import { proximoReajuste } from "@/features/contratos/services/reajuste";
import { db } from "@/lib/db";
import { addDays, diffDays, endOfMonth, startOfMonth, today } from "@/lib/dates";

const LIMITE_LISTAS = 6;

export async function resumoDashboard() {
  const hoje = today();
  const inicioMes = startOfMonth(hoje);
  const fimMes = addDays(endOfMonth(hoje), 1);

  const [porStatus, recebidoMes, cobrancasAbertas] = await Promise.all([
    db.imovel.groupBy({ by: ["status"], where: { deletadoEm: null }, _count: true }),
    db.pagamento.aggregate({
      where: { dataPagamento: { gte: inicioMes, lt: fimMes } },
      _sum: { valorPago: true },
    }),
    db.cobranca.findMany({
      where: { status: { in: ["PENDENTE", "PAGO_PARCIAL"] } },
      select: { valorTotal: true, vencimento: true, competencia: true, pagamentos: { select: { valorPrincipal: true } } },
    }),
  ]);

  const contagem = Object.fromEntries(porStatus.map((p) => [p.status, p._count]));
  const totalUnidades = porStatus.reduce((soma, p) => soma + p._count, 0);

  let aReceberMes = 0;
  let emAtrasoValor = 0;
  let emAtrasoQtde = 0;
  for (const cobranca of cobrancasAbertas) {
    const saldo = cobranca.valorTotal - cobranca.pagamentos.reduce((s, p) => s + p.valorPrincipal, 0);
    if (cobranca.competencia >= inicioMes && cobranca.competencia < fimMes) aReceberMes += saldo;
    if (cobranca.vencimento < hoje) {
      emAtrasoValor += saldo;
      emAtrasoQtde++;
    }
  }

  return {
    totalUnidades,
    ocupadas: contagem.ALUGADO ?? 0,
    vagas: contagem.DISPONIVEL ?? 0,
    emReforma: contagem.EM_REFORMA ?? 0,
    recebidoMes: recebidoMes._sum.valorPago ?? 0,
    aReceberMes,
    emAtrasoValor,
    emAtrasoQtde,
  };
}

export async function cobrancasAtrasadas() {
  const hoje = today();
  const cobrancas = await db.cobranca.findMany({
    where: { status: { in: ["PENDENTE", "PAGO_PARCIAL"] }, vencimento: { lt: hoje } },
    orderBy: { vencimento: "asc" },
    take: LIMITE_LISTAS,
    include: {
      pagamentos: { select: { valorPrincipal: true } },
      contrato: {
        select: {
          imovel: { select: { codigo: true } },
          partes: { where: { papel: "LOCATARIO" }, take: 1, select: { pessoa: { select: { nome: true } } } },
        },
      },
    },
  });

  return cobrancas.map((c) => ({
    id: c.id,
    imovel: c.contrato.imovel.codigo,
    inquilino: c.contrato.partes[0]?.pessoa.nome ?? "—",
    diasAtraso: diffDays(hoje, c.vencimento),
    saldo: c.valorTotal - c.pagamentos.reduce((s, p) => s + p.valorPrincipal, 0),
  }));
}

export async function cobrancasVencendoEmBreve(dias = 7) {
  const hoje = today();
  const cobrancas = await db.cobranca.findMany({
    where: {
      status: { in: ["PENDENTE", "PAGO_PARCIAL"] },
      vencimento: { gte: hoje, lte: addDays(hoje, dias) },
    },
    orderBy: { vencimento: "asc" },
    take: LIMITE_LISTAS,
    include: {
      pagamentos: { select: { valorPrincipal: true } },
      contrato: {
        select: {
          imovel: { select: { codigo: true } },
          partes: { where: { papel: "LOCATARIO" }, take: 1, select: { pessoa: { select: { nome: true } } } },
        },
      },
    },
  });

  return cobrancas.map((c) => ({
    id: c.id,
    imovel: c.contrato.imovel.codigo,
    inquilino: c.contrato.partes[0]?.pessoa.nome ?? "—",
    vencimento: c.vencimento,
    saldo: c.valorTotal - c.pagamentos.reduce((s, p) => s + p.valorPrincipal, 0),
  }));
}

export async function contratosVencendoEmBreve(dias = 60) {
  const hoje = today();
  const contratos = await db.contrato.findMany({
    where: { status: "ATIVO", dataFim: { gte: hoje, lte: addDays(hoje, dias) } },
    orderBy: { dataFim: "asc" },
    take: LIMITE_LISTAS,
    select: {
      id: true,
      dataFim: true,
      imovel: { select: { codigo: true } },
      partes: { where: { papel: "LOCATARIO" }, take: 1, select: { pessoa: { select: { nome: true } } } },
    },
  });

  return contratos.map((c) => ({
    id: c.id,
    imovel: c.imovel.codigo,
    inquilino: c.partes[0]?.pessoa.nome ?? "—",
    dataFim: c.dataFim,
  }));
}

export async function reajustesProximos(dias = 30) {
  const hoje = today();
  const limite = addDays(hoje, dias);
  const contratos = await db.contrato.findMany({
    where: { status: "ATIVO" },
    select: {
      id: true,
      dataInicio: true,
      dataFim: true,
      indiceReajuste: true,
      imovel: { select: { codigo: true } },
      partes: { where: { papel: "LOCATARIO" }, take: 1, select: { pessoa: { select: { nome: true } } } },
      _count: { select: { reajustes: true } },
    },
  });

  return contratos
    .map((c) => ({
      id: c.id,
      imovel: c.imovel.codigo,
      inquilino: c.partes[0]?.pessoa.nome ?? "—",
      indice: c.indiceReajuste,
      data: proximoReajuste({
        dataInicio: c.dataInicio,
        dataFim: c.dataFim,
        indice: c.indiceReajuste,
        reajustesAplicados: c._count.reajustes,
      }),
    }))
    .filter((c): c is typeof c & { data: Date } => c.data != null && c.data <= limite)
    .sort((a, b) => a.data.getTime() - b.data.getTime())
    .slice(0, LIMITE_LISTAS);
}
