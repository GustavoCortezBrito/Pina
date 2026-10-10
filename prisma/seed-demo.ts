/**
 * Massa de dados para testar o sistema: vários empreendimentos, imóveis, pessoas,
 * contratos (ativos, atrasados, vencendo, encerrados, rescindidos, renovados),
 * cobranças, pagamentos, despesas, manutenções e vistorias — tudo coerente entre si.
 *
 *   npm run db:seed:demo
 *
 * Não apaga nada. Se "Residencial Jardim das Palmeiras" já existir, não faz nada.
 */
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import "dotenv/config";
import {
  calcularDataFim,
  gerarCobrancas,
  valorDoPeriodo,
} from "../src/features/contratos/services/cobrancas";
import { addDays, addMonths, minDate, today, utcDate } from "../src/lib/dates";
import type { Pessoa } from "../src/generated/prisma/client";
import { db } from "../src/lib/db";
import { processImage } from "../src/lib/images";
import { reajustar } from "../src/lib/money";
import { storage } from "../src/lib/storage";

const hoje = today();
const reais = (v: number) => Math.round(v * 100);
/** Primeiro dia do mês (hoje − n meses) com o dia informado. */
const ha = (meses: number, dia = 1) =>
  utcDate(hoje.getUTCFullYear(), hoje.getUTCMonth() + 1 - meses, dia);

// ───────────────────────── Documentos válidos ─────────────────────────

function cpf(n: number) {
  const base = String((123456789 + n * 9871543) % 1_000_000_000).padStart(9, "0");
  const d = base.split("").map(Number);
  const dv = (len: number) => {
    const soma = d.slice(0, len).reduce((a, x, i) => a + x * (len + 1 - i), 0);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  d.push(dv(9));
  d.push(dv(10));
  return d.join("");
}

function cnpj(n: number) {
  const base = String(10_000_000 + ((n * 7_654_321) % 80_000_000)).padStart(8, "0") + "0001";
  const d = base.split("").map(Number);
  const dv = (pesos: number[]) => {
    const soma = d.reduce((a, x, i) => a + x * pesos[i], 0);
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  d.push(dv([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
  d.push(dv([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
  return d.join("");
}

// ───────────────────────── Pessoas ─────────────────────────

const BAIRROS = [
  "Centro",
  "Jardim Primavera",
  "Vila Paulista",
  "Aparecida",
  "Dr. Paulo Prata",
  "Santa Cruz",
];
const RUAS = [
  "Rua Vinte",
  "Rua Trinta e Dois",
  "Av. Quarenta e Três",
  "Rua Onze",
  "Av. Doze",
  "Rua Quinze",
];

type PessoaSpec = {
  nome: string;
  papel: "INQUILINO" | "FIADOR" | "PROPRIETARIO";
  profissao?: string;
  renda?: number;
  civil?: "SOLTEIRO" | "CASADO" | "UNIAO_ESTAVEL" | "DIVORCIADO" | "VIUVO";
  nasc?: number; // ano
};

const INQUILINOS: PessoaSpec[] = [
  {
    nome: "Carlos Eduardo Ferreira",
    papel: "INQUILINO",
    profissao: "Engenheiro agrônomo",
    renda: 920000,
    civil: "CASADO",
    nasc: 1984,
  },
  {
    nome: "Ana Paula Rodrigues",
    papel: "INQUILINO",
    profissao: "Professora",
    renda: 540000,
    civil: "SOLTEIRO",
    nasc: 1991,
  },
  {
    nome: "Marcos Vinícius Almeida",
    papel: "INQUILINO",
    profissao: "Motorista",
    renda: 420000,
    civil: "UNIAO_ESTAVEL",
    nasc: 1988,
  },
  {
    nome: "Fernanda Costa Lima",
    papel: "INQUILINO",
    profissao: "Enfermeira",
    renda: 610000,
    civil: "DIVORCIADO",
    nasc: 1986,
  },
  {
    nome: "Ricardo Oliveira Santos",
    papel: "INQUILINO",
    profissao: "Vendedor",
    renda: 380000,
    civil: "SOLTEIRO",
    nasc: 1995,
  },
  {
    nome: "Juliana Martins Pereira",
    papel: "INQUILINO",
    profissao: "Dentista",
    renda: 1100000,
    civil: "CASADO",
    nasc: 1982,
  },
  {
    nome: "Pedro Henrique Barbosa",
    papel: "INQUILINO",
    profissao: "Estudante de Medicina",
    renda: 250000,
    civil: "SOLTEIRO",
    nasc: 2001,
  },
  {
    nome: "Camila Ribeiro Duarte",
    papel: "INQUILINO",
    profissao: "Advogada",
    renda: 880000,
    civil: "SOLTEIRO",
    nasc: 1990,
  },
  {
    nome: "Lucas Gabriel Nogueira",
    papel: "INQUILINO",
    profissao: "Técnico em TI",
    renda: 480000,
    civil: "SOLTEIRO",
    nasc: 1997,
  },
  {
    nome: "Patrícia Moreira Cardoso",
    papel: "INQUILINO",
    profissao: "Farmacêutica",
    renda: 700000,
    civil: "CASADO",
    nasc: 1985,
  },
  {
    nome: "Rafael Teixeira Mendes",
    papel: "INQUILINO",
    profissao: "Operador de máquinas",
    renda: 450000,
    civil: "CASADO",
    nasc: 1983,
  },
  {
    nome: "Larissa Fernandes Rocha",
    papel: "INQUILINO",
    profissao: "Designer",
    renda: 520000,
    civil: "SOLTEIRO",
    nasc: 1996,
  },
  {
    nome: "Thiago Araújo Pinto",
    papel: "INQUILINO",
    profissao: "Gerente comercial",
    renda: 950000,
    civil: "CASADO",
    nasc: 1980,
  },
  {
    nome: "Beatriz Carvalho Gomes",
    papel: "INQUILINO",
    profissao: "Nutricionista",
    renda: 560000,
    civil: "SOLTEIRO",
    nasc: 1993,
  },
  {
    nome: "Gustavo Henrique Dias",
    papel: "INQUILINO",
    profissao: "Mecânico",
    renda: 400000,
    civil: "UNIAO_ESTAVEL",
    nasc: 1989,
  },
  {
    nome: "Aline Batista Correia",
    papel: "INQUILINO",
    profissao: "Atendente",
    renda: 330000,
    civil: "SOLTEIRO",
    nasc: 1999,
  },
  {
    nome: "Diego Monteiro Freitas",
    papel: "INQUILINO",
    profissao: "Eletricista",
    renda: 460000,
    civil: "CASADO",
    nasc: 1987,
  },
  {
    nome: "Isabela Nunes Vieira",
    papel: "INQUILINO",
    profissao: "Arquiteta",
    renda: 780000,
    civil: "SOLTEIRO",
    nasc: 1992,
  },
  {
    nome: "Bruno Cavalcante Lopes",
    papel: "INQUILINO",
    profissao: "Analista financeiro",
    renda: 690000,
    civil: "SOLTEIRO",
    nasc: 1994,
  },
];

const FIADORES: PessoaSpec[] = [
  {
    nome: "Antônio Carlos Souza",
    papel: "FIADOR",
    profissao: "Aposentado",
    renda: 480000,
    civil: "CASADO",
    nasc: 1960,
  },
  {
    nome: "Sebastião Lima Filho",
    papel: "FIADOR",
    profissao: "Pecuarista",
    renda: 1500000,
    civil: "CASADO",
    nasc: 1958,
  },
  {
    nome: "Rosângela Alves Prado",
    papel: "FIADOR",
    profissao: "Comerciante",
    renda: 650000,
    civil: "VIUVO",
    nasc: 1966,
  },
  {
    nome: "José Roberto Campos",
    papel: "FIADOR",
    profissao: "Contador",
    renda: 890000,
    civil: "CASADO",
    nasc: 1972,
  },
  {
    nome: "Márcia Helena Prado",
    papel: "FIADOR",
    profissao: "Servidora pública",
    renda: 720000,
    civil: "DIVORCIADO",
    nasc: 1970,
  },
  {
    nome: "Francisco de Assis Lopes",
    papel: "FIADOR",
    profissao: "Aposentado",
    renda: 510000,
    civil: "CASADO",
    nasc: 1955,
  },
  {
    nome: "Vera Lúcia Machado",
    papel: "FIADOR",
    profissao: "Empresária",
    renda: 1300000,
    civil: "CASADO",
    nasc: 1968,
  },
  {
    nome: "Eduardo Tavares Neto",
    papel: "FIADOR",
    profissao: "Médico",
    renda: 2100000,
    civil: "CASADO",
    nasc: 1975,
  },
  {
    nome: "Neusa Maria Ferraz",
    papel: "FIADOR",
    profissao: "Aposentada",
    renda: 430000,
    civil: "VIUVO",
    nasc: 1957,
  },
  {
    nome: "Wilson Gonçalves",
    papel: "FIADOR",
    profissao: "Agricultor",
    renda: 980000,
    civil: "CASADO",
    nasc: 1962,
  },
  {
    nome: "Cláudia Regina Silva",
    papel: "FIADOR",
    profissao: "Professora",
    renda: 600000,
    civil: "CASADO",
    nasc: 1974,
  },
  {
    nome: "Osvaldo Pereira Dias",
    papel: "FIADOR",
    profissao: "Comerciante",
    renda: 770000,
    civil: "CASADO",
    nasc: 1964,
  },
];

const PJS = [
  {
    nome: "Clínica Odontológica Sorriso Ltda",
    fantasia: "Sorriso Odonto",
    rep: "Juliana Martins Pereira",
  },
  {
    nome: "Escritório Contábil Barretos S/S",
    fantasia: "Contábil Barretos",
    rep: "José Roberto Campos",
  },
  {
    nome: "Studio Bella Pele Estética Ltda",
    fantasia: "Bella Pele",
    rep: "Larissa Fernandes Rocha",
  },
  {
    nome: "Transportadora Rio Pardo Ltda",
    fantasia: "Rio Pardo Transportes",
    rep: "Thiago Araújo Pinto",
  },
];

// ───────────────────────── Imóveis ─────────────────────────

type Tipo = "CASA" | "APARTAMENTO" | "KITNET" | "SALA_COMERCIAL" | "GALPAO" | "TERRENO";
type Status = "DISPONIVEL" | "ALUGADO" | "RESERVADO" | "EM_REFORMA" | "INATIVO";

type ImovelSpec = {
  codigo: string;
  titulo: string;
  tipo: Tipo;
  status: Status;
  emp?: string;
  dono: "ADM" | "PAL" | "PJ";
  rua: string;
  numero: string;
  compl?: string;
  bairro: string;
  cep: string;
  q?: number;
  s?: number;
  b?: number;
  v?: number;
  area: number;
  mobilia?: "NAO" | "SEMI" | "SIM";
  pet?: boolean;
  carac: string[];
  aluguel: number;
  cond?: number;
  iptu?: number;
  desc: string;
};

const EDI_ADM = "Edifício ADM";
const PALMEIRAS = "Residencial Jardim das Palmeiras";
const EMPRESARIAL = "Edifício Centro Empresarial Barretos";
const VILA_VERDE = "Condomínio Vila Verde";

const EMPREENDIMENTOS = [
  {
    nome: PALMEIRAS,
    logradouro: "Avenida Brasil",
    numero: "450",
    bairro: "Jardim das Palmeiras",
    cep: "14783100",
    obs: "Prédio de 3 andares com 6 apartamentos, portaria e garagem coberta.",
  },
  {
    nome: EMPRESARIAL,
    logradouro: "Rua Dezoito",
    numero: "890",
    bairro: "Centro",
    cep: "14780200",
    obs: "Salas comerciais no centro, com elevador e recepção.",
  },
  {
    nome: VILA_VERDE,
    logradouro: "Rua das Acácias",
    numero: "120",
    bairro: "Vila Verde",
    cep: "14785300",
    obs: "Condomínio fechado de 4 casas com área de lazer.",
  },
];

const IMOVEIS: ImovelSpec[] = [
  // Edifício ADM (já existe o ADM-02)
  {
    codigo: "ADM-01",
    titulo: "Apto 01 – Ed. ADM",
    tipo: "APARTAMENTO",
    status: "ALUGADO",
    emp: EDI_ADM,
    dono: "ADM",
    rua: "Rua Vinte e Oito",
    numero: "1234",
    compl: "Apto 01",
    bairro: "Centro",
    cep: "14780000",
    q: 2,
    s: 0,
    b: 1,
    v: 1,
    area: 62,
    mobilia: "NAO",
    pet: false,
    carac: ["Varanda", "Armários na cozinha"],
    aluguel: reais(1450),
    cond: reais(280),
    iptu: reais(850),
    desc: "Apartamento térreo com varanda, próximo ao comércio.",
  },
  {
    codigo: "ADM-03",
    titulo: "Apto 03 – Ed. ADM",
    tipo: "APARTAMENTO",
    status: "ALUGADO",
    emp: EDI_ADM,
    dono: "ADM",
    rua: "Rua Vinte e Oito",
    numero: "1234",
    compl: "Apto 03",
    bairro: "Centro",
    cep: "14780000",
    q: 2,
    s: 1,
    b: 2,
    v: 1,
    area: 70,
    mobilia: "SEMI",
    pet: true,
    carac: ["Ar-condicionado", "Churrasqueira"],
    aluguel: reais(1550),
    cond: reais(280),
    iptu: reais(900),
    desc: "Apartamento no 1º andar, com suíte e churrasqueira.",
  },
  {
    codigo: "ADM-04",
    titulo: "Apto 04 – Ed. ADM",
    tipo: "APARTAMENTO",
    status: "ALUGADO",
    emp: EDI_ADM,
    dono: "ADM",
    rua: "Rua Vinte e Oito",
    numero: "1234",
    compl: "Apto 04",
    bairro: "Centro",
    cep: "14780000",
    q: 3,
    s: 1,
    b: 2,
    v: 2,
    area: 84,
    mobilia: "NAO",
    pet: true,
    carac: ["Fechadura digital", "Armários planejados"],
    aluguel: reais(1850),
    cond: reais(310),
    iptu: reais(1100),
    desc: "Apartamento de 3 quartos, o maior do prédio.",
  },
  {
    codigo: "KIT-01",
    titulo: "Kitnet 01 – Ed. ADM",
    tipo: "KITNET",
    status: "ALUGADO",
    emp: EDI_ADM,
    dono: "ADM",
    rua: "Rua Vinte e Oito",
    numero: "1234",
    compl: "Kitnet 01",
    bairro: "Centro",
    cep: "14780000",
    q: 1,
    s: 0,
    b: 1,
    v: 0,
    area: 28,
    mobilia: "SIM",
    pet: false,
    carac: ["Mobiliada", "Internet incluída"],
    aluguel: reais(850),
    cond: reais(150),
    desc: "Kitnet mobiliada, ideal para estudantes.",
  },
  {
    codigo: "KIT-02",
    titulo: "Kitnet 02 – Ed. ADM",
    tipo: "KITNET",
    status: "ALUGADO",
    emp: EDI_ADM,
    dono: "ADM",
    rua: "Rua Vinte e Oito",
    numero: "1234",
    compl: "Kitnet 02",
    bairro: "Centro",
    cep: "14780000",
    q: 1,
    s: 0,
    b: 1,
    v: 0,
    area: 26,
    mobilia: "NAO",
    pet: false,
    carac: ["Janela para a rua"],
    aluguel: reais(780),
    cond: reais(150),
    desc: "Kitnet reformada recentemente.",
  },
  {
    codigo: "KIT-03",
    titulo: "Kitnet 03 – Ed. ADM",
    tipo: "KITNET",
    status: "ALUGADO",
    emp: EDI_ADM,
    dono: "ADM",
    rua: "Rua Vinte e Oito",
    numero: "1234",
    compl: "Kitnet 03",
    bairro: "Centro",
    cep: "14780000",
    q: 1,
    s: 0,
    b: 1,
    v: 0,
    area: 30,
    mobilia: "SEMI",
    pet: true,
    carac: ["Ar-condicionado"],
    aluguel: reais(900),
    cond: reais(150),
    desc: "Kitnet com ar-condicionado e armário embutido.",
  },
  {
    codigo: "KIT-04",
    titulo: "Kitnet 04 – Ed. ADM",
    tipo: "KITNET",
    status: "DISPONIVEL",
    emp: EDI_ADM,
    dono: "ADM",
    rua: "Rua Vinte e Oito",
    numero: "1234",
    compl: "Kitnet 04",
    bairro: "Centro",
    cep: "14780000",
    q: 1,
    s: 0,
    b: 1,
    v: 0,
    area: 27,
    mobilia: "NAO",
    pet: false,
    carac: [],
    aluguel: reais(800),
    cond: reais(150),
    desc: "Kitnet desocupada, pronta para novo inquilino.",
  },

  // Residencial Jardim das Palmeiras
  {
    codigo: "PAL-101",
    titulo: "Apto 101 – Res. Palmeiras",
    tipo: "APARTAMENTO",
    status: "ALUGADO",
    emp: PALMEIRAS,
    dono: "PAL",
    rua: "Avenida Brasil",
    numero: "450",
    compl: "Apto 101",
    bairro: "Jardim das Palmeiras",
    cep: "14783100",
    q: 2,
    s: 0,
    b: 1,
    v: 1,
    area: 58,
    mobilia: "NAO",
    pet: true,
    carac: ["Portaria", "Garagem coberta"],
    aluguel: reais(1350),
    cond: reais(320),
    iptu: reais(780),
    desc: "Apartamento no térreo, com garagem coberta.",
  },
  {
    codigo: "PAL-102",
    titulo: "Apto 102 – Res. Palmeiras",
    tipo: "APARTAMENTO",
    status: "ALUGADO",
    emp: PALMEIRAS,
    dono: "PAL",
    rua: "Avenida Brasil",
    numero: "450",
    compl: "Apto 102",
    bairro: "Jardim das Palmeiras",
    cep: "14783100",
    q: 2,
    s: 0,
    b: 1,
    v: 1,
    area: 58,
    mobilia: "SEMI",
    pet: true,
    carac: ["Portaria", "Armários planejados"],
    aluguel: reais(1380),
    cond: reais(320),
    iptu: reais(780),
    desc: "Apartamento com armários planejados na cozinha e nos quartos.",
  },
  {
    codigo: "PAL-201",
    titulo: "Apto 201 – Res. Palmeiras",
    tipo: "APARTAMENTO",
    status: "ALUGADO",
    emp: PALMEIRAS,
    dono: "PAL",
    rua: "Avenida Brasil",
    numero: "450",
    compl: "Apto 201",
    bairro: "Jardim das Palmeiras",
    cep: "14783100",
    q: 3,
    s: 1,
    b: 2,
    v: 2,
    area: 78,
    mobilia: "NAO",
    pet: false,
    carac: ["Portaria", "Sacada gourmet"],
    aluguel: reais(1750),
    cond: reais(360),
    iptu: reais(990),
    desc: "Apartamento de 3 quartos com sacada gourmet.",
  },
  {
    codigo: "PAL-202",
    titulo: "Apto 202 – Res. Palmeiras",
    tipo: "APARTAMENTO",
    status: "DISPONIVEL",
    emp: PALMEIRAS,
    dono: "PAL",
    rua: "Avenida Brasil",
    numero: "450",
    compl: "Apto 202",
    bairro: "Jardim das Palmeiras",
    cep: "14783100",
    q: 2,
    s: 0,
    b: 1,
    v: 1,
    area: 60,
    mobilia: "NAO",
    pet: true,
    carac: ["Portaria"],
    aluguel: reais(1400),
    cond: reais(320),
    iptu: reais(790),
    desc: "Apartamento desocupado após rescisão amigável.",
  },
  {
    codigo: "PAL-301",
    titulo: "Apto 301 – Res. Palmeiras",
    tipo: "APARTAMENTO",
    status: "ALUGADO",
    emp: PALMEIRAS,
    dono: "PAL",
    rua: "Avenida Brasil",
    numero: "450",
    compl: "Apto 301",
    bairro: "Jardim das Palmeiras",
    cep: "14783100",
    q: 3,
    s: 1,
    b: 2,
    v: 2,
    area: 82,
    mobilia: "SEMI",
    pet: true,
    carac: ["Portaria", "Cobertura parcial", "Ar-condicionado"],
    aluguel: reais(1900),
    cond: reais(380),
    iptu: reais(1050),
    desc: "Apartamento no último andar, com ar-condicionado nos quartos.",
  },
  {
    codigo: "PAL-302",
    titulo: "Apto 302 – Res. Palmeiras",
    tipo: "APARTAMENTO",
    status: "RESERVADO",
    emp: PALMEIRAS,
    dono: "PAL",
    rua: "Avenida Brasil",
    numero: "450",
    compl: "Apto 302",
    bairro: "Jardim das Palmeiras",
    cep: "14783100",
    q: 2,
    s: 1,
    b: 2,
    v: 1,
    area: 66,
    mobilia: "NAO",
    pet: true,
    carac: ["Portaria", "Suíte"],
    aluguel: reais(1650),
    cond: reais(340),
    iptu: reais(860),
    desc: "Reservado: contrato em elaboração para o próximo mês.",
  },

  // Edifício Centro Empresarial
  {
    codigo: "SALA-101",
    titulo: "Sala 101 – Centro Empresarial",
    tipo: "SALA_COMERCIAL",
    status: "ALUGADO",
    emp: EMPRESARIAL,
    dono: "PJ",
    rua: "Rua Dezoito",
    numero: "890",
    compl: "Sala 101",
    bairro: "Centro",
    cep: "14780200",
    b: 1,
    v: 1,
    area: 42,
    carac: ["Elevador", "Recepção", "Ar-condicionado"],
    aluguel: reais(2200),
    cond: reais(450),
    iptu: reais(1300),
    desc: "Sala comercial com recepção compartilhada.",
  },
  {
    codigo: "SALA-102",
    titulo: "Sala 102 – Centro Empresarial",
    tipo: "SALA_COMERCIAL",
    status: "ALUGADO",
    emp: EMPRESARIAL,
    dono: "PJ",
    rua: "Rua Dezoito",
    numero: "890",
    compl: "Sala 102",
    bairro: "Centro",
    cep: "14780200",
    b: 1,
    v: 1,
    area: 38,
    carac: ["Elevador", "Recepção"],
    aluguel: reais(1950),
    cond: reais(420),
    iptu: reais(1200),
    desc: "Sala voltada para a rua, muito iluminada.",
  },
  {
    codigo: "SALA-103",
    titulo: "Sala 103 – Centro Empresarial",
    tipo: "SALA_COMERCIAL",
    status: "ALUGADO",
    emp: EMPRESARIAL,
    dono: "PJ",
    rua: "Rua Dezoito",
    numero: "890",
    compl: "Sala 103",
    bairro: "Centro",
    cep: "14780200",
    b: 2,
    v: 2,
    area: 65,
    carac: ["Elevador", "Recepção", "Copa"],
    aluguel: reais(3100),
    cond: reais(600),
    iptu: reais(1800),
    desc: "Sala ampla com copa e dois banheiros.",
  },
  {
    codigo: "SALA-104",
    titulo: "Sala 104 – Centro Empresarial",
    tipo: "SALA_COMERCIAL",
    status: "DISPONIVEL",
    emp: EMPRESARIAL,
    dono: "PJ",
    rua: "Rua Dezoito",
    numero: "890",
    compl: "Sala 104",
    bairro: "Centro",
    cep: "14780200",
    b: 1,
    v: 1,
    area: 40,
    carac: ["Elevador"],
    aluguel: reais(2000),
    cond: reais(430),
    iptu: reais(1250),
    desc: "Sala disponível para locação imediata.",
  },
  {
    codigo: "SALA-105",
    titulo: "Sala 105 – Centro Empresarial",
    tipo: "SALA_COMERCIAL",
    status: "EM_REFORMA",
    emp: EMPRESARIAL,
    dono: "PJ",
    rua: "Rua Dezoito",
    numero: "890",
    compl: "Sala 105",
    bairro: "Centro",
    cep: "14780200",
    b: 1,
    v: 1,
    area: 36,
    carac: ["Elevador"],
    aluguel: reais(1850),
    cond: reais(410),
    iptu: reais(1150),
    desc: "Em reforma: troca de piso e pintura geral.",
  },

  // Condomínio Vila Verde
  {
    codigo: "CASA-01",
    titulo: "Casa 01 – Vila Verde",
    tipo: "CASA",
    status: "ALUGADO",
    emp: VILA_VERDE,
    dono: "PAL",
    rua: "Rua das Acácias",
    numero: "120",
    compl: "Casa 01",
    bairro: "Vila Verde",
    cep: "14785300",
    q: 3,
    s: 1,
    b: 3,
    v: 2,
    area: 140,
    mobilia: "NAO",
    pet: true,
    carac: ["Quintal", "Churrasqueira", "Portão eletrônico"],
    aluguel: reais(2800),
    cond: reais(350),
    iptu: reais(1700),
    desc: "Casa de esquina com quintal amplo.",
  },
  {
    codigo: "CASA-02",
    titulo: "Casa 02 – Vila Verde",
    tipo: "CASA",
    status: "ALUGADO",
    emp: VILA_VERDE,
    dono: "PAL",
    rua: "Rua das Acácias",
    numero: "120",
    compl: "Casa 02",
    bairro: "Vila Verde",
    cep: "14785300",
    q: 3,
    s: 1,
    b: 2,
    v: 2,
    area: 125,
    mobilia: "SEMI",
    pet: true,
    carac: ["Quintal", "Piscina"],
    aluguel: reais(2600),
    cond: reais(350),
    iptu: reais(1600),
    desc: "Casa com piscina e área gourmet.",
  },
  {
    codigo: "CASA-03",
    titulo: "Casa 03 – Vila Verde",
    tipo: "CASA",
    status: "DISPONIVEL",
    emp: VILA_VERDE,
    dono: "PAL",
    rua: "Rua das Acácias",
    numero: "120",
    compl: "Casa 03",
    bairro: "Vila Verde",
    cep: "14785300",
    q: 3,
    s: 0,
    b: 2,
    v: 2,
    area: 120,
    mobilia: "NAO",
    pet: true,
    carac: ["Quintal"],
    aluguel: reais(2400),
    cond: reais(350),
    iptu: reais(1500),
    desc: "Casa disponível, recém-pintada.",
  },
  {
    codigo: "CASA-04",
    titulo: "Casa 04 – Vila Verde",
    tipo: "CASA",
    status: "INATIVO",
    emp: VILA_VERDE,
    dono: "PAL",
    rua: "Rua das Acácias",
    numero: "120",
    compl: "Casa 04",
    bairro: "Vila Verde",
    cep: "14785300",
    q: 3,
    s: 1,
    b: 2,
    v: 2,
    area: 130,
    mobilia: "NAO",
    pet: true,
    carac: [],
    aluguel: reais(2500),
    cond: reais(350),
    desc: "Fora de locação: imóvel retirado da carteira pelo proprietário.",
  },

  // Avulsos
  {
    codigo: "CASA-05",
    titulo: "Casa 05 – Jardim Primavera",
    tipo: "CASA",
    status: "ALUGADO",
    dono: "ADM",
    rua: "Rua Trinta e Dois",
    numero: "455",
    bairro: "Jardim Primavera",
    cep: "14784400",
    q: 2,
    s: 0,
    b: 1,
    v: 1,
    area: 90,
    mobilia: "NAO",
    pet: true,
    carac: ["Quintal", "Edícula"],
    aluguel: reais(1500),
    iptu: reais(1000),
    desc: "Casa simples e bem conservada, com edícula nos fundos.",
  },
  {
    codigo: "CASA-06",
    titulo: "Casa 06 – Vila Paulista",
    tipo: "CASA",
    status: "ALUGADO",
    dono: "ADM",
    rua: "Rua Onze",
    numero: "78",
    bairro: "Vila Paulista",
    cep: "14786500",
    q: 3,
    s: 1,
    b: 2,
    v: 2,
    area: 150,
    mobilia: "SEMI",
    pet: true,
    carac: ["Quintal", "Churrasqueira", "Armários planejados"],
    aluguel: reais(2300),
    iptu: reais(1400),
    desc: "Casa ampla em rua tranquila, perto de escolas.",
  },
  {
    codigo: "CASA-07",
    titulo: "Casa 07 – Aparecida",
    tipo: "CASA",
    status: "ALUGADO",
    dono: "PAL",
    rua: "Avenida Doze",
    numero: "301",
    bairro: "Aparecida",
    cep: "14787600",
    q: 2,
    s: 0,
    b: 1,
    v: 1,
    area: 85,
    mobilia: "NAO",
    pet: false,
    carac: ["Quintal"],
    aluguel: reais(1400),
    iptu: reais(900),
    desc: "Casa de 2 quartos próxima ao mercado municipal.",
  },
  {
    codigo: "GALPAO-01",
    titulo: "Galpão 01 – Distrito Industrial",
    tipo: "GALPAO",
    status: "ALUGADO",
    dono: "PJ",
    rua: "Rua Quinze",
    numero: "1500",
    bairro: "Distrito Industrial",
    cep: "14788700",
    b: 2,
    v: 6,
    area: 480,
    carac: ["Pé-direito alto", "Doca", "Escritório"],
    aluguel: reais(6500),
    iptu: reais(4200),
    desc: "Galpão com doca e escritório, acesso para carretas.",
  },
  {
    codigo: "TERRENO-01",
    titulo: "Terreno 01 – Santa Cruz",
    tipo: "TERRENO",
    status: "DISPONIVEL",
    dono: "PJ",
    rua: "Rua Quarenta",
    numero: "S/N",
    bairro: "Santa Cruz",
    cep: "14789800",
    area: 360,
    carac: ["Murado", "Plano"],
    aluguel: reais(1200),
    iptu: reais(600),
    desc: "Terreno plano de 12×30 m, murado, para estacionamento ou depósito.",
  },
];

// ───────────────────────── Contratos ─────────────────────────

type Perfil = "pontual" | "atrasado2" | "atrasado1" | "parcial";
type Garantia = "FIADOR" | "CAUCAO" | "SEGURO_FIANCA" | "SEM_GARANTIA" | "TITULO_CAPITALIZACAO";

type ContratoSpec = {
  imovel: string;
  inq: number; // índice em INQUILINOS, ou 100+ para PJS
  fiador?: number;
  garantia: Garantia;
  inicio: Date;
  prazo: number;
  dia: number; // dia de vencimento
  perfil: Perfil;
  reajuste?: { indice: "IGPM" | "IPCA"; perc: number };
  status?: "ATIVO" | "ENCERRADO" | "RESCINDIDO" | "RASCUNHO" | "RENOVADO";
  rescisao?: Date;
  finalidade?: "RESIDENCIAL" | "COMERCIAL";
  antecipado?: boolean;
  anterior?: boolean; // gera o contrato anterior (RENOVADO)
};

const CONTRATOS: ContratoSpec[] = [
  {
    imovel: "ADM-01",
    inq: 0,
    fiador: 0,
    garantia: "FIADOR",
    inicio: ha(14, 5),
    prazo: 30,
    dia: 10,
    perfil: "pontual",
    reajuste: { indice: "IGPM", perc: 4.2 },
  },
  {
    imovel: "ADM-03",
    inq: 1,
    garantia: "CAUCAO",
    inicio: ha(6, 1),
    prazo: 30,
    dia: 10,
    perfil: "pontual",
  },
  {
    imovel: "ADM-04",
    inq: 2,
    fiador: 1,
    garantia: "FIADOR",
    inicio: ha(4, 1),
    prazo: 30,
    dia: 5,
    perfil: "atrasado1",
  },
  {
    imovel: "KIT-01",
    inq: 3,
    garantia: "CAUCAO",
    inicio: ha(9, 1),
    prazo: 12,
    dia: 10,
    perfil: "pontual",
  },
  {
    imovel: "KIT-02",
    inq: 4,
    garantia: "SEM_GARANTIA",
    inicio: ha(2, 1),
    prazo: 12,
    dia: 10,
    perfil: "parcial",
  },
  {
    imovel: "KIT-03",
    inq: 5,
    fiador: 2,
    garantia: "FIADOR",
    inicio: ha(20, 1),
    prazo: 24,
    dia: 10,
    perfil: "pontual",
    reajuste: { indice: "IPCA", perc: 4.8 },
  },
  {
    imovel: "KIT-04",
    inq: 6,
    garantia: "CAUCAO",
    inicio: ha(26, 1),
    prazo: 12,
    dia: 10,
    perfil: "pontual",
    status: "ENCERRADO",
  },
  {
    imovel: "PAL-101",
    inq: 7,
    fiador: 3,
    garantia: "FIADOR",
    inicio: ha(11, 1),
    prazo: 12,
    dia: 10,
    perfil: "pontual",
  },
  {
    imovel: "PAL-102",
    inq: 8,
    garantia: "SEGURO_FIANCA",
    inicio: ha(5, 15),
    prazo: 30,
    dia: 15,
    perfil: "pontual",
  },
  {
    imovel: "PAL-201",
    inq: 9,
    fiador: 4,
    garantia: "FIADOR",
    inicio: ha(8, 1),
    prazo: 30,
    dia: 10,
    perfil: "atrasado2",
  },
  {
    imovel: "PAL-202",
    inq: 10,
    garantia: "CAUCAO",
    inicio: ha(10, 1),
    prazo: 30,
    dia: 10,
    perfil: "pontual",
    status: "RESCINDIDO",
    rescisao: ha(3, 15),
  },
  {
    imovel: "PAL-301",
    inq: 11,
    fiador: 5,
    garantia: "FIADOR",
    inicio: ha(13, 1),
    prazo: 24,
    dia: 10,
    perfil: "pontual",
    reajuste: { indice: "IGPM", perc: 3.9 },
    anterior: true,
  },
  {
    imovel: "PAL-302",
    inq: 17,
    fiador: 6,
    garantia: "FIADOR",
    inicio: ha(-1, 1),
    prazo: 30,
    dia: 10,
    perfil: "pontual",
    status: "RASCUNHO",
  },
  {
    imovel: "SALA-101",
    inq: 100,
    fiador: 7,
    garantia: "FIADOR",
    inicio: ha(7, 1),
    prazo: 60,
    dia: 10,
    perfil: "pontual",
    finalidade: "COMERCIAL",
  },
  {
    imovel: "SALA-102",
    inq: 101,
    garantia: "SEGURO_FIANCA",
    inicio: ha(4, 1),
    prazo: 36,
    dia: 10,
    perfil: "atrasado1",
    finalidade: "COMERCIAL",
  },
  {
    imovel: "SALA-103",
    inq: 102,
    garantia: "CAUCAO",
    inicio: ha(15, 1),
    prazo: 36,
    dia: 5,
    perfil: "pontual",
    finalidade: "COMERCIAL",
    reajuste: { indice: "IGPM", perc: 4.1 },
  },
  {
    imovel: "CASA-01",
    inq: 12,
    fiador: 8,
    garantia: "FIADOR",
    inicio: ha(12, 1),
    prazo: 30,
    dia: 10,
    perfil: "pontual",
    reajuste: { indice: "IPCA", perc: 4.5 },
  },
  {
    imovel: "CASA-02",
    inq: 13,
    fiador: 9,
    garantia: "FIADOR",
    inicio: ha(1, 1),
    prazo: 30,
    dia: 10,
    perfil: "pontual",
  },
  {
    imovel: "CASA-05",
    inq: 14,
    fiador: 10,
    garantia: "FIADOR",
    inicio: ha(18, 1),
    prazo: 30,
    dia: 10,
    perfil: "atrasado2",
    reajuste: { indice: "IGPM", perc: 4.0 },
  },
  {
    imovel: "CASA-06",
    inq: 15,
    garantia: "TITULO_CAPITALIZACAO",
    inicio: ha(4, 1),
    prazo: 30,
    dia: 10,
    perfil: "pontual",
  },
  {
    imovel: "CASA-07",
    inq: 16,
    fiador: 11,
    garantia: "FIADOR",
    inicio: ha(9, 1),
    prazo: 30,
    dia: 10,
    perfil: "pontual",
  },
  {
    imovel: "GALPAO-01",
    inq: 103,
    garantia: "CAUCAO",
    inicio: ha(10, 1),
    prazo: 60,
    dia: 10,
    perfil: "pontual",
    finalidade: "COMERCIAL",
  },
];

const FORMAS = ["PIX", "BOLETO", "TRANSFERENCIA", "PIX", "DINHEIRO"] as const;

// ───────────────────────── Execução ─────────────────────────

async function carregarFotos() {
  const pasta = path.resolve(process.cwd(), "ImovelExemplo");
  let nomes: string[] = [];
  try {
    nomes = (await readdir(pasta)).filter((n) => /\.(jpe?g|png|webp)$/i.test(n)).sort();
  } catch {
    return [];
  }
  const processadas = [];
  for (const nome of nomes) {
    const { data, width, height, thumb } = await processImage(
      await readFile(path.join(pasta, nome)),
    );
    processadas.push({ nome, data, width, height, thumb });
  }
  return processadas;
}

async function anexarFotos(
  imovelId: string,
  fotos: Awaited<ReturnType<typeof carregarFotos>>,
  offset: number,
) {
  if (fotos.length === 0) return;
  for (let i = 0; i < 3; i++) {
    const foto = fotos[(offset * 3 + i) % fotos.length];
    const id = randomUUID();
    const caminho = `imovel/${imovelId}/${id}.webp`;
    const caminhoThumb = `imovel/${imovelId}/${id}-thumb.webp`;
    await storage.save(caminho, foto.data);
    await storage.save(caminhoThumb, foto.thumb);
    await db.arquivo.create({
      data: {
        categoria: "FOTO",
        nomeOriginal: foto.nome,
        caminho,
        caminhoThumb,
        mime: "image/webp",
        tamanho: foto.data.byteLength,
        largura: foto.width,
        altura: foto.height,
        ordem: i,
        capa: i === 0,
        imovelId,
      },
    });
  }
}

async function seedOperacao(adminId: string, imoveis: Map<string, string>) {
  const categorias = new Map((await db.categoriaDespesa.findMany()).map((c) => [c.nome, c.id]));
  const cat = (nome: string) => categorias.get(nome)!;
  const id = (codigo: string) => imoveis.get(codigo)!;

  const MANUT = [
    {
      imovel: "CASA-07",
      titulo: "Vazamento no banheiro social",
      prioridade: "URGENTE",
      status: "EM_ANDAMENTO",
      aberta: ha(0, 1),
      desc: "Inquilino relatou infiltração na parede do box.",
    },
    {
      imovel: "KIT-03",
      titulo: "Pintura da fachada e portão",
      prioridade: "BAIXA",
      status: "ABERTA",
      aberta: ha(0, 5),
      desc: "Pintura desgastada; orçar com dois pintores.",
    },
    {
      imovel: "ADM-04",
      titulo: "Troca da fechadura digital",
      prioridade: "MEDIA",
      status: "ABERTA",
      aberta: ha(0, 6),
      desc: "Teclado da fechadura falhando.",
    },
    {
      imovel: "SALA-105",
      titulo: "Reforma geral: piso e pintura",
      prioridade: "ALTA",
      status: "EM_ANDAMENTO",
      aberta: ha(1, 10),
      desc: "Troca do piso, pintura e revisão elétrica antes de nova locação.",
    },
    {
      imovel: "ADM-02",
      titulo: "Troca do disjuntor do quadro de força",
      prioridade: "ALTA",
      status: "CONCLUIDA",
      aberta: ha(1, 10),
      concluida: ha(1, 12),
      desc: "Disjuntor desarmando com frequência.",
    },
    {
      imovel: "PAL-202",
      titulo: "Pintura e limpeza pós-rescisão",
      prioridade: "MEDIA",
      status: "CONCLUIDA",
      aberta: ha(3, 18),
      concluida: ha(3, 28),
      desc: "Preparar apartamento para nova locação.",
    },
    {
      imovel: "PAL-201",
      titulo: "Vazamento na pia da cozinha",
      prioridade: "MEDIA",
      status: "CONCLUIDA",
      aberta: ha(2, 3),
      concluida: ha(2, 4),
      desc: "Troca do sifão e da flexível.",
    },
    {
      imovel: "CASA-03",
      titulo: "Poda das árvores e limpeza do quintal",
      prioridade: "BAIXA",
      status: "CONCLUIDA",
      aberta: ha(1, 20),
      concluida: ha(1, 22),
      desc: "Imóvel disponível, preparar para visitas.",
    },
    {
      imovel: "GALPAO-01",
      titulo: "Revisão do telhado antes das chuvas",
      prioridade: "ALTA",
      status: "ABERTA",
      aberta: ha(0, 2),
      desc: "Algumas telhas trincadas; risco de goteiras.",
    },
    {
      imovel: "CASA-02",
      titulo: "Manutenção da piscina",
      prioridade: "BAIXA",
      status: "CANCELADA",
      aberta: ha(1, 14),
      desc: "Cancelada: inquilino assumiu a limpeza.",
    },
  ] as const;

  const manutIds = new Map<string, string>();
  for (const m of MANUT) {
    const existente = await db.manutencao.findFirst({ where: { titulo: m.titulo } });
    if (existente) {
      manutIds.set(m.titulo, existente.id);
      continue;
    }
    const criada = await db.manutencao.create({
      data: {
        imovelId: id(m.imovel),
        titulo: m.titulo,
        descricao: m.desc,
        prioridade: m.prioridade,
        status: m.status,
        abertaEm: m.aberta,
        concluidaEm: "concluida" in m ? m.concluida : null,
      },
    });
    manutIds.set(m.titulo, criada.id);
  }

  const DESPESAS = [
    {
      imovel: "ADM-02",
      cat: "Manutenção",
      data: ha(1, 12),
      valor: reais(320),
      forn: "Elétrica Barretos",
      desc: "Troca do disjuntor do quadro de força",
      m: "Troca do disjuntor do quadro de força",
    },
    {
      imovel: "PAL-202",
      cat: "Reforma",
      data: ha(3, 27),
      valor: reais(1450),
      forn: "Pinturas Rio Pardo",
      desc: "Pintura completa do apartamento",
      m: "Pintura e limpeza pós-rescisão",
    },
    {
      imovel: "PAL-202",
      cat: "Manutenção",
      data: ha(3, 28),
      valor: reais(180),
      forn: "Limpeza Brilho",
      desc: "Limpeza pós-obra",
      m: "Pintura e limpeza pós-rescisão",
    },
    {
      imovel: "PAL-201",
      cat: "Manutenção",
      data: ha(2, 4),
      valor: reais(140),
      forn: "Hidráulica Souza",
      desc: "Troca de sifão e flexível",
      m: "Vazamento na pia da cozinha",
    },
    {
      imovel: "CASA-03",
      cat: "Manutenção",
      data: ha(1, 22),
      valor: reais(260),
      forn: "Jardinagem Verde Vida",
      desc: "Poda e limpeza do quintal",
      m: "Poda das árvores e limpeza do quintal",
    },
    {
      imovel: "SALA-105",
      cat: "Reforma",
      data: ha(1, 15),
      valor: reais(3800),
      forn: "Construtora Alvorada",
      desc: "Piso porcelanato e rodapés (1ª parcela)",
      m: "Reforma geral: piso e pintura",
    },
    {
      imovel: "SALA-105",
      cat: "Material",
      data: ha(0, 3),
      valor: reais(920),
      forn: "Casa do Construtor",
      desc: "Tinta, massa e acessórios",
      m: "Reforma geral: piso e pintura",
    },
    {
      imovel: "CASA-07",
      cat: "Manutenção",
      data: ha(0, 4),
      valor: reais(380),
      forn: "Hidráulica Souza",
      desc: "Caça-vazamento e abertura da parede",
      m: "Vazamento no banheiro social",
    },
    // Despesas recorrentes dos imóveis vagos (condomínio, IPTU, água, energia)
    {
      imovel: "KIT-04",
      cat: "Condomínio",
      data: ha(0, 5),
      valor: reais(150),
      forn: "Condomínio Ed. ADM",
      desc: "Condomínio do mês",
    },
    {
      imovel: "KIT-04",
      cat: "Condomínio",
      data: ha(1, 5),
      valor: reais(150),
      forn: "Condomínio Ed. ADM",
      desc: "Condomínio do mês",
    },
    {
      imovel: "KIT-04",
      cat: "Energia",
      data: ha(0, 8),
      valor: reais(48),
      forn: "CPFL",
      desc: "Conta de energia (taxa mínima)",
    },
    {
      imovel: "PAL-202",
      cat: "Condomínio",
      data: ha(0, 5),
      valor: reais(320),
      forn: "Condomínio Palmeiras",
      desc: "Condomínio do mês",
    },
    {
      imovel: "PAL-202",
      cat: "Condomínio",
      data: ha(1, 5),
      valor: reais(320),
      forn: "Condomínio Palmeiras",
      desc: "Condomínio do mês",
    },
    {
      imovel: "PAL-202",
      cat: "Condomínio",
      data: ha(2, 5),
      valor: reais(320),
      forn: "Condomínio Palmeiras",
      desc: "Condomínio do mês",
    },
    {
      imovel: "PAL-302",
      cat: "Condomínio",
      data: ha(0, 5),
      valor: reais(340),
      forn: "Condomínio Palmeiras",
      desc: "Condomínio do mês",
    },
    {
      imovel: "SALA-104",
      cat: "Condomínio",
      data: ha(0, 5),
      valor: reais(430),
      forn: "Condomínio Centro Empresarial",
      desc: "Condomínio do mês",
    },
    {
      imovel: "SALA-104",
      cat: "Condomínio",
      data: ha(1, 5),
      valor: reais(430),
      forn: "Condomínio Centro Empresarial",
      desc: "Condomínio do mês",
    },
    {
      imovel: "SALA-105",
      cat: "Condomínio",
      data: ha(0, 5),
      valor: reais(410),
      forn: "Condomínio Centro Empresarial",
      desc: "Condomínio do mês",
    },
    {
      imovel: "CASA-03",
      cat: "Condomínio",
      data: ha(0, 5),
      valor: reais(350),
      forn: "Condomínio Vila Verde",
      desc: "Condomínio do mês",
    },
    {
      imovel: "CASA-03",
      cat: "Água",
      data: ha(0, 9),
      valor: reais(62),
      forn: "SAAEB",
      desc: "Conta de água",
    },
    {
      imovel: "CASA-04",
      cat: "Condomínio",
      data: ha(0, 5),
      valor: reais(350),
      forn: "Condomínio Vila Verde",
      desc: "Condomínio do mês",
    },
    {
      imovel: "TERRENO-01",
      cat: "IPTU",
      data: ha(8, 20),
      valor: reais(600),
      forn: "Prefeitura de Barretos",
      desc: "IPTU 2026 (cota única)",
    },
    {
      imovel: "GALPAO-01",
      cat: "IPTU",
      data: ha(8, 20),
      valor: reais(4200),
      forn: "Prefeitura de Barretos",
      desc: "IPTU 2026 (cota única)",
    },
    {
      imovel: "CASA-01",
      cat: "Seguro",
      data: ha(5, 10),
      valor: reais(780),
      forn: "Porto Seguro",
      desc: "Seguro incêndio anual",
    },
    {
      imovel: "SALA-103",
      cat: "Seguro",
      data: ha(5, 10),
      valor: reais(1250),
      forn: "Porto Seguro",
      desc: "Seguro incêndio anual",
    },
    {
      imovel: "ADM-01",
      cat: "Taxas e cartório",
      data: ha(14, 3),
      valor: reais(210),
      forn: "2º Cartório de Notas",
      desc: "Reconhecimento de firma do contrato",
    },
    {
      imovel: "CASA-05",
      cat: "Manutenção",
      data: ha(4, 12),
      valor: reais(430),
      forn: "Elétrica Barretos",
      desc: "Troca da fiação da cozinha",
    },
    {
      imovel: "CASA-06",
      cat: "Manutenção",
      data: ha(2, 17),
      valor: reais(250),
      forn: "Serralheria Aço Forte",
      desc: "Conserto do portão",
    },
    {
      imovel: "KIT-02",
      cat: "Reforma",
      data: ha(3, 2),
      valor: reais(1100),
      forn: "Pinturas Rio Pardo",
      desc: "Reforma antes da locação",
    },
  ];
  for (const d of DESPESAS) {
    await db.despesa.create({
      data: {
        imovelId: id(d.imovel),
        categoriaId: cat(d.cat),
        manutencaoId: d.m ? manutIds.get(d.m) : null,
        data: d.data,
        valor: d.valor,
        fornecedor: d.forn,
        descricao: d.desc,
        pago: true,
        criadoPorId: adminId,
      },
    });
  }
  console.log(`✓ ${MANUT.length} manutenções e ${DESPESAS.length} despesas`);
}

async function main() {
  const admin = await db.user.findFirst({ where: { role: "admin" } });
  if (!admin) throw new Error("Rode `npm run db:seed` antes (falta o administrador).");

  if (await db.empreendimento.findFirst({ where: { nome: PALMEIRAS } })) {
    // Execução anterior interrompida antes das manutenções/despesas: só completa essa parte.
    if ((await db.despesa.count()) <= 1) {
      const todos = await db.imovel.findMany({ select: { id: true, codigo: true } });
      await seedOperacao(admin.id, new Map(todos.map((i) => [i.codigo, i.id])));
      return;
    }
    console.log("· Massa de teste já existe — nada a fazer.");
    return;
  }

  // ── Empreendimentos
  const empIds = new Map<string, string>();
  const adm = await db.empreendimento.findFirst({ where: { nome: EDI_ADM } });
  if (adm) empIds.set(EDI_ADM, adm.id);
  for (const e of EMPREENDIMENTOS) {
    const criado = await db.empreendimento.create({
      data: {
        nome: e.nome,
        logradouro: e.logradouro,
        numero: e.numero,
        bairro: e.bairro,
        cep: e.cep,
        cidade: "Barretos",
        uf: "SP",
        observacoes: e.obs,
      },
    });
    empIds.set(e.nome, criado.id);
  }
  console.log(`✓ ${EMPREENDIMENTOS.length} empreendimentos`);

  // ── Pessoas
  let seq = 1;
  const endereco = (i: number) => ({
    logradouro: RUAS[i % RUAS.length],
    numero: String(100 + ((i * 37) % 800)),
    bairro: BAIRROS[i % BAIRROS.length],
    cidade: "Barretos",
    uf: "SP",
    cep: `1478${String(1000 + i * 13).slice(0, 4)}`,
  });
  const criarPF = (p: PessoaSpec) => {
    const i = seq++;
    const [primeiro, ...resto] = p.nome.split(" ");
    const email = `${primeiro}.${resto[resto.length - 1]}`
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
    return db.pessoa.create({
      data: {
        tipo: "PF",
        papeis: [p.papel],
        nome: p.nome,
        documento: cpf(i),
        rg: `${30 + (i % 20)}.${100 + i * 7}.${200 + i * 3}-${i % 10}`,
        orgaoEmissor: "SSP/SP",
        dataNascimento: utcDate(p.nasc ?? 1985, 1 + (i % 12), 1 + ((i * 3) % 27)),
        estadoCivil: p.civil,
        profissao: p.profissao,
        rendaMensal: p.renda,
        email: `${email}@exemplo.com.br`,
        telefone1: `1799${String(1000000 + i * 40321).slice(0, 7)}`,
        telefone1Whats: i % 4 !== 0,
        ...endereco(i),
      },
    });
  };

  const inquilinos: Pessoa[] = [];
  for (const p of INQUILINOS) inquilinos.push(await criarPF(p));
  const fiadores: Pessoa[] = [];
  for (const p of FIADORES) fiadores.push(await criarPF(p));
  const pjs: Pessoa[] = [];
  for (const p of PJS) {
    const i = seq++;
    pjs.push(
      await db.pessoa.create({
        data: {
          tipo: "PJ",
          papeis: ["INQUILINO"],
          nome: p.nome,
          nomeFantasia: p.fantasia,
          documento: cnpj(i),
          representanteNome: p.rep,
          representanteDocumento: cpf(900 + i),
          email: `contato@${p.fantasia.toLowerCase().replace(/[^a-z]/g, "")}.com.br`,
          telefone1: `1732${String(100000 + i * 5117).slice(0, 6)}`,
          telefone1Whats: false,
          ...endereco(i),
          logradouro: "Rua Dezoito",
          bairro: "Centro",
        },
      }),
    );
  }
  const donoAdm = await criarPF({
    nome: "Helena Pina Marques",
    papel: "PROPRIETARIO",
    profissao: "Empresária",
    civil: "CASADO",
    nasc: 1962,
  });
  const donoPal = await criarPF({
    nome: "Fernando Pina Marques",
    papel: "PROPRIETARIO",
    profissao: "Empresário",
    civil: "CASADO",
    nasc: 1959,
  });
  const donoPj = await db.pessoa.create({
    data: {
      tipo: "PJ",
      papeis: ["PROPRIETARIO"],
      nome: "Pina's Empreendimentos Ltda",
      nomeFantasia: "Pina's Empreendimentos",
      documento: cnpj(77),
      representanteNome: "Helena Pina Marques",
      representanteDocumento: donoAdm.documento,
      email: "contato@pinasempreendimentos.com.br",
      telefone1: "1733221100",
      telefone1Whats: false,
      logradouro: "Rua Vinte e Oito",
      numero: "1234",
      bairro: "Centro",
      cidade: "Barretos",
      uf: "SP",
      cep: "14780000",
    },
  });
  const donos = { ADM: donoAdm, PAL: donoPal, PJ: donoPj };
  console.log(
    `✓ ${await db.pessoa.count()} pessoas no total (inquilinos, fiadores, proprietários e empresas)`,
  );

  // ── Imóveis (+ fotos)
  const fotos = await carregarFotos();
  const imoveis = new Map<string, string>();
  let n = 0;
  for (const i of IMOVEIS) {
    const criado = await db.imovel.create({
      data: {
        codigo: i.codigo,
        titulo: i.titulo,
        tipo: i.tipo,
        status: i.status,
        empreendimentoId: i.emp ? empIds.get(i.emp) : null,
        proprietarioId: donos[i.dono].id,
        logradouro: i.rua,
        numero: i.numero,
        complemento: i.compl,
        bairro: i.bairro,
        cep: i.cep,
        cidade: "Barretos",
        uf: "SP",
        quartos: i.q ?? 0,
        suites: i.s ?? 0,
        banheiros: i.b ?? 0,
        vagas: i.v ?? 0,
        areaM2: i.area,
        mobilia: i.mobilia ?? "NAO",
        aceitaPet: i.pet ?? false,
        caracteristicas: i.carac,
        valorAluguel: i.aluguel,
        valorCondominio: i.cond,
        valorIptuAnual: i.iptu,
        descricao: i.desc,
        matricula: String(12000 + n * 17),
        inscricaoIptu: `01.${20 + n}.${100 + n * 3}.0001`,
      },
    });
    imoveis.set(i.codigo, criado.id);
    if (i.tipo !== "TERRENO") await anexarFotos(criado.id, fotos, n);
    n++;
  }
  await db.imovel.updateMany({
    where: { codigo: "ADM-02" },
    data: { proprietarioId: donoAdm.id },
  });
  console.log(`✓ ${IMOVEIS.length} imóveis (com fotos)`);

  // ── Contratos, cobranças e pagamentos
  const modelo = await db.modeloContrato.findFirst({ where: { padrao: true } });
  const partesDe = (c: ContratoSpec) => {
    const inq = c.inq >= 100 ? pjs[c.inq - 100] : inquilinos[c.inq];
    const partes: { pessoaId: string; papel: "LOCATARIO" | "FIADOR"; principal?: boolean }[] = [
      { pessoaId: inq.id, papel: "LOCATARIO", principal: true },
    ];
    if (c.fiador != null) partes.push({ pessoaId: fiadores[c.fiador].id, papel: "FIADOR" });
    return partes;
  };

  let totalCobrancas = 0;
  let totalPagamentos = 0;
  let k = 0;

  async function criarContrato(
    c: ContratoSpec,
    opts: {
      inicio: Date;
      prazo: number;
      status: ContratoSpec["status"];
      encerramento?: Date;
      anteriorId?: string;
      valorBase?: number;
    },
  ) {
    const imovel = IMOVEIS.find((x) => x.codigo === c.imovel)!;
    const imovelId = imoveis.get(c.imovel)!;
    const valorInicial = opts.valorBase ?? imovel.aluguel;
    const encargosBase = imovel.cond ? [{ descricao: "Condomínio", valor: imovel.cond }] : [];
    const valorEncargos = encargosBase.reduce((a, e) => a + e.valor, 0);
    const dataFim = calcularDataFim(opts.inicio, opts.prazo);

    // Reajuste anual (só se o aniversário já passou).
    let valorAtual = valorInicial;
    let reajuste: {
      dataAplicacao: Date;
      competenciaInicio: Date;
      percentual: number;
      novo: number;
    } | null = null;
    if (c.reajuste && opts.status !== "RENOVADO") {
      const aniversario = addMonths(opts.inicio, 12);
      if (aniversario <= hoje) {
        valorAtual = reajustar(valorInicial, c.reajuste.perc);
        reajuste = {
          dataAplicacao: aniversario,
          competenciaInicio: utcDate(
            aniversario.getUTCFullYear(),
            aniversario.getUTCMonth() + 1,
            1,
          ),
          percentual: c.reajuste.perc,
          novo: valorAtual,
        };
      }
    }

    const contrato = await db.contrato.create({
      data: {
        status: opts.status ?? "ATIVO",
        finalidade: c.finalidade ?? "RESIDENCIAL",
        imovelId,
        dataInicio: opts.inicio,
        prazoMeses: opts.prazo,
        dataFim,
        valorAluguel: valorAtual,
        valorInicial,
        diaVencimento: c.dia,
        aluguelAntecipado: c.antecipado ?? false,
        indiceReajuste: c.reajuste?.indice ?? "IGPM",
        garantia: c.garantia,
        caucaoValor: c.garantia === "CAUCAO" ? valorInicial * 2 : null,
        seguradora: c.garantia === "SEGURO_FIANCA" ? "Porto Seguro" : null,
        apolice: c.garantia === "SEGURO_FIANCA" ? `PS-${202600 + k}` : null,
        dataEncerramento: opts.encerramento ?? null,
        motivoEncerramento:
          opts.status === "RESCINDIDO"
            ? "Rescisão amigável a pedido do locatário (mudança de cidade)"
            : opts.status === "ENCERRADO"
              ? "Término do prazo — imóvel devolvido"
              : opts.status === "RENOVADO"
                ? "Renovado por novo contrato"
                : null,
        valorMultaRescisoria: null,
        contratoAnteriorId: opts.anteriorId ?? null,
        modeloId: modelo?.id,
        criadoPorId: admin!.id,
        partes: { create: partesDe(c) },
        encargos: { create: encargosBase },
        reajustes: reajuste
          ? {
              create: [
                {
                  dataAplicacao: reajuste.dataAplicacao,
                  competenciaInicio: reajuste.competenciaInicio,
                  indice: c.reajuste!.indice,
                  percentual: reajuste.percentual,
                  valorAnterior: valorInicial,
                  valorNovo: reajuste.novo,
                  observacao: "Reajuste anual aplicado automaticamente",
                },
              ],
            }
          : undefined,
      },
    });

    if (opts.status === "RASCUNHO") return contrato;

    // Vistoria de entrada
    await db.vistoria.create({
      data: {
        contratoId: contrato.id,
        tipo: "ENTRADA",
        data: opts.inicio,
        responsavel: "Equipe Pina's",
        observacoes: "Imóvel entregue limpo e pintado; chaves conferidas.",
      },
    });
    if (opts.status === "ENCERRADO" || opts.status === "RESCINDIDO") {
      await db.vistoria.create({
        data: {
          contratoId: contrato.id,
          tipo: "SAIDA",
          data: opts.encerramento ?? dataFim,
          responsavel: "Equipe Pina's",
          observacoes: "Vistoria de saída sem pendências relevantes.",
        },
      });
    }

    // Cobranças previstas
    let previstas = gerarCobrancas({
      dataInicio: opts.inicio,
      prazoMeses: opts.prazo,
      diaVencimento: c.dia,
      valorAluguel: valorInicial,
      valorEncargos,
      aluguelAntecipado: c.antecipado ?? false,
    });
    if (opts.status === "RESCINDIDO" && opts.encerramento) {
      const fim = opts.encerramento;
      previstas = previstas
        .filter((p) => p.competencia <= fim)
        .map((p) => {
          if (p.periodoFim <= fim) return p;
          const aluguel = valorDoPeriodo(valorInicial, p.periodoInicio, fim);
          const enc = valorDoPeriodo(valorEncargos, p.periodoInicio, fim);
          return {
            ...p,
            periodoFim: fim,
            valorAluguel: aluguel.valor,
            valorEncargos: enc.valor,
            valorTotal: aluguel.valor + enc.valor,
            proporcional: true,
          };
        });
    }
    previstas = previstas.map((p) => {
      if (reajuste && p.competencia >= reajuste.competenciaInicio && !p.proporcional) {
        return { ...p, valorAluguel: valorAtual, valorTotal: valorAtual + p.valorEncargos };
      }
      return p;
    });

    // Quais já venceram (com folga de 2 dias para o "próximo dia útil")
    const vencidas = previstas.filter((p) => p.vencimento < addDays(hoje, -2));
    const ultimasAbertas =
      c.perfil === "atrasado2" ? 2 : c.perfil === "atrasado1" || c.perfil === "parcial" ? 1 : 0;
    const encerrado =
      opts.status === "ENCERRADO" || opts.status === "RESCINDIDO" || opts.status === "RENOVADO";

    for (const p of previstas) {
      const idxVencida = vencidas.indexOf(p);
      const vencida = idxVencida !== -1;
      const abertaAgora = !encerrado && vencida && idxVencida >= vencidas.length - ultimasAbertas;
      const parcial = abertaAgora && c.perfil === "parcial";

      let status: "PENDENTE" | "PAGO" | "PAGO_PARCIAL" = "PENDENTE";
      if (vencida && !abertaAgora) status = "PAGO";
      if (parcial) status = "PAGO_PARCIAL";

      const pagamentos: {
        dataPagamento: Date;
        valorPrincipal: number;
        valorMulta: number;
        valorJuros: number;
        valorPago: number;
        forma: (typeof FORMAS)[number];
        registradoPorId: string;
        observacao?: string;
      }[] = [];

      if (status === "PAGO") {
        const atraso = (k + idxVencida) % 6 === 0 ? 4 : 0; // 1 a cada 6 paga com atraso
        const multa = atraso ? Math.round(p.valorTotal * 0.1) : 0;
        const juros = atraso ? Math.round((p.valorTotal * 0.01 * atraso) / 30) : 0;
        pagamentos.push({
          dataPagamento: minDate(
            addDays(p.vencimento, atraso ? atraso : -((k + idxVencida) % 3)),
            hoje,
          ),
          valorPrincipal: p.valorTotal,
          valorMulta: multa,
          valorJuros: juros,
          valorPago: p.valorTotal + multa + juros,
          forma: FORMAS[(k + idxVencida) % FORMAS.length],
          registradoPorId: admin!.id,
        });
      } else if (status === "PAGO_PARCIAL") {
        const metade = Math.round(p.valorTotal / 2);
        pagamentos.push({
          dataPagamento: addDays(p.vencimento, 1),
          valorPrincipal: metade,
          valorMulta: 0,
          valorJuros: 0,
          valorPago: metade,
          forma: "PIX",
          registradoPorId: admin!.id,
          observacao: "Pagou metade e combinou o restante para a próxima semana.",
        });
      }

      await db.cobranca.create({
        data: {
          contratoId: contrato.id,
          competencia: p.competencia,
          periodoInicio: p.periodoInicio,
          periodoFim: p.periodoFim,
          vencimento: p.vencimento,
          valorAluguel: p.valorAluguel,
          valorEncargos: p.valorEncargos,
          valorTotal: p.valorTotal,
          proporcional: p.proporcional,
          status,
          pagamentos: pagamentos.length ? { create: pagamentos } : undefined,
        },
      });
      totalCobrancas++;
      totalPagamentos += pagamentos.length;
    }

    // Multa rescisória (já paga)
    if (opts.status === "RESCINDIDO" && opts.encerramento) {
      const restante = opts.prazo - 7;
      const multa = Math.round((3 * valorInicial * restante) / opts.prazo);
      const comp = utcDate(
        opts.encerramento.getUTCFullYear(),
        opts.encerramento.getUTCMonth() + 1,
        1,
      );
      await db.contrato.update({
        where: { id: contrato.id },
        data: { valorMultaRescisoria: multa },
      });
      await db.cobranca.create({
        data: {
          contratoId: contrato.id,
          tipo: "MULTA_RESCISORIA",
          competencia: comp,
          periodoInicio: opts.encerramento,
          periodoFim: opts.encerramento,
          vencimento: addDays(opts.encerramento, 10),
          valorAluguel: multa,
          valorTotal: multa,
          status: "PAGO",
          observacao: "Multa proporcional ao tempo restante do contrato.",
          pagamentos: {
            create: [
              {
                dataPagamento: addDays(opts.encerramento, 8),
                valorPrincipal: multa,
                valorPago: multa,
                forma: "TRANSFERENCIA",
                registradoPorId: admin!.id,
              },
            ],
          },
        },
      });
      totalCobrancas++;
      totalPagamentos++;
    }
    return contrato;
  }

  for (const c of CONTRATOS) {
    k++;
    const status = c.status ?? "ATIVO";

    if (c.anterior) {
      // Contrato anterior (12 meses), já renovado pelo atual.
      const anteriorInicio = addMonths(c.inicio, -12);
      const imovel = IMOVEIS.find((x) => x.codigo === c.imovel)!;
      const anterior = await criarContrato(
        { ...c, reajuste: undefined },
        {
          inicio: anteriorInicio,
          prazo: 12,
          status: "RENOVADO",
          valorBase: Math.round(imovel.aluguel * 0.93),
        },
      );
      await criarContrato(c, {
        inicio: c.inicio,
        prazo: c.prazo,
        status: "ATIVO",
        anteriorId: anterior.id,
      });
      continue;
    }

    await criarContrato(c, {
      inicio: c.inicio,
      prazo: c.prazo,
      status,
      encerramento: status === "ENCERRADO" ? calcularDataFim(c.inicio, c.prazo) : c.rescisao,
    });
  }
  console.log(
    `✓ ${CONTRATOS.length + 1} contratos, ${totalCobrancas} cobranças e ${totalPagamentos} pagamentos`,
  );

  await seedOperacao(admin.id, imoveis);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
