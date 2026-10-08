"use server";

import { z } from "zod";
import { runAction } from "@/lib/action";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { requireAdmin } from "@/lib/session";
import { saveSettings } from "@/lib/settings";
import { financeiroSchema, locadorSchema, type Financeiro, type Locador } from "./schemas";

export async function salvarLocador(input: unknown) {
  return runAction(
    async () => {
      await requireAdmin();
      await saveSettings("locador", locadorSchema.parse(input) as Locador);
    },
    { message: "Dados do locador salvos." },
  );
}

export async function salvarFinanceiro(input: unknown) {
  return runAction(
    async () => {
      await requireAdmin();
      await saveSettings("financeiro", financeiroSchema.parse(input) as Financeiro);
    },
    { message: "Parâmetros financeiros salvos." },
  );
}

const categoriaSchema = z.object({ nome: z.string().trim().min(2).max(60) });

export async function criarCategoriaDespesa(input: unknown) {
  return runAction(
    async () => {
      await requireAdmin();
      const { nome } = categoriaSchema.parse(input);
      const existente = await db.categoriaDespesa.findUnique({ where: { nome } });
      if (existente) throw new AppError("Já existe uma categoria com esse nome.");
      await db.categoriaDespesa.create({ data: { nome } });
    },
    { message: "Categoria criada." },
  );
}

export async function alternarCategoriaDespesa(id: string, ativo: boolean) {
  return runAction(
    async () => {
      await requireAdmin();
      await db.categoriaDespesa.update({ where: { id: z.string().min(1).parse(id) }, data: { ativo } });
    },
    { message: "Categoria atualizada." },
  );
}

const modeloSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  finalidade: z.enum(["RESIDENCIAL", "COMERCIAL"]),
  conteudo: z.string().trim().min(10),
});

export async function salvarModeloContrato(id: string | null, input: unknown) {
  return runAction(
    async () => {
      await requireAdmin();
      const dados = modeloSchema.parse(input);
      if (id) {
        await db.modeloContrato.update({ where: { id }, data: dados });
      } else {
        await db.modeloContrato.create({ data: dados });
      }
    },
    { message: "Modelo de contrato salvo." },
  );
}

export async function excluirModeloContrato(id: string) {
  return runAction(
    async () => {
      await requireAdmin();
      const modeloId = z.string().min(1).parse(id);
      const emUso = await db.contrato.count({ where: { modeloId } });
      if (emUso > 0) throw new AppError("Este modelo está em uso por contratos e não pode ser excluído.");
      await db.modeloContrato.delete({ where: { id: modeloId } });
    },
    { message: "Modelo excluído." },
  );
}
