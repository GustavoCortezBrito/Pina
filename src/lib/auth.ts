import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware, isAPIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { criarProtecaoLogin, type ProtecaoLogin } from "@/lib/protecao-login";
import { SENHA_MAX, SENHA_MIN, validarSenha } from "@/lib/senha";

import { ROLES } from "@/lib/permissions";

export { ROLES };

// Em produção só vale o endereço do sistema (BETTER_AUTH_URL) e o que estiver em TRUSTED_ORIGINS
// (separados por vírgula). Túneis de teste (ngrok) e localhost só são aceitos no desenvolvimento:
// em produção, qualquer pessoa poderia criar um subdomínio ngrok e se passar por origem confiável.
const emProducao = process.env.NODE_ENV === "production";
const origensExtras = (process.env.TRUSTED_ORIGINS?.split(",") ?? []).map((o) => o.trim()).filter(Boolean);
const origensDeDesenvolvimento = [
  "http://localhost:*",
  "http://127.0.0.1:*",
  "https://*.ngrok-free.app",
  "https://*.ngrok.app",
  "https://*.ngrok.io",
];

// O estado da proteção precisa sobreviver às recargas do desenvolvimento (um módulo, uma memória).
const global = globalThis as unknown as { __protecaoLogin?: ProtecaoLogin };
const protecao = (global.__protecaoLogin ??= criarProtecaoLogin());

/** Rotas do Better Auth em que uma senha nova é gravada. */
const ROTAS_COM_SENHA_NOVA = new Set([
  "/change-password",
  "/set-password",
  "/reset-password",
  "/admin/create-user",
  "/admin/set-user-password",
]);

type CorpoComum = { email?: unknown; password?: unknown; newPassword?: unknown; name?: unknown };

export const auth = betterAuth({
  appName: "PinaSystem",
  database: prismaAdapter(db, { provider: "postgresql" }),
  trustedOrigins: [...(emProducao ? [] : origensDeDesenvolvimento), ...origensExtras],
  emailAndPassword: {
    enabled: true,
    // Sistema interno: só o administrador cria contas.
    disableSignUp: true,
    minPasswordLength: SENHA_MIN,
    maxPasswordLength: SENHA_MAX,
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
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const corpo = (ctx.body ?? {}) as CorpoComum;

      if (ctx.path === "/sign-in/email" && typeof corpo.email === "string") {
        const estado = protecao.verificar(corpo.email, enderecoDe(ctx));
        if (estado.bloqueado) {
          const minutos = Math.max(1, Math.ceil(estado.segundos / 60));
          throw new APIError("TOO_MANY_REQUESTS", {
            message: `Muitas tentativas com essa conta. Tente de novo em ${minutos} minuto${minutos > 1 ? "s" : ""}.`,
          });
        }
      }

      if (ROTAS_COM_SENHA_NOVA.has(ctx.path)) {
        const erro = validarSenha(corpo.newPassword ?? corpo.password, {
          email: typeof corpo.email === "string" ? corpo.email : undefined,
          nome: typeof corpo.name === "string" ? corpo.name : undefined,
        });
        if (erro) throw new APIError("BAD_REQUEST", { message: erro });
      }
    }),

    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;
      const corpo = (ctx.body ?? {}) as CorpoComum;
      if (typeof corpo.email !== "string") return;
      const email = corpo.email;
      const retorno = ctx.context.returned;

      if (!isAPIError(retorno)) {
        protecao.sucesso(email, enderecoDe(ctx));
        return;
      }
      // Só senha/e-mail errados contam. A recusa que nós mesmos damos ao bloqueio (429), o limite
      // por endereço e um usuário desativado (403) não entram na conta.
      if (retorno.statusCode !== 401) return;

      const { total, bloqueouAgora } = protecao.falhou(email);
      if (total !== 3 && !bloqueouAgora) return;
      // Só registra para contas que existem: e-mail digitado errado (ou senha colada no campo de
      // e-mail) não vai para o histórico.
      const usuario = await db.user.findUnique({ where: { email: email.trim().toLowerCase() }, select: { id: true } });
      if (!usuario) return;
      await audit({
        usuarioId: usuario.id,
        acao: bloqueouAgora ? "LOGIN_BLOQUEADO" : "LOGIN_FALHA",
        entidade: "User",
        entidadeId: usuario.id,
        dados: { tentativas: total, endereco: enderecoDe(ctx) },
      });
    }),
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

/** Endereço de quem fez o pedido. Atrás do Caddy o X-Forwarded-For traz só o endereço real (ele descarta o que o cliente mandar). */
function enderecoDe(ctx: { request?: Request; headers?: Headers }) {
  const cabecalhos = ctx.request?.headers ?? ctx.headers;
  return cabecalhos?.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

export type SessionUser = typeof auth.$Infer.Session.user;
