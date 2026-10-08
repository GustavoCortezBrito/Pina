import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { storage } from "@/lib/storage";

/** Arquivos nunca ficam em /public: só saem daqui, e apenas para quem está logado. */
export async function GET(request: Request, ctx: RouteContext<"/api/arquivos/[id]">) {
  const session = await getSession();
  if (!session) return new NextResponse("Não autorizado", { status: 401 });

  const { id } = await ctx.params;
  const arquivo = await db.arquivo.findUnique({ where: { id } });
  if (!arquivo) return new NextResponse("Arquivo não encontrado", { status: 404 });

  const url = new URL(request.url);
  const usarThumb = url.searchParams.has("thumb") && arquivo.caminhoThumb;
  const caminho = usarThumb ? arquivo.caminhoThumb! : arquivo.caminho;

  let conteudo: Buffer;
  try {
    conteudo = await storage.read(caminho);
  } catch {
    return new NextResponse("Arquivo indisponível", { status: 404 });
  }

  const download = url.searchParams.has("download");
  const nome = arquivo.nomeOriginal.replace(/[^\w.\-() ]+/g, "_");

  return new NextResponse(new Uint8Array(conteudo), {
    headers: {
      "Content-Type": usarThumb ? "image/webp" : arquivo.mime,
      "Content-Length": String(conteudo.byteLength),
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${nome}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
