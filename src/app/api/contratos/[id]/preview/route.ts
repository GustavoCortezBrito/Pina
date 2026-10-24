import { NextResponse } from "next/server";
import { montarDocumentoContrato } from "@/features/contratos/documento";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { getSession } from "@/lib/session";

/** Texto do contrato já preenchido, para a janela de visualização. */
export async function GET(_request: Request, ctx: RouteContext<"/api/contratos/[id]/preview">) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!can(session.user.role, "contratos")) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { id } = await ctx.params;
  const importado = await db.contrato.findUnique({
    where: { id },
    select: {
      importado: true,
      numero: true,
      arquivos: {
        where: { categoria: "CONTRATO_ASSINADO" },
        orderBy: { criadoEm: "desc" },
        take: 1,
        select: { id: true, mime: true, nomeOriginal: true },
      },
    },
  });
  if (importado?.importado) {
    return NextResponse.json(
      { tipo: "arquivo", titulo: `Contrato nº ${String(importado.numero).padStart(4, "0")}`, arquivo: importado.arquivos[0] ?? null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }
  const doc = await montarDocumentoContrato(id);
  if (!doc) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });

  return NextResponse.json(doc, { headers: { "Cache-Control": "private, no-store" } });
}
