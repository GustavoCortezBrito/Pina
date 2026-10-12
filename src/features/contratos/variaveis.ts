export type Variavel = { chave: string; rotulo: string; exemplo: string };
export type GrupoVariaveis = { grupo: string; itens: Variavel[] };

/** Variáveis que o gerador de contrato sabe preencher; usadas pelo editor de modelos. */
export const VARIAVEIS: GrupoVariaveis[] = [
  {
    grupo: "Locatário (inquilino)",
    itens: [
      { chave: "locatario.nome", rotulo: "Nome", exemplo: "João da Silva" },
      { chave: "locatario.documento", rotulo: "CPF/CNPJ", exemplo: "529.982.247-25" },
      { chave: "locatario.rg", rotulo: "RG", exemplo: "34.567.890-1" },
      { chave: "locatario.nacionalidade", rotulo: "Nacionalidade", exemplo: "brasileiro(a)" },
      { chave: "locatario.estadoCivil", rotulo: "Estado civil", exemplo: "casado(a)" },
      { chave: "locatario.profissao", rotulo: "Profissão", exemplo: "técnico agrícola" },
      { chave: "locatario.endereco", rotulo: "Endereço", exemplo: "Rua Vinte e Oito, 1234 – Centro" },
    ],
  },
  {
    grupo: "Locador (dono)",
    itens: [
      { chave: "locador.nome", rotulo: "Nome", exemplo: "Pina's Empreendimentos" },
      { chave: "locador.documento", rotulo: "CPF/CNPJ", exemplo: "12.345.678/0001-90" },
      { chave: "locador.endereco", rotulo: "Endereço", exemplo: "Av. Central, 100" },
      { chave: "locador.cidade", rotulo: "Cidade/UF (foro)", exemplo: "Barretos/SP" },
    ],
  },
  {
    grupo: "Imóvel",
    itens: [
      { chave: "imovel.titulo", rotulo: "Nome do imóvel", exemplo: "Apto 02 – Ed. ADM" },
      { chave: "imovel.endereco", rotulo: "Endereço completo", exemplo: "Rua Vinte e Oito, 1234 – Barretos/SP" },
    ],
  },
  {
    grupo: "Condições do contrato",
    itens: [
      { chave: "contrato.dataInicio", rotulo: "Data de início", exemplo: "01/09/2026" },
      { chave: "contrato.dataFim", rotulo: "Data de término", exemplo: "28/02/2029" },
      { chave: "contrato.prazoExtenso", rotulo: "Prazo por extenso", exemplo: "30 (trinta) meses" },
      { chave: "contrato.valorAluguel", rotulo: "Valor do aluguel", exemplo: "R$ 1.500,00" },
      { chave: "contrato.valorAluguelExtenso", rotulo: "Aluguel por extenso", exemplo: "mil e quinhentos reais" },
      { chave: "contrato.diaVencimento", rotulo: "Dia do vencimento", exemplo: "10" },
      { chave: "contrato.formaPagamentoTexto", rotulo: "Forma de pagamento", exemplo: "via Pix" },
      { chave: "contrato.encargosBloco", rotulo: "Bloco de encargos", exemplo: "(lista de encargos do contrato)" },
      { chave: "contrato.percMulta", rotulo: "% de multa", exemplo: "2%" },
      { chave: "contrato.percJuros", rotulo: "% de juros ao mês", exemplo: "1%" },
      { chave: "contrato.indiceReajuste", rotulo: "Índice de reajuste", exemplo: "IGP-M (FGV)" },
      { chave: "contrato.multaRescisoriaMeses", rotulo: "Multa rescisória (meses)", exemplo: "3" },
      { chave: "contrato.garantiaTexto", rotulo: "Texto da garantia", exemplo: "fiança prestada por…" },
    ],
  },
  {
    grupo: "Fiadores e data",
    itens: [
      { chave: "fiadores.bloco", rotulo: "Bloco de fiadores", exemplo: "(qualificação dos fiadores)" },
      { chave: "fiadores.assinaturas", rotulo: "Assinaturas dos fiadores", exemplo: "(linhas de assinatura)" },
      { chave: "data.hoje", rotulo: "Data de hoje", exemplo: "12 de outubro de 2026" },
    ],
  },
];

export const MAPA_VARIAVEIS = new Map(VARIAVEIS.flatMap((g) => g.itens).map((v) => [v.chave, v]));
