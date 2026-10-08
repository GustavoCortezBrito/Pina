import { z } from "zod";
import { EstadoCivil, PapelPessoa, TipoPessoa } from "@/generated/prisma/enums";
import { dataISOOpcional, texto } from "@/lib/form";
import { isValidCNPJ, isValidCPF, normalizeDocumento } from "@/lib/validators";

export const pessoaSchema = z
  .object({
    tipo: z.enum(TipoPessoa),
    papeis: z.array(z.enum(PapelPessoa)).min(1, "Selecione ao menos um papel."),
    nome: z.string().trim().min(2, "Informe o nome.").max(150),
    nomeFantasia: texto(150),
    documento: z.string().trim().min(1, "Informe o CPF ou CNPJ."),
    rg: texto(20),
    orgaoEmissor: texto(20),
    dataNascimento: dataISOOpcional,
    estadoCivil: z.union([z.literal(""), z.enum(EstadoCivil)]),
    profissao: texto(100),
    rendaMensal: z.number().int().min(0).nullable(),

    email: z.union([z.literal(""), z.email("E-mail inválido.")]),
    telefone1: texto(11),
    telefone1Whats: z.boolean(),
    telefone2: texto(11),

    cep: z.string().max(8),
    logradouro: texto(200),
    numero: texto(20),
    complemento: texto(100),
    bairro: texto(100),
    cidade: texto(100),
    uf: texto(2),

    conjugeNome: texto(150),
    conjugeDocumento: texto(20),
    representanteNome: texto(150),
    representanteDocumento: texto(20),
    observacoes: texto(2000),
  })
  .superRefine((dados, ctx) => {
    const documento = normalizeDocumento(dados.documento);
    const valido = dados.tipo === "PF" ? isValidCPF(documento) : isValidCNPJ(documento);
    if (!valido) {
      ctx.addIssue({
        code: "custom",
        path: ["documento"],
        message: dados.tipo === "PF" ? "CPF inválido." : "CNPJ inválido.",
      });
    }
  });

export type PessoaInput = z.infer<typeof pessoaSchema>;

export const PESSOA_VAZIA: PessoaInput = {
  tipo: "PF",
  papeis: ["INQUILINO"],
  nome: "",
  nomeFantasia: "",
  documento: "",
  rg: "",
  orgaoEmissor: "",
  dataNascimento: "",
  estadoCivil: "",
  profissao: "",
  rendaMensal: null,
  email: "",
  telefone1: "",
  telefone1Whats: true,
  telefone2: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "Barretos",
  uf: "SP",
  conjugeNome: "",
  conjugeDocumento: "",
  representanteNome: "",
  representanteDocumento: "",
  observacoes: "",
};
