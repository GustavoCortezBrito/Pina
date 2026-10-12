import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { detectFileType, processAvatar } from "@/lib/images";
import { can, ROLES } from "@/lib/permissions";
import { getSession } from "@/lib/session";
import { storage } from "@/lib/storage";

const MAX_BYTES = 10 * 1024 * 1024;

type Tipo = "pessoa" | "usuario";

function erro(mensagem: string, status = 400) {
  return NextResponse.json({ ok: false, error: mensagem }, { status });
}

async function autorizado(session: NonNullable<Awaited<ReturnType<typeof getSession>>>, tipo: Tipo, id: string) {
  if (tipo === "usuario") return id === session.user.id || session.user.role === ROLES.ADMIN;
  return can(session.user.role, "pessoas");
}

async function remover(tipo: Tipo, id: string) {
  const antigos = await db.arquivo.findMany({
    where: { categoria: "FOTO_PERFIL", ...(tipo === "pessoa" ? { pessoaId: id } : { usuarioId: id }) },
  });
  if (antigos.length === 0) return;
  await db.arquivo.deleteMany({ where: { id: { in: antigos.map((a) => a.id) } } });
  await Promise.all(
    antigos.flatMap((a) => [a.caminho, a.caminhoThumb].filter(Boolean).map((c) => storage.remove(c as string).catch(() => undefined))),
  );
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return erro("Sessão expirada. Entre novamente.", 401);

  const form = await request.formData();
  const tipo = String(form.get("tipo")) as Tipo;
  const id = String(form.get("id") ?? "");
  const arquivo = form.get("arquivo");
  if (!["pessoa", "usuario"].includes(tipo) || !id) return erro("Pedido inválido.");
  if (!(await autorizado(session, tipo, id))) return erro("Sem permissão para alterar esta foto.", 403);
  if (!(arquivo instanceof File)) return erro("Escolha uma imagem.");
  if (arquivo.size > MAX_BYTES) return erro("A imagem passa de 10 MB.");

  const existe =
    tipo === "pessoa"
      ? await db.pessoa.findUnique({ where: { id }, select: { id: true } })
      : await db.user.findUnique({ where: { id }, select: { id: true } });
  if (!existe) return erro("Registro não encontrado.", 404);

  const buffer = Buffer.from(await arquivo.arrayBuffer());
  const detectado = detectFileType(buffer, arquivo.name);
  if (detectado?.kind === "heic") {
    return erro("Foto em HEIC. No iPhone, ajuste Câmera → Formatos → \"Mais compatível\", ou envie como JPG.");
  }
  if (detectado?.kind !== "image") return erro("Envie uma foto em JPG, PNG ou WebP.");

  let imagem;
  try {
    imagem = await processAvatar(buffer);
  } catch {
    return erro("Não consegui ler essa imagem. Tente outra foto.");
  }

  await remover(tipo, id);
  const base = `perfil/${tipo}/${id}/${randomUUID()}`;
  await storage.save(`${base}.webp`, imagem.data);
  await storage.save(`${base}-thumb.webp`, imagem.thumb);
  const criado = await db.arquivo.create({
    data: {
      categoria: "FOTO_PERFIL",
      nomeOriginal: arquivo.name.slice(0, 200),
      caminho: `${base}.webp`,
      caminhoThumb: `${base}-thumb.webp`,
      mime: "image/webp",
      tamanho: imagem.data.byteLength,
      largura: 512,
      altura: 512,
      capa: true,
      enviadoPorId: session.user.id,
      ...(tipo === "pessoa" ? { pessoaId: id } : { usuarioId: id }),
    },
    select: { id: true },
  });
  if (tipo === "usuario") await db.user.update({ where: { id }, data: { image: `/api/arquivos/${criado.id}?thumb=1` } });

  await audit({
    usuarioId: session.user.id,
    acao: "PHOTO",
    entidade: tipo === "pessoa" ? "Pessoa" : "User",
    entidadeId: id,
  });
  return NextResponse.json({ ok: true, id: criado.id });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return erro("Sessão expirada. Entre novamente.", 401);

  const url = new URL(request.url);
  const tipo = String(url.searchParams.get("tipo")) as Tipo;
  const id = url.searchParams.get("id") ?? "";
  if (!["pessoa", "usuario"].includes(tipo) || !id) return erro("Pedido inválido.");
  if (!(await autorizado(session, tipo, id))) return erro("Sem permissão para alterar esta foto.", 403);

  await remover(tipo, id);
  if (tipo === "usuario") await db.user.update({ where: { id }, data: { image: null } });
  await audit({
    usuarioId: session.user.id,
    acao: "PHOTO_REMOVE",
    entidade: tipo === "pessoa" ? "Pessoa" : "User",
    entidadeId: id,
  });
  return NextResponse.json({ ok: true });
}
