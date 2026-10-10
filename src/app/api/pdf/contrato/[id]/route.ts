import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { montarVariaveisContrato, substituirVariaveis } from "@/features/contratos/template";
import { obterContratoParaPdf } from "@/features/contratos/queries";
import { formatNumeroContrato } from "@/lib/format";
import { ContratoDocument } from "@/lib/pdf/contrato";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings";

const MODELO_FALLBACK = `# CONTRATO DE LOCAÇÃO

Nenhum modelo de contrato foi configurado para esta finalidade. Cadastre um modelo em Configurações → Modelos de contrato e marque-o como padrão.`;

export async function GET(request: Request, ctx: RouteContext<"/api/pdf/contrato/[id]">) {
  const session = await getSession();
  if (!session) return new NextResponse("Não autorizado", { status: 401 });

  const { id } = await ctx.params;
  const contrato = await obterContratoParaPdf(id);
  if (!contrato) return new NextResponse("Contrato não encontrado", { status: 404 });

  const settings = await getSettings();
  const variaveis = montarVariaveisContrato(contrato, settings.locador);
  const conteudo = substituirVariaveis(contrato.modelo?.conteudo ?? MODELO_FALLBACK, variaveis);
  const titulo = `Contrato nº ${formatNumeroContrato(contrato.numero)}`;

  const buffer = await renderToBuffer(
    ContratoDocument({ titulo, locadorNome: settings.locador.nome, conteudo }),
  );

  const url = new URL(request.url);
  const download = url.searchParams.has("download");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="contrato-${formatNumeroContrato(contrato.numero)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
