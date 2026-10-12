import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth, ROLES } from "@/lib/auth";
import { can, homeFor, type Modulo } from "@/lib/permissions";
import { AppError } from "@/lib/errors";

export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/** Usuário logado; redireciona para /login se não houver sessão. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== ROLES.ADMIN) {
    throw new AppError("Apenas administradores podem fazer isso.");
  }
  return user;
}

/** Para páginas: manda operadores de volta ao painel. */
export async function requireAdminPage() {
  const user = await requireUser();
  if (user.role !== ROLES.ADMIN) redirect(homeFor(user.role));
  return user;
}

export function isAdmin(user: { role?: string | null }) {
  return user.role === ROLES.ADMIN;
}

/** Garante, numa Server Action, que o papel do usuário acessa o módulo. */
export async function requireAccess(modulo: Modulo) {
  const user = await requireUser();
  if (!can(user.role, modulo)) {
    throw new AppError("Seu perfil não tem permissão para isso.");
  }
  return user;
}

/** Para páginas/layouts: redireciona quem não tem acesso ao módulo. */
export async function requireAccessPage(modulo: Modulo) {
  const user = await requireUser();
  if (!can(user.role, modulo)) redirect(homeFor(user.role));
  return user;
}
