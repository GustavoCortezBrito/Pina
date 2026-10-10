"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { Finalidade } from "@/generated/prisma/enums";
import { runAction } from "@/lib/action";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { detectFileType } from "@/lib/images";
import { requireAdmin } from "@/lib/session";
import { saveSettings } from "@/lib/settings";
import { storage } from "@/lib/storage";
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
      await db.categoriaDespesa.update({
        where: { id: z.string().min(1).parse(id) },
        data: { ativo },
      });
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

const MAX_ARQUIVO_MODELO = 25 * 1024 * 1024;

/** Cria um modelo a partir de um arquivo pronto (docx/pdf/...), sem substituição de variáveis. */
export async function criarModeloArquivo(formData: FormData) {
  return runAction(
    async () => {
      const user = await requireAdmin();
      const nome = z.string().trim().min(2).max(120).parse(formData.get("nome"));
      const finalidade = z.enum(Finalidade).parse(formData.get("finalidade"));
      const arquivo = formData.get("arquivo");
      if (!(arquivo instanceof File)) throw new AppError("Selecione um arquivo.");

      const buffer = Buffer.from(await arquivo.arrayBuffer());
      const tipo = detectFileType(buffer, arquivo.name);
      if (!tipo || tipo.kind === "heic" || tipo.kind === "image") {
        throw new AppError("Envie um PDF ou um documento do Word/Excel (docx, doc, xlsx, xls, odt).");
      }
      if (buffer.byteLength > MAX_ARQUIVO_MODELO) throw new AppError("O arquivo passa de 25 MB.");

      const modelo = await db.modeloContrato.create({ data: { nome, finalidade, conteudo: null } });

      const extensao = tipo.kind === "pdf" ? "pdf" : (arquivo.name.split(".").pop()?.toLowerCase() ?? "bin");
      const caminho = `modelo-contrato/${modelo.id}/${randomUUID()}.${extensao}`;
      await storage.save(caminho, buffer);
      await db.arquivo.create({
        data: {
          categoria: "DOCUMENTO",
          nomeOriginal: arquivo.name.slice(0, 200),
          caminho,
          mime: tipo.mime,
          tamanho: buffer.byteLength,
          modeloContratoId: modelo.id,
          enviadoPorId: user.id,
        },
      });

      return { id: modelo.id };
    },
    { message: "Modelo enviado." },
  );
}

export async function definirModeloPadrao(id: string) {
  return runAction(
    async () => {
      await requireAdmin();
      const modeloId = z.string().min(1).parse(id);
      const modelo = await db.modeloContrato.findUnique({ where: { id: modeloId } });
      if (!modelo) throw new AppError("Modelo não encontrado.");

      await db.$transaction([
        db.modeloContrato.updateMany({
          where: { finalidade: modelo.finalidade, padrao: true },
          data: { padrao: false },
        }),
        db.modeloContrato.update({ where: { id: modeloId }, data: { padrao: true } }),
      ]);
    },
    { message: "Modelo definido como padrão." },
  );
}

export async function excluirModeloContrato(id: string) {
  return runAction(
    async () => {
      await requireAdmin();
      const modeloId = z.string().min(1).parse(id);
      const emUso = await db.contrato.count({ where: { modeloId } });
      if (emUso > 0)
        throw new AppError("Este modelo está em uso por contratos e não pode ser excluído.");

      const arquivos = await db.arquivo.findMany({ where: { modeloContratoId: modeloId } });
      await db.modeloContrato.delete({ where: { id: modeloId } });
      await Promise.all(arquivos.map((a) => storage.remove(a.caminho).catch(() => undefined)));
    },
    { message: "Modelo excluído." },
  );
}
