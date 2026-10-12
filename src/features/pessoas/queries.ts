import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { PapelPessoa } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

export const PESSOAS_POR_PAGINA = 15;

export async function opcoesPessoas(papel?: PapelPessoa) {
  const pessoas = await db.pessoa.findMany({
    where: { deletadoEm: null, ...(papel ? { papeis: { has: papel } } : {}) },
    select: { id: true, nome: true, documento: true },
    orderBy: { nome: "asc" },
  });
  return pessoas.map((p) => ({ value: p.id, label: p.nome, description: p.documento }));
}

export type FiltrosPessoa = { q?: string; papel?: PapelPessoa; page?: number };

export async function listarPessoas(filtros: FiltrosPessoa) {
  const page = Math.max(1, filtros.page ?? 1);
  const termo = filtros.q?.trim();

  const where: Prisma.PessoaWhereInput = {
    deletadoEm: null,
    papeis: filtros.papel ? { has: filtros.papel } : undefined,
    ...(termo
      ? {
          OR: [
            { nome: { contains: termo, mode: "insensitive" } },
            { documento: { contains: termo, mode: "insensitive" } },
            { email: { contains: termo, mode: "insensitive" } },
            { telefone1: { contains: termo, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [itens, total] = await Promise.all([
    db.pessoa.findMany({
      where,
      orderBy: { nome: "asc" },
      include: { arquivos: { where: { categoria: "FOTO_PERFIL" }, select: { id: true }, take: 1 } },
      skip: (page - 1) * PESSOAS_POR_PAGINA,
      take: PESSOAS_POR_PAGINA,
    }),
    db.pessoa.count({ where }),
  ]);

  return { itens, total, page, pageCount: Math.max(1, Math.ceil(total / PESSOAS_POR_PAGINA)) };
}

export async function obterPessoa(id: string) {
  const [pessoa, foto] = await Promise.all([
    obterPessoaBase(id),
    db.arquivo.findFirst({ where: { pessoaId: id, categoria: "FOTO_PERFIL" }, select: { id: true } }),
  ]);
  return pessoa ? { ...pessoa, fotoPerfilId: foto?.id ?? null } : null;
}

async function obterPessoaBase(id: string) {
  return db.pessoa.findFirst({
    where: { id, deletadoEm: null },
    include: {
      arquivos: { where: { categoria: { not: "FOTO_PERFIL" } }, orderBy: { criadoEm: "desc" } },
      imoveis: { select: { id: true, codigo: true, titulo: true } },
      contratos: {
        include: {
          contrato: {
            include: { imovel: { select: { id: true, codigo: true, titulo: true } } },
          },
        },
        orderBy: { contrato: { dataInicio: "desc" } },
      },
    },
  });
}

export type PessoaDetalhe = NonNullable<Awaited<ReturnType<typeof obterPessoa>>>;
