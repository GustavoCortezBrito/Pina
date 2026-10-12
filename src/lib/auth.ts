import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";

import { ROLES } from "@/lib/permissions";

export { ROLES };

export const auth = betterAuth({
  appName: "PinaSystem",
  database: prismaAdapter(db, { provider: "postgresql" }),
  // Em produção vale a BETTER_AUTH_URL; endereços extras (ex.: um túnel de teste) entram em
  // TRUSTED_ORIGINS, separados por vírgula. No desenvolvimento o Next pode subir em outra porta.
  trustedOrigins: [
    "http://localhost:*",
    "http://127.0.0.1:*",
    "https://*.ngrok-free.app",
    "https://*.ngrok.app",
    "https://*.ngrok.io",
    ...(process.env.TRUSTED_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? []),
  ],
  emailAndPassword: {
    enabled: true,
    // Sistema interno: só o administrador cria contas.
    disableSignUp: true,
    minPasswordLength: 8,
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          await audit({ usuarioId: session.userId, acao: "LOGIN", entidade: "User", entidadeId: session.userId });
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
    },
  },
  plugins: [
    admin({
      defaultRole: ROLES.OPERADOR,
      adminRoles: [ROLES.ADMIN],
      bannedUserMessage: "Usuário desativado. Fale com o administrador.",
    }),
    // Precisa ser o último plugin: grava os cookies em Server Actions.
    nextCookies(),
  ],
});

export type SessionUser = typeof auth.$Infer.Session.user;
