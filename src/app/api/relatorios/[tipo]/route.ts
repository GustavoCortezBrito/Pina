import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { construirRelatorio } from "@/features/relatorios/export/definicoes";
import { resolverPeriodo } from "@/features/relatorios/periodos";
import { gerarExcel } from "@/features/relatorios/export/excel";
import { today } from "@/lib/dates";
import { RelatorioDocument } from "@/lib/pdf/relatorio";
import { can } from "@/lib/permissions";
import { getSession } from "@/lib/session";

export async function GET(request: Request, ctx: RouteContext<"/api/relatorios/[tipo]">) {
  const session = await getSession();
  if (!session) return new NextResponse("Não autorizado", { status: 401 });
  if (!can(session.user.role, "relatorios")) return new NextResponse("Sem permissão", { status: 403 });

  const { tipo } = await ctx.params;
  const url = new URL(request.url);
  const formato = url.searchParams.get("formato") === "pdf" ? "pdf" : "xlsx";
  const periodo = resolverPeriodo({
    periodo: url.searchParams.get("periodo") ?? undefined,
    de: url.searchParams.get("de") ?? undefined,
    ate: url.searchParams.get("ate") ?? undefined,
  });
  const anoParam = Number(url.searchParams.get("ano"));
  const ano = Number.isInteger(anoParam) && anoParam > 2000 && anoParam < 2100 ? anoParam : today().getUTCFullYear();
  const imovelId = url.searchParams.get("imovel") || undefined;

  const relatorio = await construirRelatorio(tipo, { periodo, ano, imovelId });
  if (!relatorio) return new NextResponse("Relatório não encontrado", { status: 404 });

  const nome = `${relatorio.slug}-${today().toISOString().slice(0, 10)}`;

  if (formato === "pdf") {
    const buffer = await renderToBuffer(RelatorioDocument({ relatorio }));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${nome}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const buffer = await gerarExcel(relatorio);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nome}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
