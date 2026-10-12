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
  admin: "Acesso total: usuários, configurações, exclusões e tudo abaixo.",
  gerente: "Toda a operação (contratos, financeiro, relatórios, site). Sem usuários nem configurações.",
  operador: "Dia a dia: cadastros, contratos, cobranças e manutenções. Sem despesas nem relatórios.",
  site: "Só imóveis, fotos e publicação no site. Não vê contratos nem financeiro.",
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

/** Primeira página que o papel pode abrir (para onde redirecionar quem não tem acesso). */
export function homeFor(role: string | null | undefined) {
  return can(role, "contratos") ? "/" : "/imoveis";
}
