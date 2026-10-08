import type {
  CategoriaArquivo,
  EstadoCivil,
  Finalidade,
  FormaPagamento,
  IndiceReajuste,
  Mobilia,
  PapelContrato,
  PapelPessoa,
  Prioridade,
  StatusContrato,
  StatusImovel,
  StatusManutencao,
  TipoCobranca,
  TipoGarantia,
  TipoImovel,
  TipoPessoa,
  TipoVistoria,
} from "@/generated/prisma/enums";
import type { StatusCobrancaEfetivo } from "@/features/financeiro/services/encargos";

export type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "primary";

export const TIPO_IMOVEL: Record<TipoImovel, string> = {
  CASA: "Casa",
  APARTAMENTO: "Apartamento",
  KITNET: "Kitnet",
  SALA_COMERCIAL: "Sala comercial",
  GALPAO: "Galpão",
  TERRENO: "Terreno",
  OUTRO: "Outro",
};

export const STATUS_IMOVEL: Record<StatusImovel, { label: string; tone: Tone }> = {
  DISPONIVEL: { label: "Disponível", tone: "success" },
  ALUGADO: { label: "Alugado", tone: "info" },
  RESERVADO: { label: "Reservado", tone: "primary" },
  EM_REFORMA: { label: "Em reforma", tone: "warning" },
  INATIVO: { label: "Inativo", tone: "neutral" },
};

export const MOBILIA: Record<Mobilia, string> = {
  NAO: "Sem mobília",
  SEMI: "Semimobiliado",
  SIM: "Mobiliado",
};

export const TIPO_PESSOA: Record<TipoPessoa, string> = {
  PF: "Pessoa física",
  PJ: "Pessoa jurídica",
};

export const PAPEL_PESSOA: Record<PapelPessoa, string> = {
  INQUILINO: "Inquilino",
  FIADOR: "Fiador",
  PROPRIETARIO: "Proprietário",
};

export const ESTADO_CIVIL: Record<EstadoCivil, string> = {
  SOLTEIRO: "Solteiro(a)",
  CASADO: "Casado(a)",
  UNIAO_ESTAVEL: "União estável",
  DIVORCIADO: "Divorciado(a)",
  SEPARADO: "Separado(a)",
  VIUVO: "Viúvo(a)",
};

export const STATUS_CONTRATO: Record<StatusContrato, { label: string; tone: Tone }> = {
  RASCUNHO: { label: "Rascunho", tone: "neutral" },
  ATIVO: { label: "Ativo", tone: "success" },
  ENCERRADO: { label: "Encerrado", tone: "info" },
  RESCINDIDO: { label: "Rescindido", tone: "warning" },
  RENOVADO: { label: "Renovado", tone: "primary" },
};

export const TIPO_GARANTIA: Record<TipoGarantia, string> = {
  SEM_GARANTIA: "Sem garantia",
  FIADOR: "Fiador",
  CAUCAO: "Caução",
  SEGURO_FIANCA: "Seguro-fiança",
  TITULO_CAPITALIZACAO: "Título de capitalização",
};

export const INDICE_REAJUSTE: Record<IndiceReajuste, string> = {
  IGPM: "IGP-M (FGV)",
  IPCA: "IPCA (IBGE)",
  INPC: "INPC (IBGE)",
  IVAR: "IVAR (FGV)",
  FIXO: "Percentual fixo",
  NENHUM: "Sem reajuste",
};

export const FINALIDADE: Record<Finalidade, string> = {
  RESIDENCIAL: "Residencial",
  COMERCIAL: "Comercial",
};

export const PAPEL_CONTRATO: Record<PapelContrato, string> = {
  LOCATARIO: "Locatário",
  FIADOR: "Fiador",
};

export const TIPO_COBRANCA: Record<TipoCobranca, string> = {
  ALUGUEL: "Aluguel",
  MULTA_RESCISORIA: "Multa rescisória",
};

export const STATUS_COBRANCA: Record<StatusCobrancaEfetivo, { label: string; tone: Tone }> = {
  PENDENTE: { label: "Pendente", tone: "neutral" },
  ATRASADO: { label: "Atrasado", tone: "danger" },
  PAGO_PARCIAL: { label: "Pago parcial", tone: "warning" },
  PAGO: { label: "Pago", tone: "success" },
  CANCELADO: { label: "Cancelado", tone: "neutral" },
};

export const FORMA_PAGAMENTO: Record<FormaPagamento, string> = {
  PIX: "Pix",
  DINHEIRO: "Dinheiro",
  TRANSFERENCIA: "Transferência",
  BOLETO: "Boleto",
  CARTAO: "Cartão",
  OUTRO: "Outro",
};

export const STATUS_MANUTENCAO: Record<StatusManutencao, { label: string; tone: Tone }> = {
  ABERTA: { label: "Aberta", tone: "warning" },
  EM_ANDAMENTO: { label: "Em andamento", tone: "info" },
  CONCLUIDA: { label: "Concluída", tone: "success" },
  CANCELADA: { label: "Cancelada", tone: "neutral" },
};

export const PRIORIDADE: Record<Prioridade, { label: string; tone: Tone }> = {
  BAIXA: { label: "Baixa", tone: "neutral" },
  MEDIA: { label: "Média", tone: "info" },
  ALTA: { label: "Alta", tone: "warning" },
  URGENTE: { label: "Urgente", tone: "danger" },
};

export const TIPO_VISTORIA: Record<TipoVistoria, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  PERIODICA: "Periódica",
};

export const CATEGORIA_ARQUIVO: Record<CategoriaArquivo, string> = {
  FOTO: "Foto",
  DOCUMENTO: "Documento",
  CONTRATO_ASSINADO: "Contrato assinado",
  COMPROVANTE: "Comprovante",
  VISTORIA: "Vistoria",
  OUTRO: "Outro",
};

/** Transforma um Record de rótulos em opções para <Select>. */
export function options<K extends string>(
  record: Record<K, string | { label: string }>,
): Array<{ value: K; label: string }> {
  return (Object.keys(record) as K[]).map((value) => {
    const item = record[value];
    return { value, label: typeof item === "string" ? item : item.label };
  });
}
