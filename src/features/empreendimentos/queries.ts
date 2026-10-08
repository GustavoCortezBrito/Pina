import "server-only";
import { db } from "@/lib/db";

export async function listarEmpreendimentos() {
  const empreendimentos = await db.empreendimento.findMany({
    orderBy: { nome: "asc" },
    include: {
      imoveis: {
        where: { deletadoEm: null },
        select: { id: true, status: true },
      },
    },
  });

  return empreendimentos.map((empreendimento) => {
    const unidades = empreendimento.imoveis.length;
    const alugadas = empreendimento.imoveis.filter((imovel) => imovel.status === "ALUGADO").length;
    return {
      ...empreendimento,
      unidades,
      alugadas,
      vagas: empreendimento.imoveis.filter((imovel) => imovel.status === "DISPONIVEL").length,
      ocupacao: unidades ? Math.round((alugadas / unidades) * 100) : 0,
    };
  });
}

export async function obterEmpreendimento(id: string) {
  return db.empreendimento.findUnique({
    where: { id },
    include: {
      imoveis: {
        where: { deletadoEm: null },
        orderBy: { codigo: "asc" },
        include: {
          arquivos: { where: { capa: true }, select: { id: true }, take: 1 },
          contratos: {
            where: { status: "ATIVO" },
            take: 1,
            select: {
              partes: {
                where: { papel: "LOCATARIO" },
                orderBy: { principal: "desc" },
                take: 1,
                select: { pessoa: { select: { id: true, nome: true } } },
              },
            },
          },
        },
      },
    },
  });
}

export async function opcoesEmpreendimentos() {
  const empreendimentos = await db.empreendimento.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, bairro: true, cidade: true },
  });
  return empreendimentos.map((e) => ({
    value: e.id,
    label: e.nome,
    description: [e.bairro, e.cidade].filter(Boolean).join(", "),
  }));
}
