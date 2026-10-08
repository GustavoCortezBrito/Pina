import { z } from "zod";
import { Finalidade, IndiceReajuste, TipoGarantia } from "@/generated/prisma/enums";
import { dataISO, texto } from "@/lib/form";

export const contratoEncargoSchema = z.object({
  descricao: z.string().trim().min(1).max(60),
  valor: z.number().int().min(0),
});

export const contratoSchema = z.object({
  imovelId: z.string().min(1, "Selecione um imóvel."),
  finalidade: z.enum(Finalidade),

  locatarioId: z.string().min(1, "Selecione o locatário."),
  fiadorId: z.string().nullable(),

  garantia: z.enum(TipoGarantia),
  caucaoValor: z.number().int().min(0).nullable(),
  seguradora: texto(100),
  apolice: texto(60),

  dataInicio: dataISO,
  prazoMeses: z.number().int().min(1).max(120),
  valorAluguel: z.number().int().positive("Informe o valor do aluguel."),
  diaVencimento: z.number().int().min(1).max(31),
  aluguelAntecipado: z.boolean(),
  indiceReajuste: z.enum(IndiceReajuste),
  encargos: z.array(contratoEncargoSchema).max(10),
  observacoes: texto(2000),
});

export type ContratoInput = z.infer<typeof contratoSchema>;
