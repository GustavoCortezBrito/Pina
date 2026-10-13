import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { montarDocumentoContrato } from "@/features/contratos/documento";
import { ContratoDocument } from "@/lib/pdf/contrato";
import { getSession } from "@/lib/session";

export async function GET(request: Request, ctx: RouteContext<"/api/pdf/contrato/[id]">) {
  const session = await getSession();
  if (!session) return new NextResponse("Não autorizado", { status: 401 });

  const { id } = await ctx.params;
  const doc = await montarDocumentoContrato(id);
  if (!doc) return new NextResponse("Contrato não encontrado", { status: 404 });

  const buffer = await renderToBuffer(
    ContratoDocument({ titulo: doc.titulo, locadorNome: doc.locadorNome, conteudo: doc.conteudo }),
  );

  const download = new URL(request.url).searchParams.has("download");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="contrato-${doc.numero}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
