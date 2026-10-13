import "server-only";
import { obterContratoParaPdf } from "@/features/contratos/queries";
import { formatNumeroContrato } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { MODELO_COMERCIAL_PADRAO, MODELO_RESIDENCIAL_PADRAO } from "./default-templates";
import { montarVariaveisContrato, substituirVariaveis } from "./template";

/** Texto final do contrato (modelo com as variáveis já preenchidas): serve para o PDF e para a prévia na tela. */
export async function montarDocumentoContrato(id: string) {
  const contrato = await obterContratoParaPdf(id);
  if (!contrato) return null;

  const settings = await getSettings();
  const variaveis = montarVariaveisContrato(contrato, settings.locador);
  // Modelo cadastrado por texto > modelo padrão do sistema para a finalidade (um modelo
  // "por arquivo" cadastrado não tem texto para substituir variáveis, então também cai aqui).
  const modeloPadraoSistema =
    contrato.finalidade === "COMERCIAL" ? MODELO_COMERCIAL_PADRAO : MODELO_RESIDENCIAL_PADRAO;

  return {
    numero: formatNumeroContrato(contrato.numero),
    titulo: `Contrato nº ${formatNumeroContrato(contrato.numero)}`,
    locadorNome: settings.locador.nome,
    conteudo: substituirVariaveis(contrato.modelo?.conteudo ?? modeloPadraoSistema, variaveis),
    modeloNome: contrato.modelo?.nome ?? "Modelo padrão do sistema",
  };
}
