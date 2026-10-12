import { z } from "zod";
import { dataISO, texto } from "@/lib/form";

export const despesaSchema = z.object({
  imovelId: z.string().nullable(),
  manutencaoId: z.string().nullable().optional(),
  categoriaId: z.string().min(1, "Selecione uma categoria."),
  data: dataISO,
  valor: z.number().int().positive("Informe um valor maior que zero."),
  fornecedor: texto(150),
  descricao: texto(500),
  pago: z.boolean(),
});

export type DespesaInput = z.infer<typeof despesaSchema>;
