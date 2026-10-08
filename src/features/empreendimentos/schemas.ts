import { z } from "zod";
import { texto } from "@/lib/form";

export const empreendimentoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do empreendimento.").max(120),
  cep: z.string().max(8),
  logradouro: texto(200),
  numero: texto(20),
  bairro: texto(100),
  cidade: texto(100),
  uf: texto(2),
  observacoes: texto(1000),
});

export type EmpreendimentoInput = z.infer<typeof empreendimentoSchema>;

export const EMPREENDIMENTO_VAZIO: EmpreendimentoInput = {
  nome: "",
  cep: "",
  logradouro: "",
  numero: "",
  bairro: "",
  cidade: "Barretos",
  uf: "SP",
  observacoes: "",
};
