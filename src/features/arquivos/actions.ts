"use server";

import { z } from "zod";
import { runAction } from "@/lib/action";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { requireUser } from "@/lib/session";
import { storage } from "@/lib/storage";

const idSchema = z.string().min(1);

export async function definirCapa(arquivoId: string) {
  return runAction(
    async () => {
      await requireUser();
      const id = idSchema.parse(arquivoId);
      const arquivo = await db.arquivo.findUnique({ where: { id } });
      if (!arquivo?.imovelId) throw new AppError("Só é possível definir capa em fotos de imóveis.");

      await db.$transaction([
        db.arquivo.updateMany({
          where: { imovelId: arquivo.imovelId, capa: true },
          data: { capa: false },
        }),
        db.arquivo.update({ where: { id }, data: { capa: true } }),
      ]);
    },
    { message: "Foto de capa atualizada." },
  );
}

export async function moverArquivo(arquivoId: string, direcao: "anterior" | "proximo") {
  return runAction(
    async () => {
      await requireUser();
      const id = idSchema.parse(arquivoId);
      const arquivo = await db.arquivo.findUnique({ where: { id } });
      if (!arquivo) throw new AppError("Arquivo não encontrado.");

      const vizinho = await db.arquivo.findFirst({
        where: {
          imovelId: arquivo.imovelId,
          pessoaId: arquivo.pessoaId,
          contratoId: arquivo.contratoId,
          categoria: arquivo.categoria,
          ordem: direcao === "anterior" ? { lt: arquivo.ordem } : { gt: arquivo.ordem },
        },
        orderBy: { ordem: direcao === "anterior" ? "desc" : "asc" },
      });
      if (!vizinho) return;

      await db.$transaction([
        db.arquivo.update({ where: { id: arquivo.id }, data: { ordem: vizinho.ordem } }),
        db.arquivo.update({ where: { id: vizinho.id }, data: { ordem: arquivo.ordem } }),
      ]);
    },
    { message: "Ordem das fotos atualizada." },
  );
}

export async function atualizarLegenda(arquivoId: string, legenda: string) {
  return runAction(
    async () => {
      await requireUser();
      const id = idSchema.parse(arquivoId);
      const texto = z.string().max(200).parse(legenda).trim();
      await db.arquivo.update({ where: { id }, data: { legenda: texto || null } });
    },
    { message: "Legenda salva." },
  );
}

export async function excluirArquivo(arquivoId: string) {
  return runAction(
    async () => {
      await requireUser();
      const id = idSchema.parse(arquivoId);
      const arquivo = await db.arquivo.findUnique({ where: { id } });
      if (!arquivo) throw new AppError("Arquivo não encontrado.");

      await db.arquivo.delete({ where: { id } });
      await storage.remove(arquivo.caminho).catch(() => undefined);
      if (arquivo.caminhoThumb) await storage.remove(arquivo.caminhoThumb).catch(() => undefined);

      // Se a capa saiu, promove a primeira foto restante.
      if (arquivo.capa && arquivo.imovelId) {
        const proxima = await db.arquivo.findFirst({
          where: { imovelId: arquivo.imovelId, categoria: "FOTO" },
          orderBy: { ordem: "asc" },
        });
        if (proxima) await db.arquivo.update({ where: { id: proxima.id }, data: { capa: true } });
      }
    },
    { message: "Arquivo excluído." },
  );
}
