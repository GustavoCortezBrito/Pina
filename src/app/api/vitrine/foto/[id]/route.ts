import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage";

/**
 * Foto pública da vitrine. Só serve FOTO de imóvel publicado e disponível;
 * qualquer outro arquivo (documentos, contratos, fotos de perfil) continua exigindo login.
 */
export async function GET(request: Request, ctx: RouteContext<"/api/vitrine/foto/[id]">) {
  const { id } = await ctx.params;
  const arquivo = await db.arquivo.findFirst({
    where: {
      id,
      categoria: "FOTO",
      imovel: { deletadoEm: null, publicadoNoSite: true, status: "DISPONIVEL" },
    },
    select: { caminho: true, caminhoThumb: true },
  });
  if (!arquivo) return new NextResponse("Não encontrado", { status: 404 });

  const grande = new URL(request.url).searchParams.has("grande");
  const caminho = !grande && arquivo.caminhoThumb ? arquivo.caminhoThumb : arquivo.caminho;

  try {
    const conteudo = await storage.read(caminho);
    return new NextResponse(new Uint8Array(conteudo), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(conteudo.byteLength),
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Indisponível", { status: 404 });
  }
}
