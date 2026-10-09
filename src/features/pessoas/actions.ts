"use server";

import { z } from "zod";
import { runAction } from "@/lib/action";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { parseISODate } from "@/lib/dates";
import { nullIfEmpty } from "@/lib/form";
import { requireAdmin, requireUser } from "@/lib/session";
import { today } from "@/lib/dates";
import { normalizeDocumento } from "@/lib/validators";
import { pessoaSchema, type PessoaInput } from "./schemas";

function paraBanco(dados: PessoaInput) {
  return {
    tipo: dados.tipo,
    papeis: dados.papeis,
    nome: dados.nome,
    nomeFantasia: nullIfEmpty(dados.nomeFantasia),
    documento: normalizeDocumento(dados.documento),
    rg: nullIfEmpty(dados.rg),
    orgaoEmissor: nullIfEmpty(dados.orgaoEmissor),
    dataNascimento: parseISODate(dados.dataNascimento),
    estadoCivil: dados.estadoCivil || null,
    profissao: nullIfEmpty(dados.profissao),
    rendaMensal: dados.rendaMensal,
    email: nullIfEmpty(dados.email),
    telefone1: nullIfEmpty(dados.telefone1),
    telefone1Whats: dados.telefone1Whats,
    telefone2: nullIfEmpty(dados.telefone2),
    cep: nullIfEmpty(dados.cep),
    logradouro: nullIfEmpty(dados.logradouro),
    numero: nullIfEmpty(dados.numero),
    complemento: nullIfEmpty(dados.complemento),
    bairro: nullIfEmpty(dados.bairro),
    cidade: nullIfEmpty(dados.cidade),
    uf: dados.uf ? dados.uf.toUpperCase() : null,
    conjugeNome: nullIfEmpty(dados.conjugeNome),
    conjugeDocumento: nullIfEmpty(dados.conjugeDocumento),
    representanteNome: nullIfEmpty(dados.representanteNome),
    representanteDocumento: nullIfEmpty(dados.representanteDocumento),
    observacoes: nullIfEmpty(dados.observacoes),
  };
}

async function garantirDocumentoLivre(documento: string, ignorarId?: string) {
  const existente = await db.pessoa.findUnique({
    where: { documento: normalizeDocumento(documento) },
  });
  if (existente && existente.id !== ignorarId) {
    throw new AppError("Já existe uma pessoa cadastrada com esse CPF/CNPJ.");
  }
}

export async function criarPessoa(input: unknown) {
  return runAction(
    async () => {
      const user = await requireUser();
      const dados = pessoaSchema.parse(input);
      await garantirDocumentoLivre(dados.documento);

      const pessoa = await db.pessoa.create({ data: paraBanco(dados) });
      await audit({
        usuarioId: user.id,
        acao: "CREATE",
        entidade: "Pessoa",
        entidadeId: pessoa.id,
      });
      return { id: pessoa.id };
    },
    { message: "Pessoa cadastrada." },
  );
}

export async function atualizarPessoa(id: string, input: unknown) {
  return runAction(
    async () => {
      const user = await requireUser();
      const dados = pessoaSchema.parse(input);
      await garantirDocumentoLivre(dados.documento, id);

      await db.pessoa.update({ where: { id }, data: paraBanco(dados) });
      await audit({ usuarioId: user.id, acao: "UPDATE", entidade: "Pessoa", entidadeId: id });
      return { id };
    },
    { message: "Pessoa atualizada." },
  );
}

export async function excluirPessoa(id: string) {
  return runAction(
    async () => {
      const user = await requireAdmin();
      const pessoaId = z.string().min(1).parse(id);

      const vinculos = await db.contratoParte.count({ where: { pessoaId } });
      if (vinculos > 0) {
        throw new AppError("Esta pessoa está vinculada a contratos e não pode ser excluída.");
      }

      await db.pessoa.update({ where: { id: pessoaId }, data: { deletadoEm: today() } });
      await audit({ usuarioId: user.id, acao: "DELETE", entidade: "Pessoa", entidadeId: pessoaId });
    },
    { message: "Pessoa excluída." },
  );
}
