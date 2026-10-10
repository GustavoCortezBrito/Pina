import type { ContratoParaPdf } from "@/features/contratos/queries";
import { formatDate, formatDateLong, today } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import { formatDocumento, formatEndereco, formatNumeroContrato, formatPercent } from "@/lib/format";
import { ESTADO_CIVIL, INDICE_REAJUSTE } from "@/lib/labels";
import { numeroPorExtenso, valorPorExtenso } from "@/lib/extenso";
import type { Locador } from "@/features/configuracoes/schemas";

function qualificacaoPessoa(pessoa: ContratoParaPdf["partes"][number]["pessoa"]): string {
  if (pessoa.tipo === "PJ") {
    return `${pessoa.nome}, pessoa jurídica inscrita no CNPJ sob nº ${formatDocumento(pessoa.documento)}, com sede em ${formatEndereco(pessoa)}${pessoa.representanteNome ? `, neste ato representada por ${pessoa.representanteNome}` : ""}`;
  }
  const partes = [
    pessoa.nacionalidade || "brasileiro(a)",
    pessoa.estadoCivil ? ESTADO_CIVIL[pessoa.estadoCivil].toLowerCase() : null,
    pessoa.profissao || null,
  ].filter(Boolean);
  return `${pessoa.nome}, ${partes.join(", ")}, portador(a) do RG nº ${pessoa.rg || "—"} e do CPF nº ${formatDocumento(pessoa.documento)}, residente e domiciliado(a) em ${formatEndereco(pessoa)}`;
}

function garantiaTexto(contrato: ContratoParaPdf, fiadorNome?: string): string {
  switch (contrato.garantia) {
    case "FIADOR":
      return `A garantia desta locação é a fiança prestada por ${fiadorNome ?? "o fiador qualificado neste contrato"}, que responde solidariamente por todas as obrigações do LOCATÁRIO até a efetiva entrega das chaves.`;
    case "CAUCAO":
      return `A garantia desta locação é a caução em dinheiro no valor de ${formatBRL(contrato.caucaoValor)}, que será restituída ao LOCATÁRIO ao final do contrato, descontados eventuais débitos ou danos ao imóvel.`;
    case "SEGURO_FIANCA":
      return `A garantia desta locação é o seguro-fiança contratado junto à ${contrato.seguradora || "seguradora indicada"}, apólice nº ${contrato.apolice || "—"}.`;
    case "TITULO_CAPITALIZACAO":
      return "A garantia desta locação é o título de capitalização vinculado a este contrato, conforme documentação em anexo.";
    default:
      return "Esta locação não possui garantia específica, nos termos acordados entre as partes.";
  }
}

export function montarVariaveisContrato(contrato: ContratoParaPdf, locador: Locador): Record<string, string> {
  const locatario = contrato.partes.find((p) => p.papel === "LOCATARIO")?.pessoa;
  const fiador = contrato.partes.find((p) => p.papel === "FIADOR")?.pessoa;

  const fiadoresBloco = fiador
    ? `**FIADOR:** ${qualificacaoPessoa(fiador)}.`
    : "";
  const fiadoresAssinaturas = fiador
    ? `\n___________________________________________\n${fiador.nome} — FIADOR`
    : "";

  const encargosBloco =
    contrato.encargos.length > 0
      ? `Além do aluguel, são encargos mensais de responsabilidade do LOCATÁRIO: ${contrato.encargos
          .map((e) => `${e.descricao} (${formatBRL(e.valor)})`)
          .join(", ")}.`
      : "";

  return {
    "locador.nome": locador.nome || "—",
    "locador.documento": formatDocumento(locador.documento),
    "locador.endereco": locador.endereco || "—",
    "locador.cidade": locador.cidade || "Barretos/SP",

    "locatario.nome": locatario?.nome ?? "—",
    "locatario.nacionalidade": locatario?.nacionalidade || "brasileiro(a)",
    "locatario.estadoCivil": locatario?.estadoCivil ? ESTADO_CIVIL[locatario.estadoCivil].toLowerCase() : "—",
    "locatario.profissao": locatario?.profissao || "—",
    "locatario.rg": locatario?.rg || "—",
    "locatario.documento": locatario ? formatDocumento(locatario.documento) : "—",
    "locatario.endereco": locatario ? formatEndereco(locatario) : "—",

    "fiadores.bloco": fiadoresBloco,
    "fiadores.assinaturas": fiadoresAssinaturas,

    "imovel.endereco": formatEndereco(contrato.imovel),
    "imovel.titulo": contrato.imovel.titulo,

    "contrato.numero": formatNumeroContrato(contrato.numero),
    "contrato.prazoExtenso": `${contrato.prazoMeses} (${numeroPorExtenso(contrato.prazoMeses)}) meses`,
    "contrato.dataInicio": formatDate(contrato.dataInicio),
    "contrato.dataFim": formatDate(contrato.dataFim),
    "contrato.valorAluguel": formatBRL(contrato.valorAluguel),
    "contrato.valorAluguelExtenso": valorPorExtenso(contrato.valorAluguel),
    "contrato.diaVencimento": String(contrato.diaVencimento),
    "contrato.formaPagamentoTexto": "mediante depósito, transferência ou Pix em conta indicada pelo LOCADOR",
    "contrato.encargosBloco": encargosBloco,
    "contrato.percMulta": formatPercent(Number(contrato.percMulta)),
    "contrato.percJuros": formatPercent(Number(contrato.percJurosMes)),
    "contrato.indiceReajuste": INDICE_REAJUSTE[contrato.indiceReajuste],
    "contrato.garantiaTexto": garantiaTexto(contrato, fiador?.nome),
    "contrato.multaRescisoriaMeses": `${contrato.multaRescisoriaMeses} aluguel(éis)`,

    "data.hoje": formatDateLong(today()),
  };
}

export function substituirVariaveis(texto: string, variaveis: Record<string, string>): string {
  return texto
    .replace(/\{\{([\w.]+)\}\}/g, (match, chave: string) => variaveis[chave] ?? match)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
