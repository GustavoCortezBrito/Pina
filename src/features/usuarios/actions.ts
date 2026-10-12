"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { runAction } from "@/lib/action";
import { audit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { ROLES } from "@/lib/permissions";
import { requireAdmin } from "@/lib/session";

const papelSchema = z.enum([ROLES.ADMIN, ROLES.GERENTE, ROLES.OPERADOR, ROLES.SITE]);

const novoUsuarioSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome").max(120),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(8, "A senha precisa de ao menos 8 caracteres").max(128),
  role: papelSchema,
});

// O plugin admin tipa só "admin" | "user"; ele aceita qualquer papel textual, e a hierarquia real vive em lib/permissions.
export async function criarUsuario(input: unknown) {
  return runAction(
    async () => {
      const admin = await requireAdmin();
      const dados = novoUsuarioSchema.parse(input);
      const criado = await auth.api.createUser({
        body: { ...dados, role: dados.role as "admin" },
        headers: await headers(),
      });
      await audit({
        usuarioId: admin.id,
        acao: "CREATE",
        entidade: "User",
        entidadeId: criado.user.id,
        dados: { email: dados.email, role: dados.role },
      });
    },
    { message: "Usuário criado." },
  );
}

export async function alterarPapelUsuario(userId: string, role: string) {
  return runAction(
    async () => {
      const admin = await requireAdmin();
      const papel = papelSchema.parse(role);
      if (userId === admin.id) throw new AppError("Você não pode alterar o seu próprio perfil de acesso.");
      await auth.api.setRole({
        body: { userId, role: papel as "admin" },
        headers: await headers(),
      });
      await audit({
        usuarioId: admin.id,
        acao: "UPDATE_ROLE",
        entidade: "User",
        entidadeId: userId,
        dados: { role: papel },
      });
    },
    { message: "Perfil de acesso atualizado." },
  );
}

export async function alternarUsuarioAtivo(userId: string, ativo: boolean) {
  return runAction(
    async () => {
      const admin = await requireAdmin();
      if (userId === admin.id) throw new AppError("Você não pode desativar o seu próprio usuário.");
      const h = await headers();
      if (ativo) await auth.api.unbanUser({ body: { userId }, headers: h });
      else await auth.api.banUser({ body: { userId }, headers: h });
      await audit({
        usuarioId: admin.id,
        acao: ativo ? "ACTIVATE" : "DEACTIVATE",
        entidade: "User",
        entidadeId: userId,
      });
    },
    { message: ativo ? "Usuário reativado." : "Usuário desativado." },
  );
}

export async function redefinirSenhaUsuario(userId: string, novaSenha: string) {
  return runAction(
    async () => {
      const admin = await requireAdmin();
      const newPassword = z
        .string()
        .min(8, "A senha precisa de ao menos 8 caracteres")
        .max(128)
        .parse(novaSenha);
      await auth.api.setUserPassword({ body: { userId, newPassword }, headers: await headers() });
      await audit({ usuarioId: admin.id, acao: "RESET_PASSWORD", entidade: "User", entidadeId: userId });
    },
    { message: "Senha redefinida." },
  );
}
