import { z } from "zod";
import { Mobilia, StatusImovel, TipoImovel } from "@/generated/prisma/enums";
import { texto } from "@/lib/form";

export const enderecoSchema = z.object({
  cep: z.string().max(8),
  logradouro: texto(200),
  numero: texto(20),
  complemento: texto(100),
  bairro: texto(100),
  cidade: texto(100),
  uf: texto(2),
});

export const imovelSchema = enderecoSchema.extend({
  codigo: z.string().trim().min(1, "Informe um código.").max(30),
  titulo: z.string().trim().min(2, "Informe o nome do imóvel.").max(120),
  tipo: z.enum(TipoImovel),
  status: z.enum(StatusImovel),
  empreendimentoId: z.string().nullable(),
  proprietarioId: z.string().nullable(),
  descricao: texto(2000),

  quartos: z.number().int().min(0).max(50),
  suites: z.number().int().min(0).max(50),
  banheiros: z.number().int().min(0).max(50),
  vagas: z.number().int().min(0).max(50),
  areaM2: z.number().positive("Área deve ser maior que zero.").max(100000).nullable(),
  mobilia: z.enum(Mobilia),
  aceitaPet: z.boolean(),
  caracteristicas: z.array(z.string().trim().min(1).max(60)).max(30),

  valorAluguel: z.number().int().min(0).nullable(),
  valorCondominio: z.number().int().min(0).nullable(),
  valorIptuAnual: z.number().int().min(0).nullable(),

  matricula: texto(60),
  inscricaoIptu: texto(60),
  instalacaoAgua: texto(60),
  instalacaoEnergia: texto(60),
  observacoes: texto(2000),
});

export type ImovelInput = z.infer<typeof imovelSchema>;

export const statusImovelSchema = z.object({
  id: z.string().min(1),
  status: z.enum(StatusImovel),
});

export const IMOVEL_VAZIO: ImovelInput = {
  codigo: "",
  titulo: "",
  tipo: "CASA",
  status: "DISPONIVEL",
  empreendimentoId: null,
  proprietarioId: null,
  descricao: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "Barretos",
  uf: "SP",
  quartos: 0,
  suites: 0,
  banheiros: 0,
  vagas: 0,
  areaM2: null,
  mobilia: "NAO",
  aceitaPet: false,
  caracteristicas: [],
  valorAluguel: null,
  valorCondominio: null,
  valorIptuAnual: null,
  matricula: "",
  inscricaoIptu: "",
  instalacaoAgua: "",
  instalacaoEnergia: "",
  observacoes: "",
};
