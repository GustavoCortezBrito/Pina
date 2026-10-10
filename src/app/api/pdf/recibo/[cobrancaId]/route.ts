import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatEndereco, formatNumeroContrato } from "@/lib/format";
import { ReciboDocument } from "@/lib/pdf/recibo";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings";

export async function GET(request: Request, ctx: RouteContext<"/api/pdf/recibo/[cobrancaId]">) {
  const session = await getSession();
  if (!session) return new NextResponse("Não autorizado", { status: 401 });

  const { cobrancaId } = await ctx.params;
  const cobranca = await db.cobranca.findUnique({
    where: { id: cobrancaId },
    include: {
      pagamentos: { orderBy: { criadoEm: "desc" } },
      contrato: {
        include: {
          imovel: true,
          partes: {
            where: { papel: "LOCATARIO" },
            orderBy: { principal: "desc" },
            take: 1,
            include: { pessoa: true },
          },
        },
      },
    },
  });

  if (!cobranca) return new NextResponse("Cobrança não encontrada", { status: 404 });

  const pagamento = cobranca.pagamentos.find((p) => p.valorPago > 0);
  if (!pagamento) return new NextResponse("Esta cobrança ainda não tem pagamento registrado.", { status: 404 });

  const locatario = cobranca.contrato.partes[0]?.pessoa;
  const settings = await getSettings();

  const buffer = await renderToBuffer(
    ReciboDocument({
      data: {
        numero: `${formatNumeroContrato(cobranca.contrato.numero)}-${cobranca.id.slice(-5).toUpperCase()}`,
        locador: settings.locador,
        locatarioNome: locatario?.nome ?? "—",
        locatarioDocumento: locatario?.documento ?? "",
        imovelTitulo: cobranca.contrato.imovel.titulo,
        imovelEndereco: formatEndereco(cobranca.contrato.imovel),
        competencia: cobranca.competencia,
        dataPagamento: pagamento.dataPagamento,
        valorPrincipal: pagamento.valorPrincipal,
        valorMulta: pagamento.valorMulta,
        valorJuros: pagamento.valorJuros,
        valorPago: pagamento.valorPago,
        forma: pagamento.forma,
      },
    }),
  );

  const url = new URL(request.url);
  const download = url.searchParams.has("download");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="recibo-${cobrancaId}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
