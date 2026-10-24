import { z } from "zod";
import { Finalidade, IndiceReajuste, TipoGarantia } from "@/generated/prisma/enums";
import { dataISO, dataISOOpcional, texto } from "@/lib/form";

export const contratoEncargoSchema = z.object({
  descricao: z.string().trim().min(1).max(60),
  valor: z.number().int().min(0),
});

export const ORIGENS_CONTRATO = ["NOVO", "EXISTENTE"] as const;

export const contratoSchema = z.object({
  /** NOVO: contrato feito pelo sistema. EXISTENTE: já assinado, cadastrado só para controle. */
  origem: z.enum(ORIGENS_CONTRATO),
  numeroOriginal: texto(40),
  /** Só para contrato existente: primeira competência a cobrar pelo sistema (meses anteriores ficam de fora). */
  primeiraCobranca: dataISOOpcional,
  reajustesAnteriores: z.number().int().min(0).max(30),
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
