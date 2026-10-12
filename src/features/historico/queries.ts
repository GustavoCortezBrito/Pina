import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { formatNumeroContrato } from "@/lib/format";

export const TAMANHOS_PAGINA = [10, 25, 50, 100] as const;
export const HISTORICO_POR_PAGINA = 25;

export type FiltrosHistorico = {
  usuarioId?: string;
  entidade?: string;
  acao?: string;
  de?: string;
  ate?: string;
  porPagina?: number;
  page?: number;
};

type Alvo = { rotulo: string; href?: string };

function lerDia(valor?: string) {
  if (!valor || !/^d{4}-d{2}-d{2}$/.test(valor)) return undefined;
  const [a, m, d] = valor.split("-").map(Number);
  return new Date(a, m - 1, d);
}

function intervalo(de?: string, ate?: string) {
  const inicio = lerDia(de);
  const fim = lerDia(ate);
  if (!inicio && !fim) return undefined;
  return { gte: inicio, lt: fim ? new Date(fim.getFullYear(), fim.getMonth(), fim.getDate() + 1) : undefined };
}

export async function listarHistorico(filtros: FiltrosHistorico) {
  const page = Math.max(1, filtros.page ?? 1);
  const criadoEm = intervalo(filtros.de, filtros.ate);
  const porPagina = (TAMANHOS_PAGINA as readonly number[]).includes(filtros.porPagina ?? 0)
    ? (filtros.porPagina as number)
    : HISTORICO_POR_PAGINA;

  const where: Prisma.AuditLogWhereInput = {
    usuarioId: filtros.usuarioId || undefined,
    entidade: filtros.entidade || undefined,
    acao: filtros.acao || undefined,
    criadoEm,
  };
  // Logins só aparecem quando o filtro de ação pede explicitamente — senão poluem a trilha.
  if (!filtros.acao) where.acao = { not: "LOGIN" };

  const [registros, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      skip: (page - 1) * porPagina,
      take: porPagina,
      include: { usuario: { select: { id: true, name: true, role: true, image: true } } },
    }),
    db.auditLog.count({ where }),
  ]);

  const idsPor = (entidade: string) =>
    registros.filter((r) => r.entidade === entidade && r.entidadeId).map((r) => r.entidadeId as string);

  const [imoveis, contratos, pessoas, empreendimentos, manutencoes, despesas, cobrancas, usuarios] =
    await Promise.all([
      db.imovel.findMany({ where: { id: { in: idsPor("Imovel") } }, select: { id: true, codigo: true, titulo: true } }),
      db.contrato.findMany({ where: { id: { in: idsPor("Contrato") } }, select: { id: true, numero: true } }),
      db.pessoa.findMany({ where: { id: { in: idsPor("Pessoa") } }, select: { id: true, nome: true } }),
      db.empreendimento.findMany({ where: { id: { in: idsPor("Empreendimento") } }, select: { id: true, nome: true } }),
      db.manutencao.findMany({ where: { id: { in: idsPor("Manutencao") } }, select: { id: true, titulo: true, imovelId: true } }),
      db.despesa.findMany({ where: { id: { in: idsPor("Despesa") } }, select: { id: true, descricao: true, fornecedor: true } }),
      db.cobranca.findMany({
        where: { id: { in: idsPor("Cobranca") } },
        select: { id: true, contratoId: true, competencia: true, contrato: { select: { imovel: { select: { codigo: true } } } } },
      }),
      db.user.findMany({ where: { id: { in: idsPor("User") } }, select: { id: true, name: true } }),
    ]);

  const alvos = new Map<string, Alvo>();
  const chave = (entidade: string, id: string) => `${entidade}:${id}`;
  imoveis.forEach((i) => alvos.set(chave("Imovel", i.id), { rotulo: `${i.codigo} · ${i.titulo}`, href: `/imoveis/${i.id}` }));
  contratos.forEach((c) => alvos.set(chave("Contrato", c.id), { rotulo: `nº ${formatNumeroContrato(c.numero)}`, href: `/contratos/${c.id}` }));
  pessoas.forEach((p) => alvos.set(chave("Pessoa", p.id), { rotulo: p.nome, href: `/pessoas/${p.id}` }));
  empreendimentos.forEach((e) => alvos.set(chave("Empreendimento", e.id), { rotulo: e.nome, href: `/empreendimentos/${e.id}` }));
  manutencoes.forEach((m) => alvos.set(chave("Manutencao", m.id), { rotulo: m.titulo, href: `/imoveis/${m.imovelId}` }));
  despesas.forEach((d) => alvos.set(chave("Despesa", d.id), { rotulo: d.descricao || d.fornecedor || "sem descrição" }));
  cobrancas.forEach((c) =>
    alvos.set(chave("Cobranca", c.id), {
      rotulo: `${c.contrato.imovel.codigo} · ${c.competencia.toISOString().slice(0, 7).split("-").reverse().join("/")}`,
      href: `/financeiro/cobrancas/${c.contratoId}`,
    }),
  );
  usuarios.forEach((u) => alvos.set(chave("User", u.id), { rotulo: u.name }));

  const itens = registros.map((r) => {
    const dados = (r.dados ?? null) as Record<string, unknown> | null;
    const alvo = r.entidadeId ? alvos.get(chave(r.entidade, r.entidadeId)) : undefined;
    const nomeSalvo = typeof dados?.nome === "string" ? dados.nome : undefined;
    return {
      id: r.id,
      acao: r.acao,
      entidade: r.entidade,
      criadoEm: r.criadoEm,
      usuario: r.usuario,
      alvo: alvo ?? (nomeSalvo ? { rotulo: nomeSalvo } : r.entidade === "Configuracao" ? { rotulo: String(r.entidadeId) } : undefined),
      removido: !alvo && r.acao === "DELETE",
      dados,
    };
  });

  return { itens, total, page, porPagina, pageCount: Math.max(1, Math.ceil(total / porPagina)) };
}

export async function usuariosParaFiltro() {
  return db.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
}
