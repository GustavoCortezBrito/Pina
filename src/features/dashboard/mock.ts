// Dados de exemplo para montar o visual do painel. Serão trocados por agregações
// reais do Prisma na etapa de integração com o banco.

export const RESUMO_MOCK = {
  totalUnidades: 42,
  ocupadas: 37,
  vagas: 4,
  emReforma: 1,
  recebidoMes: 3_840_000,
  aReceberMes: 620_000,
  emAtrasoValor: 215_000,
  emAtrasoQtde: 3,
};

export const COBRANCAS_ATRASADAS_MOCK = [
  { id: "1", imovel: "ADM-02", inquilino: "João da Silva", diasAtraso: 12, valor: 150_000 },
  { id: "2", imovel: "KITNET-05", inquilino: "Maria Oliveira", diasAtraso: 5, valor: 65_000 },
  { id: "3", imovel: "CASA-11", inquilino: "Pedro Santos", diasAtraso: 20, valor: 0 },
];

export const VENCENDO_SEMANA_MOCK = [
  { id: "4", imovel: "KITNET-03", inquilino: "Ana Paula", vencimento: "20/10", valor: 95_000 },
  { id: "5", imovel: "ADM-06", inquilino: "Carlos Mendes", vencimento: "22/10", valor: 180_000 },
];

export const CONTRATOS_VENCENDO_MOCK = [
  { id: "6", imovel: "CASA-02", inquilino: "Fernanda Lima", dataFim: "15/12/2026" },
  { id: "7", imovel: "ADM-01", inquilino: "Roberto Alves", dataFim: "03/01/2027" },
];

export const REAJUSTES_PROXIMOS_MOCK = [
  { id: "8", imovel: "CASA-07", inquilino: "Juliana Costa", data: "28/10/2026", indice: "IGP-M" },
];

export const RECEITA_DESPESA_MOCK = [
  { mes: "Nov/25", receita: 3_200_000, despesa: 540_000 },
  { mes: "Dez/25", receita: 3_450_000, despesa: 890_000 },
  { mes: "Jan/26", receita: 3_300_000, despesa: 410_000 },
  { mes: "Fev/26", receita: 3_500_000, despesa: 620_000 },
  { mes: "Mar/26", receita: 3_600_000, despesa: 480_000 },
  { mes: "Abr/26", receita: 3_550_000, despesa: 710_000 },
  { mes: "Mai/26", receita: 3_700_000, despesa: 390_000 },
  { mes: "Jun/26", receita: 3_680_000, despesa: 530_000 },
  { mes: "Jul/26", receita: 3_750_000, despesa: 600_000 },
  { mes: "Ago/26", receita: 3_800_000, despesa: 450_000 },
  { mes: "Set/26", receita: 3_820_000, despesa: 670_000 },
  { mes: "Out/26", receita: 3_840_000, despesa: 320_000 },
];
