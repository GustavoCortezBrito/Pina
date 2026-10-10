import { z } from "zod";
import { Prioridade } from "@/generated/prisma/enums";
import { texto } from "@/lib/form";

export const manutencaoSchema = z.object({
  imovelId: z.string().min(1, "Selecione um imóvel."),
  titulo: z.string().trim().min(2, "Descreva o chamado.").max(150),
  descricao: texto(1000),
  prioridade: z.enum(Prioridade),
});

export type ManutencaoInput = z.infer<typeof manutencaoSchema>;
