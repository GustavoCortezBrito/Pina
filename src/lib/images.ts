import sharp from "sharp";

export type DetectedFile =
  | { kind: "image"; mime: string }
  | { kind: "pdf"; mime: "application/pdf" }
  | { kind: "heic"; mime: "image/heic" };

/** Identifica o tipo real pelo conteúdo (não confia na extensão enviada). */
export function detectFileType(buf: Buffer): DetectedFile | null {
  if (buf.length < 12) return null;
  const ascii = (start: number, end: number) => buf.toString("ascii", start, end);
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
