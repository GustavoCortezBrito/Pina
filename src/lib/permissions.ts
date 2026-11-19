export const ROLES = {
  ADMIN: "admin",
  GERENTE: "gerente",
  OPERADOR: "operador",
  SITE: "site",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  operador: "Operador",
  site: "Editor do site",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  admin: "Acesso total: usuários, configurações e tudo abaixo. É o único perfil que pode excluir.",
  gerente:
    "Toda a operação: contratos, cobranças, despesas, relatórios, histórico e publicação no site. Não exclui e não acessa usuários nem configurações.",
  operador:
    "Dia a dia: imóveis, pessoas, contratos, cobranças (recebimentos e recibos) e manutenções. Não vê despesas, relatórios nem histórico, não publica no site e não exclui.",
  site: "Só imóveis, fotos e publicação no site. Não vê contratos, pessoas nem financeiro e não exclui.",
};

/** Módulos do sistema e quem pode acessá-los (hierarquia: admin > gerente > operador > site). */
export const ACESSO = {
  usuarios: [ROLES.ADMIN],
  historico: [ROLES.ADMIN, ROLES.GERENTE],
  configuracoes: [ROLES.ADMIN],
  relatorios: [ROLES.ADMIN, ROLES.GERENTE],
  despesas: [ROLES.ADMIN, ROLES.GERENTE],
  contratos: [ROLES.ADMIN, ROLES.GERENTE, ROLES.OPERADOR],
  cobrancas: [ROLES.ADMIN, ROLES.GERENTE, ROLES.OPERADOR],
  pessoas: [ROLES.ADMIN, ROLES.GERENTE, ROLES.OPERADOR],
  manutencoes: [ROLES.ADMIN, ROLES.GERENTE, ROLES.OPERADOR],
  imoveis: [ROLES.ADMIN, ROLES.GERENTE, ROLES.OPERADOR, ROLES.SITE],
  empreendimentos: [ROLES.ADMIN, ROLES.GERENTE, ROLES.OPERADOR, ROLES.SITE],
  publicarSite: [ROLES.ADMIN, ROLES.GERENTE, ROLES.SITE],
} as const satisfies Record<string, readonly Role[]>;

export type Modulo = keyof typeof ACESSO;

export function normalizeRole(role?: string | null): Role {
  return role && role in ROLE_LABEL ? (role as Role) : ROLES.OPERADOR;
}

export function can(role: string | null | undefined, modulo: Modulo) {
  return (ACESSO[modulo] as readonly Role[]).includes(normalizeRole(role));
}

/**
 * Excluir é só do administrador. A única exceção são as fotos dos imóveis: quem cuida dos imóveis
 * (inclusive o editor do site) precisa poder trocar uma foto errada.
 */
export function podeExcluirArquivo(
  role: string | null | undefined,
  arquivo: { categoria: string; imovelId: string | null },
) {
  if (role === ROLES.ADMIN) return true;
  return arquivo.categoria === "FOTO" && arquivo.imovelId != null && can(role, "imoveis");
}

/** Primeira página que o papel pode abrir (para onde redirecionar quem não tem acesso). */
export function homeFor(role: string | null | undefined) {
  return can(role, "contratos") ? "/painel" : "/imoveis";
}
