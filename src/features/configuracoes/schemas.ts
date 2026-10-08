import { z } from "zod";
import { IndiceReajuste } from "@/generated/prisma/enums";

export const locadorSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do locador."),
  documento: z.string().trim(),
  endereco: z.string().trim(),
  cidade: z.string().trim(),
  telefone: z.string().trim(),
  email: z.union([z.literal(""), z.email("E-mail inválido.")]),
  chavePix: z.string().trim(),
});

export const financeiroSchema = z.object({
  percMulta: z.number().min(0).max(20, "A multa não pode passar de 20%."),
  percJurosMes: z.number().min(0).max(10, "Juros acima de 10% ao mês não são permitidos."),
  diaVencimento: z.number().int().min(1).max(31),
  indiceReajuste: z.enum(IndiceReajuste),
  aluguelAntecipado: z.boolean(),
  multaRescisoriaMeses: z.number().int().min(0).max(12),
  prazoPadraoMeses: z.number().int().min(1).max(120),
});

export const feriadosSchema = z.object({
  municipais: z.array(z.string().regex(/^\d{2}-\d{2}$/, "Use o formato MM-DD.")),
});

export type Locador = z.infer<typeof locadorSchema>;
export type Financeiro = z.infer<typeof financeiroSchema>;
export type Feriados = z.infer<typeof feriadosSchema>;

export type Settings = {
  locador: Locador;
  financeiro: Financeiro;
  feriados: Feriados;
};

export const DEFAULT_SETTINGS: Settings = {
  locador: {
    nome: "Pina's Empreendimentos",
    documento: "",
    endereco: "",
    cidade: "Barretos/SP",
    telefone: "",
    email: "",
    chavePix: "",
  },
  financeiro: {
    percMulta: 10,
    percJurosMes: 1,
    diaVencimento: 10,
    indiceReajuste: "IGPM",
    aluguelAntecipado: false,
    multaRescisoriaMeses: 3,
    prazoPadraoMeses: 30,
  },
  feriados: { municipais: [] },
};

export const SETTINGS_SCHEMAS = {
  locador: locadorSchema,
  financeiro: financeiroSchema,
  feriados: feriadosSchema,
} as const;

export type SettingsKey = keyof Settings;
