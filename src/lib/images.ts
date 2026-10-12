import sharp from "sharp";

export type DetectedFile =
  | { kind: "image"; mime: string }
  | { kind: "pdf"; mime: "application/pdf" }
  | { kind: "heic"; mime: "image/heic" }
  | { kind: "document"; mime: string };

const OFFICE_MIME: Record<string, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text",
  doc: "application/msword",
  xls: "application/vnd.ms-excel",
  ppt: "application/vnd.ms-powerpoint",
};

/**
 * Identifica o tipo real pelo conteúdo (não confia no Content-Type enviado pelo navegador).
 * Para documentos do Office (zip/OLE), a extensão do nome original desempata entre
 * docx/xlsx/pptx/odt (zip) ou doc/xls/ppt (OLE) — o "nomeOriginal" nunca é o que decide
 * sozinho se o arquivo é aceito, só qual MIME usar dentro do contêiner já validado.
 */
export function detectFileType(buf: Buffer, nomeOriginal = ""): DetectedFile | null {
  if (buf.length < 12) return null;
  const ascii = (start: number, end: number) => buf.toString("ascii", start, end);
  const extensao = nomeOriginal.split(".").pop()?.toLowerCase() ?? "";

  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { kind: "image", mime: "image/jpeg" };
  if (buf[0] === 0x89 && ascii(1, 4) === "PNG") return { kind: "image", mime: "image/png" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { kind: "image", mime: "image/webp" };
  if (ascii(0, 4) === "GIF8") return { kind: "image", mime: "image/gif" };
  if (ascii(0, 5) === "%PDF-") return { kind: "pdf", mime: "application/pdf" };
  if (ascii(4, 8) === "ftyp") {
    const brand = ascii(8, 12);
    if (brand === "avif" || brand === "avis") return { kind: "image", mime: "image/avif" };
    if (["heic", "heix", "hevc", "heim", "heis", "mif1", "msf1"].includes(brand)) {
      return { kind: "heic", mime: "image/heic" };
    }
  }

  // DOCX/XLSX/PPTX/ODT são, por dentro, um arquivo ZIP (assinatura "PK").
  const assinaturaZip = buf[0] === 0x50 && buf[1] === 0x4b && [0x03, 0x05, 0x07].includes(buf[2]);
  if (assinaturaZip && ["docx", "xlsx", "pptx", "odt"].includes(extensao)) {
    return { kind: "document", mime: OFFICE_MIME[extensao] };
  }

  // DOC/XLS/PPT antigos (formato OLE Compound File).
  const assinaturaOle =
    buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0 && buf[4] === 0xa1 && buf[5] === 0xb1;
  if (assinaturaOle && ["doc", "xls", "ppt"].includes(extensao)) {
    return { kind: "document", mime: OFFICE_MIME[extensao] };
  }

  return null;
}

/**
 * Corrige a rotação da foto do celular, limita o tamanho, converte para WebP
 * e gera a miniatura. Os metadados (inclusive GPS) são descartados.
 */
export async function processImage(input: Buffer) {
  const base = sharp(input, { failOn: "error" }).rotate();
  const main = await base
    .clone()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  const thumb = await base
    .clone()
    .resize({ width: 480, height: 360, fit: "cover" })
    .webp({ quality: 72 })
    .toBuffer();
  return { data: main.data, width: main.info.width, height: main.info.height, thumb };
}

/** Foto de perfil: recorte quadrado centrado no rosto/assunto, 512px, WebP, sem metadados. */
export async function processAvatar(input: Buffer) {
  const base = sharp(input, { failOn: "error" }).rotate();
  const data = await base
    .clone()
    .resize({ width: 512, height: 512, fit: "cover", position: "attention" })
    .webp({ quality: 84 })
    .toBuffer();
  const thumb = await base
    .clone()
    .resize({ width: 160, height: 160, fit: "cover", position: "attention" })
    .webp({ quality: 78 })
    .toBuffer();
  return { data, thumb };
}
