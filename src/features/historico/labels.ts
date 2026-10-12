export const ACAO_LABEL: Record<string, { verbo: string; filtro: string; tom: "criou" | "editou" | "excluiu" | "outro" }> = {
  CREATE: { verbo: "cadastrou", filtro: "Cadastros", tom: "criou" },
  UPDATE: { verbo: "alterou", filtro: "Alterações", tom: "editou" },
  UPDATE_STATUS: { verbo: "mudou o status de", filtro: "Mudanças de status", tom: "editou" },
  UPDATE_ROLE: { verbo: "mudou o perfil de acesso de", filtro: "Perfis de acesso", tom: "editou" },
  DELETE: { verbo: "excluiu", filtro: "Exclusões", tom: "excluiu" },
  REAJUSTE: { verbo: "reajustou o aluguel do", filtro: "Reajustes", tom: "editou" },
  RECEBER: { verbo: "registrou pagamento na", filtro: "Pagamentos recebidos", tom: "criou" },
  UPLOAD: { verbo: "enviou o arquivo", filtro: "Envio de arquivos", tom: "criou" },
  REORDER: { verbo: "reordenou as fotos de", filtro: "Alterações", tom: "editou" },
  SET_COVER: { verbo: "definiu a capa", filtro: "Alterações", tom: "editou" },
  SET_DEFAULT: { verbo: "definiu como padrão o", filtro: "Alterações", tom: "editou" },
  PUBLISH: { verbo: "publicou no site o", filtro: "Publicações no site", tom: "criou" },
  UNPUBLISH: { verbo: "tirou do site o", filtro: "Publicações no site", tom: "excluiu" },
  RESET_PASSWORD: { verbo: "redefiniu a senha de", filtro: "Senhas", tom: "editou" },
  ACTIVATE: { verbo: "reativou o usuário", filtro: "Usuários", tom: "criou" },
  DEACTIVATE: { verbo: "desativou o usuário", filtro: "Usuários", tom: "excluiu" },
  PHOTO: { verbo: "atualizou a foto de", filtro: "Fotos de perfil", tom: "editou" },
  PHOTO_REMOVE: { verbo: "removeu a foto de", filtro: "Fotos de perfil", tom: "excluiu" },
  IMPORT: { verbo: "importou planilha de", filtro: "Importações", tom: "criou" },
  LOGIN: { verbo: "entrou no sistema", filtro: "Acessos (login)", tom: "outro" },
};

export const FILTRO_ACAO = [
  ["CREATE", "Cadastros"],
  ["UPDATE", "Alterações"],
  ["DELETE", "Exclusões"],
  ["RECEBER", "Pagamentos recebidos"],
  ["REAJUSTE", "Reajustes"],
  ["UPLOAD", "Envio de arquivos"],
  ["IMPORT", "Importações"],
  ["PHOTO", "Fotos de perfil"],
  ["PUBLISH", "Publicações no site"],
  ["LOGIN", "Acessos (login)"],
].map(([value, label]) => ({ value, label }));

export const ENTIDADE_LABEL: Record<string, string> = {
  Imovel: "imóvel",
  Empreendimento: "empreendimento",
  Pessoa: "pessoa",
  Contrato: "contrato",
  Cobranca: "cobrança",
  Despesa: "despesa",
  Manutencao: "manutenção",
  Arquivo: "arquivo",
  ModeloContrato: "modelo de contrato",
  CategoriaDespesa: "categoria de despesa",
  Configuracao: "configuração",
  User: "usuário",
};

export const FILTRO_ENTIDADE = Object.entries(ENTIDADE_LABEL)
  .filter(([key]) => key !== "User")
  .map(([value, label]) => ({ value, label: label.charAt(0).toUpperCase() + label.slice(1) }));

export const CAMPO_LABEL: Record<string, string> = {
  codigo: "Código",
  titulo: "Título",
  tipo: "Tipo",
  status: "Status",
  nome: "Nome",
  documento: "Documento",
  email: "E-mail",
  telefone1: "Telefone",
  telefone2: "Telefone 2",
  valorAluguel: "Aluguel",
  valorCondominio: "Condomínio",
  valorIptuAnual: "IPTU",
  valor: "Valor",
  descricao: "Descrição",
  fornecedor: "Fornecedor",
  data: "Data",
  quartos: "Quartos",
  banheiros: "Banheiros",
  vagas: "Vagas",
  areaM2: "Área (m²)",
  aceitaPet: "Aceita pet",
  cep: "CEP",
  logradouro: "Rua",
  numero: "Número",
  complemento: "Complemento",
  bairro: "Bairro",
  cidade: "Cidade",
  uf: "UF",
  observacoes: "Observações",
  empreendimentoId: "Empreendimento",
  proprietarioId: "Proprietário",
  categoriaId: "Categoria",
  imovelId: "Imóvel",
  matricula: "Matrícula",
  ativo: "Ativo",
};

const CAMPOS_EM_CENTAVOS = new Set(["valorAluguel", "valorCondominio", "valorIptuAnual", "valor", "valorPago", "valorAnterior", "valorNovo"]);

export function formatarValorCampo(campo: string, valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "vazio";
  if (typeof valor === "boolean") return valor ? "sim" : "não";
  if (typeof valor === "number" && CAMPOS_EM_CENTAVOS.has(campo)) {
    return (valor / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [a, m, d] = valor.split("-");
    return `${d}/${m}/${a}`;
  }
  const texto = String(valor);
  return texto.length > 60 ? `${texto.slice(0, 57)}…` : texto;
}

export function rotuloCampo(campo: string) {
  return CAMPO_LABEL[campo] ?? campo;
}
