import "server-only";
import { statusEfetivo } from "@/features/financeiro/services/encargos";
import { db } from "@/lib/db";
import { formatDate, today } from "@/lib/dates";
import { INDICE_REAJUSTE, STATUS_COBRANCA } from "@/lib/labels";
import { formatNumeroContrato } from "@/lib/format";
import { receitaDespesaPeriodo, resultadoPorImovel, type PeriodoResolvido } from "../queries";

export type TipoColuna = "texto" | "moeda" | "data" | "numero";
export type Coluna = { chave: string; titulo: string; tipo: TipoColuna; largura?: number };
export type Celula = string | number | Date | null;
export type Tabela = {
  titulo?: string;
  colunas: Coluna[];
  linhas: Array<Record<string, Celula>>;
  /** Linha de totais, somando estas colunas (moeda/numero). */
  somar?: string[];
};
export type Relatorio = { slug: string; titulo: string; subtitulo: string; tabelas: Tabela[] };

export const TIPOS_RELATORIO = [
  { slug: "resultado", titulo: "Resultado financeiro", descricao: "Receita × despesa por mês e por imóvel" },
  { slug: "cobrancas", titulo: "Cobranças em aberto", descricao: "Pendentes, parciais e atrasadas" },
  { slug: "contratos", titulo: "Contratos ativos", descricao: "Valores, prazos e índice de reajuste" },
  { slug: "despesas", titulo: "Despesas do período", descricao: "Gastos por categoria e imóvel" },
] as const;

export type ParamsRelatorio = { periodo: PeriodoResolvido; ano: number; imovelId?: string };

async function resultado({ periodo, ano, imovelId }: ParamsRelatorio): Promise<Relatorio> {
  const [mensal, porImovel] = await Promise.all([receitaDespesaPeriodo(periodo), resultadoPorImovel(ano, imovelId)]);
  return {
    slug: "resultado",
    titulo: "Resultado financeiro",
    subtitulo: `${periodo.rotulo} · resultado por imóvel de ${ano}`,
    tabelas: [
      {
        titulo: `Por mês (${periodo.rotulo})`,
        colunas: [
          { chave: "mes", titulo: "Mês", tipo: "texto", largura: 14 },
          { chave: "receita", titulo: "Receita", tipo: "moeda", largura: 16 },
          { chave: "despesa", titulo: "Despesa", tipo: "moeda", largura: 16 },
          { chave: "resultado", titulo: "Resultado", tipo: "moeda", largura: 16 },
        ],
        linhas: mensal.map((p) => ({ mes: p.mesLabel, receita: p.receita, despesa: p.despesa, resultado: p.receita - p.despesa })),
        somar: ["receita", "despesa", "resultado"],
      },
      {
        titulo: `Por imóvel (${ano})`,
        colunas: [
          { chave: "codigo", titulo: "Código", tipo: "texto", largura: 12 },
          { chave: "titulo", titulo: "Imóvel", tipo: "texto", largura: 34 },
          { chave: "receita", titulo: "Receita", tipo: "moeda", largura: 16 },
          { chave: "despesa", titulo: "Despesa", tipo: "moeda", largura: 16 },
          { chave: "resultado", titulo: "Resultado", tipo: "moeda", largura: 16 },
        ],
        linhas: porImovel.map((r) => ({ codigo: r.codigo, titulo: r.titulo, receita: r.receita, despesa: r.despesa, resultado: r.receita - r.despesa })),
        somar: ["receita", "despesa", "resultado"],
      },
    ],
  };
}

async function cobrancas({ imovelId }: ParamsRelatorio): Promise<Relatorio> {
  const hoje = today();
  const itens = await db.cobranca.findMany({
    where: { status: { in: ["PENDENTE", "PAGO_PARCIAL"] }, contrato: imovelId ? { imovelId } : undefined },
    orderBy: { vencimento: "asc" },
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
  return {
    slug: "cobrancas",
    titulo: "Cobranças em aberto",
    subtitulo: `Posição em ${formatDate(hoje)}`,
    tabelas: [
      {
        colunas: [
          { chave: "imovel", titulo: "Imóvel", tipo: "texto", largura: 12 },
          { chave: "inquilino", titulo: "Inquilino", tipo: "texto", largura: 30 },
          { chave: "competencia", titulo: "Competência", tipo: "data", largura: 14 },
          { chave: "vencimento", titulo: "Vencimento", tipo: "data", largura: 14 },
          { chave: "valor", titulo: "Valor", tipo: "moeda", largura: 15 },
          { chave: "saldo", titulo: "Saldo em aberto", tipo: "moeda", largura: 17 },
          { chave: "status", titulo: "Situação", tipo: "texto", largura: 14 },
        ],
        linhas: itens.map((c) => ({
          imovel: c.contrato.imovel.codigo,
          inquilino: c.contrato.partes[0]?.pessoa.nome ?? "—",
          competencia: c.competencia,
          vencimento: c.vencimento,
          valor: c.valorTotal,
          saldo: c.valorTotal - c.pagamentos.reduce((s, p) => s + p.valorPrincipal, 0),
          status: STATUS_COBRANCA[statusEfetivo(c.status, c.vencimento, hoje)].label,
        })),
        somar: ["valor", "saldo"],
      },
    ],
  };
}

async function contratos({ imovelId }: ParamsRelatorio): Promise<Relatorio> {
  const itens = await db.contrato.findMany({
    where: { status: "ATIVO", imovelId },
    orderBy: { numero: "asc" },
    include: {
      imovel: { select: { codigo: true, titulo: true } },
      partes: { where: { papel: "LOCATARIO" }, take: 1, select: { pessoa: { select: { nome: true } } } },
    },
  });
  return {
    slug: "contratos",
    titulo: "Contratos ativos",
    subtitulo: `${itens.length} contrato(s) em vigor`,
    tabelas: [
      {
        colunas: [
          { chave: "numero", titulo: "Nº", tipo: "texto", largura: 8 },
          { chave: "imovel", titulo: "Imóvel", tipo: "texto", largura: 30 },
          { chave: "inquilino", titulo: "Inquilino", tipo: "texto", largura: 28 },
          { chave: "inicio", titulo: "Início", tipo: "data", largura: 13 },
          { chave: "fim", titulo: "Fim", tipo: "data", largura: 13 },
          { chave: "aluguel", titulo: "Aluguel", tipo: "moeda", largura: 15 },
          { chave: "dia", titulo: "Dia venc.", tipo: "numero", largura: 11 },
          { chave: "indice", titulo: "Reajuste", tipo: "texto", largura: 16 },
        ],
        linhas: itens.map((c) => ({
          numero: formatNumeroContrato(c.numero),
          imovel: `${c.imovel.codigo} · ${c.imovel.titulo}`,
          inquilino: c.partes[0]?.pessoa.nome ?? "—",
          inicio: c.dataInicio,
          fim: c.dataFim,
          aluguel: c.valorAluguel,
          dia: c.diaVencimento,
          indice: INDICE_REAJUSTE[c.indiceReajuste],
        })),
        somar: ["aluguel"],
      },
    ],
  };
}

async function despesas({ ano, imovelId }: ParamsRelatorio): Promise<Relatorio> {
  const inicio = new Date(Date.UTC(ano, 0, 1));
  const fim = new Date(Date.UTC(ano + 1, 0, 1));
  const itens = await db.despesa.findMany({
    where: { data: { gte: inicio, lt: fim }, imovelId },
    orderBy: { data: "asc" },
    include: { categoria: { select: { nome: true } }, imovel: { select: { codigo: true } } },
  });
  return {
    slug: "despesas",
    titulo: "Despesas do período",
    subtitulo: `Ano de ${ano}`,
    tabelas: [
      {
        colunas: [
          { chave: "data", titulo: "Data", tipo: "data", largura: 13 },
          { chave: "categoria", titulo: "Categoria", tipo: "texto", largura: 20 },
          { chave: "imovel", titulo: "Imóvel", tipo: "texto", largura: 12 },
          { chave: "fornecedor", titulo: "Fornecedor", tipo: "texto", largura: 24 },
          { chave: "descricao", titulo: "Descrição", tipo: "texto", largura: 30 },
          { chave: "valor", titulo: "Valor", tipo: "moeda", largura: 15 },
          { chave: "pago", titulo: "Pago", tipo: "texto", largura: 8 },
        ],
        linhas: itens.map((d) => ({
          data: d.data,
          categoria: d.categoria.nome,
          imovel: d.imovel?.codigo ?? "—",
          fornecedor: d.fornecedor ?? "",
          descricao: d.descricao ?? "",
          valor: d.valor,
          pago: d.pago ? "Sim" : "Não",
        })),
        somar: ["valor"],
      },
    ],
  };
}

export async function construirRelatorio(slug: string, params: ParamsRelatorio): Promise<Relatorio | null> {
  switch (slug) {
    case "resultado":
      return resultado(params);
    case "cobrancas":
      return cobrancas(params);
    case "contratos":
      return contratos(params);
    case "despesas":
      return despesas(params);
    default:
      return null;
  }
}
