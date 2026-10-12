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

function normalizar(valor: unknown): unknown {
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  if (valor && typeof valor === "object" && "toString" in valor && valor.constructor?.name === "Decimal") {
    return String(valor);
  }
  return valor ?? null;
}

/** Campos que mudaram entre o registro antigo e os dados novos: { campo: { de, para } }. */
export function diffCampos(antes: object, depois: object): Prisma.InputJsonValue {
  const a = antes as Record<string, unknown>;
  const resultado: Record<string, { de: unknown; para: unknown }> = {};
  for (const [campo, novo] of Object.entries(depois)) {
    if (!(campo in a)) continue;
    const de = normalizar(a[campo]);
    const para = normalizar(novo);
    if (JSON.stringify(de) !== JSON.stringify(para)) resultado[campo] = { de, para };
  }
  return { alteracoes: resultado } as Prisma.InputJsonValue;
}
