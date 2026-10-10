import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { MODELO_COMERCIAL_PADRAO, MODELO_RESIDENCIAL_PADRAO } from "@/features/contratos/default-templates";
import { montarVariaveisContrato, substituirVariaveis } from "@/features/contratos/template";
import { obterContratoParaPdf } from "@/features/contratos/queries";
import { formatNumeroContrato } from "@/lib/format";
import { ContratoDocument } from "@/lib/pdf/contrato";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings";

export async function GET(request: Request, ctx: RouteContext<"/api/pdf/contrato/[id]">) {
  const session = await getSession();
  if (!session) return new NextResponse("Não autorizado", { status: 401 });

  const { id } = await ctx.params;
  const contrato = await obterContratoParaPdf(id);
  if (!contrato) return new NextResponse("Contrato não encontrado", { status: 404 });

  const settings = await getSettings();
  const variaveis = montarVariaveisContrato(contrato, settings.locador);
  // Modelo cadastrado por texto > modelo padrão do sistema para a finalidade (um modelo
  // "por arquivo" cadastrado não tem texto para substituir variáveis, então também cai aqui).
  const modeloPadraoSistema =
    contrato.finalidade === "COMERCIAL" ? MODELO_COMERCIAL_PADRAO : MODELO_RESIDENCIAL_PADRAO;
  const conteudo = substituirVariaveis(contrato.modelo?.conteudo ?? modeloPadraoSistema, variaveis);
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
