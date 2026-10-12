import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { CategoriaArquivo } from "@/generated/prisma/enums";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { detectFileType, processImage } from "@/lib/images";
import { getSession } from "@/lib/session";
import { storage } from "@/lib/storage";

/** Entidades que aceitam anexos e a coluna correspondente em Arquivo. */
const ENTIDADES = {
  imovel: "imovelId",
  pessoa: "pessoaId",
  contrato: "contratoId",
  pagamento: "pagamentoId",
  despesa: "despesaId",
  manutencao: "manutencaoId",
  vistoria: "vistoriaId",
} as const;

type Entidade = keyof typeof ENTIDADES;

const CATEGORIAS: CategoriaArquivo[] = [
  "FOTO",
  "DOCUMENTO",
  "CONTRATO_ASSINADO",
  "COMPROVANTE",
  "VISTORIA",
  "OUTRO",
];

const MAX_IMAGEM = 15 * 1024 * 1024;
const MAX_PDF = 25 * 1024 * 1024;
const MAX_DOCUMENTO = 25 * 1024 * 1024;

async function entidadeExiste(entidade: Entidade, id: string) {
  const where = { where: { id }, select: { id: true } } as const;
  switch (entidade) {
    case "imovel":
      return db.imovel.findUnique(where);
    case "pessoa":
      return db.pessoa.findUnique(where);
    case "contrato":
      return db.contrato.findUnique(where);
    case "pagamento":
      return db.pagamento.findUnique(where);
    case "despesa":
      return db.despesa.findUnique(where);
    case "manutencao":
      return db.manutencao.findUnique(where);
    case "vistoria":
      return db.vistoria.findUnique(where);
  }
}

function erro(mensagem: string, status = 400) {
  return NextResponse.json({ ok: false, error: mensagem }, { status });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return erro("Sessão expirada. Entre novamente.", 401);

  const form = await request.formData();
  const entidade = String(form.get("entidade") ?? "") as Entidade;
  const entidadeId = String(form.get("entidadeId") ?? "");
  const categoria = String(form.get("categoria") ?? "DOCUMENTO") as CategoriaArquivo;
  const arquivos = form.getAll("arquivos").filter((item): item is File => item instanceof File);

  if (!(entidade in ENTIDADES)) return erro("Entidade inválida.");
  if (!CATEGORIAS.includes(categoria)) return erro("Categoria inválida.");
  if (!entidadeId || !(await entidadeExiste(entidade, entidadeId))) return erro("Registro não encontrado.", 404);
  if (arquivos.length === 0) return erro("Nenhum arquivo enviado.");

  const campo = ENTIDADES[entidade];
  const agregado = await db.arquivo.aggregate({
    where: { [campo]: entidadeId, categoria },
    _max: { ordem: true },
    _count: true,
  });
  let ordem = (agregado._max.ordem ?? -1) + 1;
  let precisaCapa = categoria === "FOTO" && agregado._count === 0;

  const criados = [];
  for (const arquivo of arquivos) {
    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const tipo = detectFileType(buffer, arquivo.name);

    if (!tipo) {
      return erro(
        `"${arquivo.name}": formato não suportado. Envie JPG, PNG, WebP, PDF, Word (doc/docx) ou Excel (xls/xlsx).`,
      );
    }
    if (tipo.kind === "heic") {
      return erro(
        `"${arquivo.name}" está em HEIC. No iPhone, ajuste Câmera → Formatos → "Mais compatível", ou envie como JPG.`,
      );
    }
    if (tipo.kind === "pdf" && buffer.byteLength > MAX_PDF) return erro(`"${arquivo.name}" passa de 25 MB.`);
    if (tipo.kind === "image" && buffer.byteLength > MAX_IMAGEM) return erro(`"${arquivo.name}" passa de 15 MB.`);
    if (tipo.kind === "document" && buffer.byteLength > MAX_DOCUMENTO) {
      return erro(`"${arquivo.name}" passa de 25 MB.`);
    }

    const id = randomUUID();
    const base = `${entidade}/${entidadeId}/${id}`;
    let dados: {
      caminho: string;
      caminhoThumb: string | null;
      mime: string;
      tamanho: number;
      largura: number | null;
      altura: number | null;
    };

    if (tipo.kind === "image") {
      const imagem = await processImage(buffer);
      await storage.save(`${base}.webp`, imagem.data);
      await storage.save(`${base}-thumb.webp`, imagem.thumb);
      dados = {
        caminho: `${base}.webp`,
        caminhoThumb: `${base}-thumb.webp`,
        mime: "image/webp",
        tamanho: imagem.data.byteLength,
        largura: imagem.width,
        altura: imagem.height,
      };
    } else {
      const extensao = tipo.kind === "pdf" ? "pdf" : (arquivo.name.split(".").pop()?.toLowerCase() ?? "bin");
      await storage.save(`${base}.${extensao}`, buffer);
      dados = {
        caminho: `${base}.${extensao}`,
        caminhoThumb: null,
        mime: tipo.mime,
        tamanho: buffer.byteLength,
        largura: null,
        altura: null,
      };
    }

    const criado = await db.arquivo.create({
      data: {
        ...dados,
        categoria,
        nomeOriginal: arquivo.name.slice(0, 200),
        ordem: ordem++,
        capa: precisaCapa,
        enviadoPorId: session.user.id,
        [campo]: entidadeId,
      },
      select: { id: true, nomeOriginal: true },
    });
    precisaCapa = false;
    await audit({
      usuarioId: session.user.id,
      acao: "UPLOAD",
      entidade: "Arquivo",
      entidadeId: criado.id,
      dados: { nome: criado.nomeOriginal, categoria, [campo]: entidadeId },
    });
    criados.push(criado);
  }

  return NextResponse.json({ ok: true, arquivos: criados });
}
