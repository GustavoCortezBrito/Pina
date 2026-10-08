import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { db } from "@/lib/db";

export const ROLES = { ADMIN: "admin", OPERADOR: "operador" } as const;

export const auth = betterAuth({
  appName: "PinaSystem",
  database: prismaAdapter(db, { provider: "postgresql" }),
  // Em produção vale só a BETTER_AUTH_URL; no desenvolvimento o Next pode subir em outra porta.
  trustedOrigins:
    process.env.NODE_ENV === "development" ? ["http://localhost:*", "http://127.0.0.1:*"] : [],
  emailAndPassword: {
    enabled: true,
    // Sistema interno: só o administrador cria contas.
    disableSignUp: true,
    minPasswordLength: 8,
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
