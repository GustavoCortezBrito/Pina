import type { Prisma } from "@/generated/prisma/client";
import { db, type Tx } from "@/lib/db";

type AuditEntry = {
  usuarioId?: string | null;
  acao: string;
  entidade: string;
  entidadeId?: string | null;
  dados?: Prisma.InputJsonValue;
};

/** Registra uma alteração na trilha de auditoria (LGPD / histórico). */
export async function audit(entry: AuditEntry, client: Tx | typeof db = db) {
  await client.auditLog.create({
    data: {
      usuarioId: entry.usuarioId ?? null,
      acao: entry.acao,
      entidade: entry.entidade,
      entidadeId: entry.entidadeId ?? null,
      dados: entry.dados,
    },
  });
}
